import {i64,f64,f64Number,list,dict,equalValues,orderValues,formatNativeValue} from './values.js';
import {ensure,i32,bool,string,parseValue,readUnit,canonicalWireJSON} from './index.js';
import type {Expression,Value,ValueKind} from './index.js';
export function expressionChildren(e:Expression):Expression[] {
 const children:Expression[]=[];
 if('left'in e)children.push(e.left,e.right);
 if(e.op==='if')children.push(e.condition,e.yes,e.no);
 if(e.op==='neg'||e.op==='abs'||e.op==='not'||e.op==='format'||e.op==='floor'||e.op==='ceil'||e.op==='trunc'||e.op==='convert')children.push(e.value);
 if(e.op==='concat')children.push(...e.parts);
 if('text'in e)children.push(e.text);if('search'in e)children.push(e.search);
 if('start'in e)children.push(e.start,e.end);
 if('list'in e)children.push(e.list);if('dictionary'in e)children.push(e.dictionary);
 if('index'in e)children.push(e.index);if('item'in e)children.push(e.item);
 if('items'in e)children.push(...e.items);if('entries'in e)children.push(...e.entries.map(v=>v.value));
 if(e.op!=='profile'&&'key'in e)children.push(e.key);return children;
}
export function extendedExpression(e:Expression):boolean {return !['i32','bool','string'].includes(e.kind)||e.op.startsWith('list.')||e.op.startsWith('dict.')||expressionChildren(e).some(extendedExpression);}
export function validateExpressionTree(root:Expression,slotKind?:(id:string)=>ValueKind|undefined):ValueKind {
 let nodes=0;
 function visit(e:Expression,depth:number):void {
  ensure(++nodes<=512&&depth<=16,'EXPRESSION_SIZE','At most 512 nodes and 16 levels');
  if(e.op==='slot'&&slotKind)ensure(slotKind(e.id)===e.kind,'EXPRESSION_SLOT_KIND',e.id);
  if(e.op==='read')readUnit(e);if(e.op==='dict')ensure(new Set(e.entries.map(v=>v.key)).size===e.entries.length&&e.entries.every(v=>v.key.length>0&&v.key.length<=128&&!v.key.includes('\0')),'DICT_KEY','Duplicate or invalid dictionary key');
  const children=expressionChildren(e);
  for(const child of children)visit(child,depth+1);
 }
 visit(root,1);return root.kind;
}
export function templateSignature(speaker:Expression,content:Expression):string {validateExpressionTree(speaker);validateExpressionTree(content);const signature=canonicalWireJSON({speaker,content});ensure(signature.length<=65536,'TEMPLATE_SIZE','Template signature exceeds 65536 characters');return signature;}
export interface ExpressionContext {slot(id:string):Value|undefined;profile(key:string):Value|undefined;read(unit:string):boolean;}
export function evaluateExpression(root:Expression,context:ExpressionContext):Value {
 validateExpressionTree(root);
 function integer(e:Expression):number {const v=evaluate(e);ensure(v.kind==='i32','EXPRESSION_KIND','Expected i32');return v.value;}
 function flag(e:Expression):boolean {const v=evaluate(e);ensure(v.kind==='bool','EXPRESSION_KIND','Expected bool');return v.value;}
 function text(e:Expression):string {const v=evaluate(e);ensure(v.kind==='string','EXPRESSION_KIND','Expected string');return v.value;}
 function keyOf(e:Expression):string {const key=text(e);ensure(key.length>0&&key.length<=128&&!key.includes('\0'),'DICT_KEY','Key requires 1..128 UTF-16 units');return key;}
 function evaluate(e:Expression):Value {
  if(e.op==='literal')return parseValue({kind:e.kind,value:e.value});
  if(e.op==='slot'||e.op==='profile'){const v=e.op==='slot'?context.slot(e.id):context.profile(e.key);if(v===undefined){ensure(e.op==='profile','EXPRESSION_SLOT','Missing slot');return parseValue({kind:e.kind,value:e.fallback});}ensure(v.kind===e.kind,'EXPRESSION_VALUE_KIND',e.op==='slot'?e.id:e.key);return parseValue(v);}
  if(e.op==='if')return flag(e.condition)?evaluate(e.yes):evaluate(e.no);
  if(e.op==='convert'){const v=evaluate(e.value);ensure(v.kind===e.sourceKind,'EXPRESSION_KIND','Conversion source mismatch');const n=v.kind==='f64'?f64Number(v):v.kind==='i64'?BigInt(v.value):v.kind==='i32'?v.value:undefined;ensure(n!==undefined,'EXPRESSION_KIND','Numeric conversion only');if(e.kind==='f64')return f64(Number(n));if(e.kind==='i32')return i32(Number(n));ensure(typeof n==='bigint'||Number.isFinite(n)&&Number.isInteger(n),'EXPRESSION_CONVERSION','Conversion requires a finite integer');return i64(BigInt(n));}
  if(e.op==='list.at'){const container=evaluate(e.list),index=integer(e.index);ensure(container.kind==='list'&&index>=0&&index<container.value.length,'EXPRESSION_INDEX','List index out of range');const item=container.value[index];ensure(item&&item.kind===e.kind,'EXPRESSION_VALUE_KIND','List element kind mismatch');return parseValue(item);}
  if(e.op==='dict.get'||e.op==='dict.has'){const container=evaluate(e.dictionary),key=keyOf(e.key);ensure(container.kind==='dict','EXPRESSION_KIND','Expected dictionary');const item=container.value.find(v=>v.key===key);if(e.op==='dict.has')return bool(!!item);ensure(item,'EXPRESSION_DICT_MISSING','Dictionary key missing');ensure(item.value.kind===e.kind,'EXPRESSION_VALUE_KIND','Dictionary item kind mismatch');return parseValue(item.value);}
  if(e.op==='list.length'){const v=evaluate(e.list);ensure(v.kind==='list','EXPRESSION_KIND','Expected list');return i32(v.value.length);}
  if(e.op==='dict.size'){const v=evaluate(e.dictionary);ensure(v.kind==='dict','EXPRESSION_KIND','Expected dictionary');return i32(v.value.length);}
  if(e.kind==='i64'||e.kind==='f64'){
   const numeric=(value:Expression)=>{const v=evaluate(value);ensure(v.kind===e.kind,'EXPRESSION_KIND','Numeric kind mismatch');return v;};
   if(e.kind==='i64'){
    if(e.op==='neg'||e.op==='abs'){const v=numeric(e.value);ensure(v.kind==='i64','EXPRESSION_KIND','Expected i64');const n=BigInt(v.value);return i64(e.op==='neg'?-n:n<0n?-n:n);}
    ensure('left'in e,'EXPRESSION_OP','Expected binary arithmetic');const a=numeric(e.left),b=numeric(e.right);ensure(a.kind==='i64'&&b.kind==='i64','EXPRESSION_KIND','Expected i64');const x=BigInt(a.value),y=BigInt(b.value);if(e.op==='div'||e.op==='mod')ensure(y!==0n,'EXPRESSION_DIV_ZERO','i64 division by zero');switch(e.op){case 'add':return i64(x+y);case 'sub':return i64(x-y);case 'mul':return i64(x*y);case 'div':return i64(x/y);case 'mod':return i64(x%y);case 'min':return i64(x<y?x:y);case 'max':return i64(x>y?x:y);}
   }else{
    if(e.op==='neg'||e.op==='abs'||e.op==='floor'||e.op==='ceil'||e.op==='trunc'){const n=f64Number(numeric(e.value));return f64(e.op==='neg'?-n:e.op==='abs'?Math.abs(n):e.op==='floor'?Math.floor(n):e.op==='ceil'?Math.ceil(n):Math.trunc(n));}
    ensure('left'in e,'EXPRESSION_OP','Expected binary arithmetic');const x=f64Number(numeric(e.left)),y=f64Number(numeric(e.right));switch(e.op){case 'add':return f64(x+y);case 'sub':return f64(x-y);case 'mul':return f64(x*y);case 'div':return f64(x/y);case 'mod':return f64(x%y);case 'min':return f64(Math.min(x,y));case 'max':return f64(Math.max(x,y));}
   }
  }
  if(e.kind==='list'){
   if(e.op==='list')return list(e.items.map(evaluate));
   if(e.op==='dict.keys'){const v=evaluate(e.dictionary);ensure(v.kind==='dict','EXPRESSION_KIND','Expected dictionary');return list(v.value.map(v=>string(v.key)));}
   if(e.op==='list.concat'){const a=evaluate(e.left),b=evaluate(e.right);ensure(a.kind==='list'&&b.kind==='list','EXPRESSION_KIND','Expected lists');return list([...a.value,...b.value]);}
   const source=evaluate(e.list);ensure(source.kind==='list','EXPRESSION_KIND','Expected list');if(e.op==='list.push')return list([...source.value,evaluate(e.item)]);
   if(e.op==='list.slice'){const start=integer(e.start),end=integer(e.end);ensure(start>=0&&end>=start&&end<=source.value.length,'EXPRESSION_INDEX','Invalid list range');return list(source.value.slice(start,end));}
   const index=integer(e.index);ensure(index>=0&&index<source.value.length,'EXPRESSION_INDEX','List index out of range');const values=source.value.map(parseValue);values[index]=evaluate(e.item);return list(values);
  }
  if(e.kind==='dict'){
   if(e.op==='dict')return dict(e.entries.map(entry=>({key:entry.key,value:evaluate(entry.value)})));
   const source=evaluate(e.dictionary),key=keyOf(e.key);ensure(source.kind==='dict','EXPRESSION_KIND','Expected dictionary');if(e.op==='dict.remove')return dict(source.value.filter(v=>v.key!==key));
   const values=source.value.map(v=>({key:v.key,value:parseValue(v.value)})),index=values.findIndex(v=>v.key===key),item={key,value:evaluate(e.item)};if(index<0)values.push(item);else values[index]=item;return dict(values);
  }
  if(e.kind==='i32'){
   if(e.op==='length')return i32(Array.from(text(e.text)).length);
   if(e.op==='neg'||e.op==='abs'){const n=integer(e.value);return i32(e.op==='neg'?-n:Math.abs(n));}
   ensure('left'in e,'EXPRESSION_OP','Unknown integer operator');const a=integer(e.left),b=integer(e.right);let n:number;
   switch(e.op){case 'add':n=a+b;break;case 'sub':n=a-b;break;case 'mul':n=a*b;break;case 'div':ensure(b!==0,'EXPRESSION_DIV_ZERO','Integer division by zero');n=Math.trunc(a/b);break;case 'mod':ensure(b!==0,'EXPRESSION_DIV_ZERO','Integer remainder by zero');n=a%b;break;case 'min':n=Math.min(a,b);break;case 'max':n=Math.max(a,b);break;}
   return i32(n===0?0:n);
  }
  if(e.kind==='string'){
   if(e.op==='concat'){let result='',count=0;for(const part of e.parts){const value=text(part);count+=Array.from(value).length;ensure(count<=4096,'EXPRESSION_STRING_SIZE','Computed string exceeds 4096 codepoints');result+=value;}return string(result);}
   if(e.op==='format'){const value=evaluate(e.value);ensure(value.kind===e.operandKind,'EXPRESSION_KIND','Format kind mismatch');return string(formatNativeValue(value));}
   const chars=Array.from(text(e.text)),start=integer(e.start),end=integer(e.end);ensure(start>=0&&end>=start&&end<=chars.length,'EXPRESSION_SLICE_RANGE','Use a valid nonnegative codepoint range');return string(chars.slice(start,end).join(''));
  }
  if(e.op==='not')return bool(!flag(e.value));
  if(e.op==='and')return bool(flag(e.left)&&flag(e.right));
  if(e.op==='or')return bool(flag(e.left)||flag(e.right));
  if(e.op==='read')return bool(context.read(readUnit(e)));
  if(e.op==='contains'||e.op==='startsWith'||e.op==='endsWith'){const value=text(e.text),search=text(e.search);return bool(e.op==='contains'?value.includes(search):e.op==='startsWith'?value.startsWith(search):value.endsWith(search));}
  ensure('operandKind'in e,'EXPRESSION_OP','Unknown boolean operator');const a=evaluate(e.left),b=evaluate(e.right);ensure(a.kind===e.operandKind&&b.kind===e.operandKind,'EXPRESSION_KIND','Comparison kind mismatch');
  if(e.op==='eq'||e.op==='ne')return bool(e.op==='eq'?equalValues(a,b):!equalValues(a,b));
  const order=orderValues(a,b);if(order===null)return bool(false);
  return bool(e.op==='lt'?order<0:e.op==='le'?order<=0:e.op==='gt'?order>0:order>=0);
 }
 return evaluate(root);
}
