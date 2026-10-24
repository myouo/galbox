import { ensure, parseJsonValue } from './index.js';
import type { JsonValue, DeepReadonly, SchemaRef } from './index.js';

export interface ProtocolCodec<T, Id extends string = string> {
  readonly identity: { readonly id: Id; readonly signature: string };
  is(input: unknown): input is T;
  parse(input: unknown): T;
}
export type Decoded<C> = C extends ProtocolCodec<infer T> ? T : never;
export type ObjectDecoded<C extends Record<string, ProtocolCodec<unknown>>> = { [K in keyof C]: Decoded<C[K]> };
export function freezeJson<T>(data: T): DeepReadonly<T> {
  if (data !== null && typeof data === 'object') {
    for (const child of Object.values(data)) freezeJson(child);
    Object.freeze(data);
  }
  // Homomorphic readonly is assignable from an owned value. A checked codec handles generic narrowing below.
  function readonlyValue(value: T): value is T & DeepReadonly<T> { return Object.isFrozen(value) || value === null || typeof value !== 'object'; }
  ensure(readonlyValue(data), 'OWNERSHIP', 'Expected a frozen JSON tree'); return data;
}
export function schemaEqual(a: Readonly<SchemaRef>, b: Readonly<SchemaRef>): boolean { return a.id === b.id && a.signature === b.signature; }
function canonical(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k] ?? null)]));
  return value;
}
const trustedCodecs=new WeakSet<object>();
export function assertCodec(value:ProtocolCodec<unknown>):void {ensure(trustedCodecs.has(value),'CODEC_FACTORY','Use the checked codec factory');}
function make<T, const Id extends string>(id: Id, shape: JsonValue, guard: (input: unknown) => input is T): ProtocolCodec<T, Id> {
  ensure(/^[a-zA-Z][a-zA-Z0-9_.:@/-]{0,127}$/.test(id), 'CODEC_ID', id);
  const signature = JSON.stringify(canonical(shape));
  ensure(signature.length <= 16384, 'CODEC_SIZE', 'Schema exceeds the supported size');
  const identity = Object.freeze({id, signature});
  const result=Object.freeze({identity, is: guard, parse(input: unknown): T {
    const data = parseJsonValue(input); ensure(guard(data), 'CODEC_VALUE', id); return data;
  }});trustedCodecs.add(result);return result;
}
function integer<const Id extends string>(id: Id, min = -2147483648, max = 2147483647): ProtocolCodec<number, Id> {
  ensure(Number.isInteger(min) && Number.isInteger(max) && min >= -2147483648 && max <= 2147483647 && min <= max, 'CODEC_RANGE', id);
  return make(id, {type:'integer', min, max}, (v): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max);
}
function text<const Id extends string>(id: Id): ProtocolCodec<string, Id> { return make(id, {type:'string'}, (v): v is string => typeof v === 'string'); }
function boolean<const Id extends string>(id: Id): ProtocolCodec<boolean, Id> { return make(id, {type:'boolean'}, (v): v is boolean => typeof v === 'boolean'); }
function literal<const Id extends string, const V extends string | number | boolean | null>(id: Id, value: V): ProtocolCodec<V, Id> {
  parseJsonValue(value);return make(id, {literal:value}, (v): v is V => v === value);
}
function object<const Id extends string, const C extends Record<string, ProtocolCodec<unknown>>>(id: Id, fields: C): ProtocolCodec<ObjectDecoded<C>, Id> {
  const entries = Object.entries(fields).map(([key, value]) => { assertCodec(value);ensure(/^[a-zA-Z][a-zA-Z0-9_]{0,79}$/.test(key), 'CODEC_FIELD', key);return [key, value] as const; });
  const shape: JsonValue = {type:'object', fields:Object.fromEntries(entries.map(([k,c]) => [k, parseJsonValue(JSON.parse(c.identity.signature))]))};
  return make(id, shape, (v): v is ObjectDecoded<C> => {
    if (v === null || typeof v !== 'object' || Array.isArray(v)) return false;
    const data: Record<string, unknown> = Object.fromEntries(Object.entries(v));
    return Object.keys(data).length === entries.length && entries.every(([key,c]) => Object.hasOwn(data,key) && c.is(data[key]));
  });
}
function array<T, const Id extends string>(id: Id, item: ProtocolCodec<T>, max = 256): ProtocolCodec<T[], Id> {
  assertCodec(item);ensure(Number.isInteger(max) && max >= 0 && max <= 256, 'CODEC_RANGE', id);
  return make(id, {type:'array', item:parseJsonValue(JSON.parse(item.identity.signature)), max}, (v): v is T[] => Array.isArray(v) && v.length <= max && v.every(x => item.is(x)));
}
function tuple<const Id extends string, const C extends readonly ProtocolCodec<unknown>[]>(id: Id, ...items: C): ProtocolCodec<{ [K in keyof C]: Decoded<C[K]> }, Id> {
  const owned = [...items];owned.forEach(assertCodec);
  return make(id, {type:'tuple', items:owned.map(c=>parseJsonValue(JSON.parse(c.identity.signature)))}, (v): v is { [K in keyof C]: Decoded<C[K]> } => Array.isArray(v) && v.length === owned.length && owned.every((c,j)=>c.is(v[j])));
}
function union<const Id extends string, const C extends readonly ProtocolCodec<unknown>[]>(id: Id, ...members: C): ProtocolCodec<Decoded<C[number]>, Id> {
  const owned = [...members];owned.forEach(assertCodec);ensure(owned.length > 0, 'CODEC_UNION', id);
  return make(id, {type:'union', members:owned.map(c=>parseJsonValue(JSON.parse(c.identity.signature)))}, (v): v is Decoded<C[number]> => owned.some(c=>c.is(v)));
}
export const codec = Object.freeze({integer, string:text, boolean, literal, object, array, tuple, union});
export function acceptsFieldLiteral(codec:ProtocolCodec<unknown>,field:string,value:string):boolean {
  assertCodec(codec);
  function literal(shape:JsonValue):boolean {
    if(shape===null||typeof shape!=='object'||Array.isArray(shape))return false;
    if(Object.hasOwn(shape,'literal'))return shape.literal===value;
    if(shape.type==='string')return true;
    return shape.type==='union'&&Array.isArray(shape.members)&&shape.members.some(literal);
  }
  function object(shape:JsonValue):boolean {
    if(shape===null||typeof shape!=='object'||Array.isArray(shape))return false;
    if(shape.type==='union'&&Array.isArray(shape.members))return shape.members.some(object);
    const fields=shape.fields;return shape.type==='object'&&fields!==null&&typeof fields==='object'&&!Array.isArray(fields)&&literal(fields[field]??null);
  }
  return object(parseJsonValue(JSON.parse(codec.identity.signature)));
}
