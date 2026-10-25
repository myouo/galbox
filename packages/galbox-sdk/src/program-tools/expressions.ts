import {ensure,parseExpression,parseValue,i32,bool,string} from '../protocol/index.js';
import type {Expression,Value,ValueKind,Operand,Instruction} from '../protocol/index.js';
import {validateExpressionTree} from '../protocol/expressions.js';
import type {Variable} from './linker.js';
import {instruction,literal} from './linker.js';
const expressionBrand:unique symbol=Symbol('expression');
export interface TypedExpression<K extends ValueKind> {readonly [expressionBrand]:K;readonly kind:K;}
type OfKind<K extends ValueKind>=Extract<Expression,{kind:K}>;
const expressions=new WeakMap<object,Expression>();
function freeze(value:unknown):void {if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}}
function make<K extends ValueKind>(kind:K,input:unknown):TypedExpression<K> {const wire=parseExpression(input);ensure(wire.kind===kind,'EXPRESSION_KIND','Factory kind mismatch');validateExpressionTree(wire);freeze(wire);const result=Object.freeze({[expressionBrand]:kind,kind});expressions.set(result,wire);return result;}
export function expressionWire<K extends ValueKind>(input:TypedExpression<K>):OfKind<K> {const wire=expressions.get(input);ensure(wire,'EXPRESSION_FACTORY','Use the public expression factories');const copy=parseExpression(wire);function matches(v:Expression):v is OfKind<K>{return v.kind===input.kind;}ensure(matches(copy),'EXPRESSION_KIND','Factory kind mismatch');return copy;}
function value<const V extends Value>(input:V):TypedExpression<V['kind']> {const v=parseValue(input);return make(input.kind,{kind:v.kind,op:'literal',value:v.value});}
function variable<K extends ValueKind>(target:Variable<K>):TypedExpression<K> {return make(target.kind,{kind:target.kind,op:'slot',id:target.id});}
function profile<K extends ValueKind>(kind:K,key:string,fallback:Extract<Value,{kind:NoInfer<K>}>):TypedExpression<K> {ensure(fallback.kind===kind,'EXPRESSION_KIND','Profile fallback kind mismatch');return make(kind,{kind,op:'profile',key,fallback:parseValue(fallback).value});}
function choose<K extends ValueKind>(condition:TypedExpression<'bool'>,yes:TypedExpression<K>,no:TypedExpression<NoInfer<K>>):TypedExpression<K> {ensure(yes.kind===no.kind,'EXPRESSION_KIND','Conditional branches must have the same kind');return make(yes.kind,{kind:yes.kind,op:'if',condition:expressionWire(condition),yes:expressionWire(yes),no:expressionWire(no)});}
function binary(op:'add'|'sub'|'mul'|'div'|'mod'|'min'|'max',left:TypedExpression<'i32'>,right:TypedExpression<'i32'>):TypedExpression<'i32'> {return make('i32',{kind:'i32',op,left:expressionWire(left),right:expressionWire(right)});}
function unary(op:'neg'|'abs',input:TypedExpression<'i32'>):TypedExpression<'i32'> {return make('i32',{kind:'i32',op,value:expressionWire(input)});}
function equal<K extends ValueKind>(left:TypedExpression<K>,right:TypedExpression<NoInfer<K>>,not=false):TypedExpression<'bool'> {ensure(left.kind===right.kind,'EXPRESSION_KIND','Equality operands must have the same kind');return make('bool',{kind:'bool',op:not?'ne':'eq',operandKind:left.kind,left:expressionWire(left),right:expressionWire(right)});}
function compare<K extends 'i32'|'string'>(left:TypedExpression<K>,op:'lt'|'le'|'gt'|'ge',right:TypedExpression<NoInfer<K>>):TypedExpression<'bool'> {ensure(left.kind===right.kind,'EXPRESSION_KIND','Comparison operands must have the same kind');return make('bool',{kind:'bool',op,operandKind:left.kind,left:expressionWire(left),right:expressionWire(right)});}
function logic(op:'and'|'or',left:TypedExpression<'bool'>,right:TypedExpression<'bool'>):TypedExpression<'bool'> {return make('bool',{kind:'bool',op,left:expressionWire(left),right:expressionWire(right)});}
function concat(...parts:readonly TypedExpression<'string'>[]):TypedExpression<'string'> {return make('string',{kind:'string',op:'concat',parts:parts.map(expressionWire)});}
function format(input:TypedExpression<'i32'>|TypedExpression<'bool'>):TypedExpression<'string'> {return make('string',{kind:'string',op:'format',operandKind:input.kind,value:expressionWire(input)});}
function template(strings:TemplateStringsArray,...values:readonly TypedExpression<ValueKind>[]):TypedExpression<'string'> {ensure(strings.length===values.length+1,'EXPRESSION_TEMPLATE','Template arity');const parts:TypedExpression<'string'>[]=[];strings.forEach((text,index)=>{parts.push(value(string(text)));const e=values[index];if(e)parts.push(e.kind==='string'?make('string',expressionWire(e)):make('string',{kind:'string',op:'format',operandKind:e.kind,value:expressionWire(e)}));});return concat(...parts);}
export const expr=Object.freeze({value,variable,profile,choose,binary,unary,equal,compare,logic,concat,format,template,
 integer:(n:number)=>value(i32(n)),flag:(v:boolean)=>value(bool(v)),text:(s:string)=>value(string(s)),
 not:(v:TypedExpression<'bool'>)=>make('bool',{kind:'bool',op:'not',value:expressionWire(v)}),
 length:(v:TypedExpression<'string'>)=>make('i32',{kind:'i32',op:'length',text:expressionWire(v)}),
 slice:(v:TypedExpression<'string'>,start:TypedExpression<'i32'>,end:TypedExpression<'i32'>)=>make('string',{kind:'string',op:'slice',text:expressionWire(v),start:expressionWire(start),end:expressionWire(end)}),
 stringTest:(op:'contains'|'startsWith'|'endsWith',text:TypedExpression<'string'>,search:TypedExpression<'string'>)=>make('bool',{kind:'bool',op,text:expressionWire(text),search:expressionWire(search)}),
 wasRead:(textId:string,revision:string)=>make('bool',{kind:'bool',op:'read',textId,revision})
});
export function expressionOperand(input:TypedExpression<ValueKind>):Operand {return {expression:expressionWire(input)};}
export function assignExpression<K extends ValueKind>(at:string,dest:Variable<K>,input:TypedExpression<NoInfer<K>>):Extract<Instruction,{op:'value.set'}> {ensure(dest.kind===input.kind,'EXPRESSION_KIND',dest.id);return instruction('value.set',{at,dest:dest.id,value:expressionOperand(input)});}
export function branchExpression(at:string,condition:TypedExpression<'bool'>,yes:string,no:string):Extract<Instruction,{op:'control.branch'}> {ensure(condition.kind==='bool','EXPRESSION_KIND','Expected a boolean condition');return instruction('control.branch',{at,left:expressionOperand(condition),cmp:'eq',right:literal(bool(true)),yes,no});}
export function templatePage(at:string,textId:string,revision:string,speaker:TypedExpression<'string'>,content:TypedExpression<'string'>):Extract<Instruction,{op:'text.template'}> {return instruction('text.template',{at,textId,revision,speaker:expressionWire(speaker),content:expressionWire(content)});}
export function randomI32(at:string,dest:Variable<'i32'>,min:TypedExpression<'i32'>,max:TypedExpression<'i32'>):Extract<Instruction,{op:'random.i32'}> {ensure(dest.kind==='i32','EXPRESSION_KIND',dest.id);return instruction('random.i32',{at,dest:dest.id,min:expressionWire(min),max:expressionWire(max)});}
