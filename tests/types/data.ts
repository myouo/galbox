import {expr as E,variable,set,assignExpression,assignProfile} from '../../packages/galbox-sdk/src/program-tools/index.js';
import {f64,i64,list,nullValue} from '../../packages/galbox-sdk/src/protocol/index.js';
import type {DeepReadonly,Value} from '../../packages/galbox-sdk/src/protocol/index.js';
export function dataTypes(value:DeepReadonly<Value>){set('set',variable('number','f64'),f64(1));assignExpression('wide',variable('wide','i64'),E.wide(2n));assignProfile('save','data',E.list(E.nil(),E.real(1)));list([i64(2n),nullValue()]);
 // @ts-expect-error F64 and i64 are distinct source value families.
 set('bad',variable('number','f64'),i64(1n));
 // @ts-expect-error Explicit f64 arithmetic does not accept i32 operands.
 E.f64Binary('add',E.integer(1),E.real(1));
 // @ts-expect-error Right comparison kind is anchored by the left expression.
 E.compare(E.real(1),'lt',E.wide(1n));
 // @ts-expect-error A dictionary lookup requires a dictionary expression.
 E.dictGet('i32',E.list(),E.text('x'));
 // @ts-expect-error A declared lookup result cannot be assigned to another slot family.
 assignExpression('wrong',variable('number','i64'),E.dictGet('f64',E.dict([]),E.text('x')));
 // @ts-expect-error Collections are not implicitly formatted as strings.
 E.template`bad ${E.list()}`;
 if(value.kind==='list'){assignExpression('copy',variable('array','list'),E.value(value));set('copy',variable('array','list'),value);list([value]);
 // @ts-expect-error Nested source values remain readonly.
 value.value.push(nullValue());}
}
