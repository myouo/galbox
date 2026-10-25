import {ensure,parseValue,GalboxError} from './index.js';
import type {Value,DeepReadonly} from './index.js';
const min64=-9223372036854775808n,max64=9223372036854775807n;
export function normalizeNativeValue(value:Value):Value {
 let nodes=0;
 function visit(v:Value,depth:number):void {
  ensure(++nodes<=1024&&depth<=8,'VALUE_SIZE','At most 1024 value nodes and 8 levels');
  if(v.kind==='i64'){const n=BigInt(v.value);ensure(n>=min64&&n<=max64,'I64_RANGE','Signed i64 overflow');}
  if(v.kind==='f64'){const bits=v.value.toLowerCase(),word=BigInt('0x'+bits);v.value=(word&0x7ff0000000000000n)===0x7ff0000000000000n&&(word&0xfffffffffffffn)!==0n?'7ff8000000000000':bits;}
  if(v.kind==='list')v.value.forEach(child=>visit(child,depth+1));
  if(v.kind==='dict'){const keys=new Set<string>();for(const entry of v.value){ensure(!keys.has(entry.key)&&entry.key.length>0&&entry.key.length<=128&&!entry.key.includes('\0'),'DICT_KEY','Duplicate or invalid dictionary key');keys.add(entry.key);visit(entry.value,depth+1);}}
 }
 visit(value,1);return value;
}
export function i64(value:bigint|string):Extract<Value,{kind:'i64'}> {ensure(typeof value==='bigint'||typeof value==='string','I64_TYPE','Use bigint or canonical decimal text');if(typeof value==='bigint')ensure(value>=min64&&value<=max64,'I64_RANGE','Signed i64 overflow');const v=parseValue({kind:'i64',value:String(value)});ensure(v.kind==='i64','VALUE_KIND','Expected i64');return v;}
export function f64Bits(value:string):Extract<Value,{kind:'f64'}> {const v=parseValue({kind:'f64',value});ensure(v.kind==='f64','VALUE_KIND','Expected f64');return v;}
export function f64(value:number):Extract<Value,{kind:'f64'}> {ensure(typeof value==='number','F64_TYPE','Expected a number');const bytes=new DataView(new ArrayBuffer(8));bytes.setFloat64(0,value,false);return f64Bits(bytes.getBigUint64(0,false).toString(16).padStart(16,'0'));}
export function f64Number(input:unknown):number {const value=parseValue(input);ensure(value.kind==='f64','VALUE_KIND','Expected f64');const bytes=new DataView(new ArrayBuffer(8));bytes.setBigUint64(0,BigInt('0x'+value.value),false);return bytes.getFloat64(0,false);}
export function nullValue():Extract<Value,{kind:'null'}> {return {kind:'null',value:null};}
export function list(value:readonly DeepReadonly<Value>[]):Extract<Value,{kind:'list'}> {const v=parseValue({kind:'list',value});ensure(v.kind==='list','VALUE_KIND','Expected list');return v;}
export function dict(value:readonly {readonly key:string;readonly value:DeepReadonly<Value>}[]):Extract<Value,{kind:'dict'}> {const v=parseValue({kind:'dict',value});ensure(v.kind==='dict','VALUE_KIND','Expected dict');return v;}
export function extendedValue(value:DeepReadonly<Value>):boolean {return value.kind!=='i32'&&value.kind!=='bool'&&value.kind!=='string';}
export function equalValues(a:DeepReadonly<Value>,b:DeepReadonly<Value>):boolean {
 if(a.kind!==b.kind)return false;if(a.kind==='f64'&&b.kind==='f64')return f64Number(a)===f64Number(b);
 if(a.kind==='list'&&b.kind==='list')return a.value.length===b.value.length&&a.value.every((v,j)=>{const other=b.value[j];return other!==undefined&&equalValues(v,other);});
 if(a.kind==='dict'&&b.kind==='dict')return a.value.length===b.value.length&&a.value.every((v,j)=>{const other=b.value[j];return other!==undefined&&v.key===other.key&&equalValues(v.value,other.value);});return a.value===b.value;
}
export function orderValues(a:Value,b:Value):number|null {
 ensure(a.kind===b.kind,'COMPARE_KIND','Operands must have the same kind');
 if(a.kind==='f64'&&b.kind==='f64'){const x=f64Number(a),y=f64Number(b);return Number.isNaN(x)||Number.isNaN(y)?null:x===y?0:x<y?-1:1;}
 if(a.kind==='i64'&&b.kind==='i64'){const x=BigInt(a.value),y=BigInt(b.value);return x===y?0:x<y?-1:1;}
 if(a.kind==='i32'&&b.kind==='i32'||a.kind==='string'&&b.kind==='string')return a.value===b.value?0:a.value<b.value?-1:1;
 throw new GalboxError('COMPARE_KIND','Ordering is unsupported for this kind');
}
export function formatNativeValue(v:Value):string {ensure(v.kind!=='list'&&v.kind!=='dict','EXPRESSION_FORMAT','Collections need an explicit element/key selection');if(v.kind==='f64'){const n=f64Number(v);return Object.is(n,-0)?'-0':String(n);}return String(v.value);}
