import {ensure,i32,bool,string,parseValue,readUnit,canonicalWireJSON} from './index.js';
import type {Expression,Value,ValueKind} from './index.js';
export function validateExpressionTree(root:Expression,slotKind?:(id:string)=>ValueKind|undefined):ValueKind {
 let nodes=0;
 function visit(e:Expression,depth:number):void {
  ensure(++nodes<=512&&depth<=16,'EXPRESSION_SIZE','At most 512 nodes and 16 levels');
  if(e.op==='slot'&&slotKind)ensure(slotKind(e.id)===e.kind,'EXPRESSION_SLOT_KIND',e.id);
  if(e.op==='read')readUnit(e);
  const children:Expression[]=[];
  if('left'in e)children.push(e.left,e.right);
  if(e.op==='if')children.push(e.condition,e.yes,e.no);
  if(e.op==='neg'||e.op==='abs'||e.op==='not'||e.op==='format')children.push(e.value);
  if(e.op==='concat')children.push(...e.parts);
  if('text'in e)children.push(e.text);
  if('search'in e)children.push(e.search);
  if(e.op==='slice')children.push(e.start,e.end);
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
 function evaluate(e:Expression):Value {
  if(e.op==='literal')return parseValue({kind:e.kind,value:e.value});
  if(e.op==='slot'||e.op==='profile'){const v=e.op==='slot'?context.slot(e.id):context.profile(e.key);if(v===undefined){ensure(e.op==='profile','EXPRESSION_SLOT','Missing slot');return parseValue({kind:e.kind,value:e.fallback});}ensure(v.kind===e.kind,'EXPRESSION_VALUE_KIND',e.op==='slot'?e.id:e.key);return parseValue(v);}
  if(e.op==='if')return flag(e.condition)?evaluate(e.yes):evaluate(e.no);
  if(e.kind==='i32'){
   if(e.op==='length')return i32(Array.from(text(e.text)).length);
   if(e.op==='neg'||e.op==='abs'){const n=integer(e.value);return i32(e.op==='neg'?-n:Math.abs(n));}
   ensure('left'in e,'EXPRESSION_OP','Unknown integer operator');const a=integer(e.left),b=integer(e.right);let n:number;
   switch(e.op){case 'add':n=a+b;break;case 'sub':n=a-b;break;case 'mul':n=a*b;break;case 'div':ensure(b!==0,'EXPRESSION_DIV_ZERO','Integer division by zero');n=Math.trunc(a/b);break;case 'mod':ensure(b!==0,'EXPRESSION_DIV_ZERO','Integer remainder by zero');n=a%b;break;case 'min':n=Math.min(a,b);break;case 'max':n=Math.max(a,b);break;}
   return i32(n===0?0:n);
  }
  if(e.kind==='string'){
   if(e.op==='concat'){let result='',count=0;for(const part of e.parts){const value=text(part);count+=Array.from(value).length;ensure(count<=4096,'EXPRESSION_STRING_SIZE','Computed string exceeds 4096 codepoints');result+=value;}return string(result);}
   if(e.op==='format'){const value=evaluate(e.value);ensure(value.kind===e.operandKind,'EXPRESSION_KIND','Format kind mismatch');return string(String(value.value));}
   const chars=Array.from(text(e.text)),start=integer(e.start),end=integer(e.end);ensure(start>=0&&end>=start&&end<=chars.length,'EXPRESSION_SLICE_RANGE','Use a valid nonnegative codepoint range');return string(chars.slice(start,end).join(''));
  }
  if(e.op==='not')return bool(!flag(e.value));
  if(e.op==='and')return bool(flag(e.left)&&flag(e.right));
  if(e.op==='or')return bool(flag(e.left)||flag(e.right));
  if(e.op==='read')return bool(context.read(readUnit(e)));
  if(e.op==='contains'||e.op==='startsWith'||e.op==='endsWith'){const value=text(e.text),search=text(e.search);return bool(e.op==='contains'?value.includes(search):e.op==='startsWith'?value.startsWith(search):value.endsWith(search));}
  ensure('operandKind'in e,'EXPRESSION_OP','Unknown boolean operator');const a=evaluate(e.left),b=evaluate(e.right);ensure(a.kind===e.operandKind&&b.kind===e.operandKind,'EXPRESSION_KIND','Comparison kind mismatch');
  if(e.op==='eq'||e.op==='ne')return bool(e.op==='eq'?a.value===b.value:a.value!==b.value);
  let order:number;if(a.kind==='i32'&&b.kind==='i32')order=a.value===b.value?0:a.value<b.value?-1:1;else {ensure(a.kind==='string'&&b.kind==='string','EXPRESSION_KIND','Boolean ordering is unsupported');order=a.value===b.value?0:a.value<b.value?-1:1;}
  return bool(e.op==='lt'?order<0:e.op==='le'?order<=0:e.op==='gt'?order>0:order>=0);
 }
 return evaluate(root);
}
