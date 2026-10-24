import { validateProgram, validateSnapshot, validateProfile, validateInstruction, validateValue } from './generated/validators.js';
import type { Program, Snapshot, Profile, Instruction, Value } from './generated/wire.js';
export type * from './generated/wire.js';
export { operationSpecs } from './generated/operations.js';
export type DeepReadonly<T> = T extends string | number | boolean | bigint | symbol | null | undefined ? T : T extends readonly unknown[] ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : { readonly [K in keyof T]: DeepReadonly<T[K]> };
export class GalboxError extends Error {
  constructor(readonly code: string, message: string) { super(`${code}: ${message}`); this.name = 'GalboxError'; }
}
export function ensure(condition: unknown, code: string, message: string): asserts condition {
  if (!condition) throw new GalboxError(code, message);
}
function detached(input: unknown): unknown {
  try { const text = JSON.stringify(input); ensure(text && text.length <= 4_000_000, 'INPUT_SIZE', 'Input must be finite JSON, at most 4 MB'); return JSON.parse(text); }
  catch (error) { if (error instanceof GalboxError) throw error; throw new GalboxError('INPUT_JSON', 'Expected acyclic JSON data'); }
}
export function parseProgram(input: unknown): Program {
  const data = detached(input); ensure(validateProgram(data), 'SCHEMA_PROGRAM', JSON.stringify(validateProgram.errors)); return data;
}
export function parseSnapshot(input: unknown): Snapshot {
  const data = detached(input); ensure(validateSnapshot(data), 'SCHEMA_SNAPSHOT', JSON.stringify(validateSnapshot.errors)); return data;
}
export function parseProfile(input: unknown): Profile {
  const data = detached(input); ensure(validateProfile(data), 'SCHEMA_PROFILE', JSON.stringify(validateProfile.errors)); return data;
}
export function parseInstruction(input: unknown): Instruction {
  const data = detached(input); ensure(validateInstruction(data), 'SCHEMA_INSTRUCTION', JSON.stringify(validateInstruction.errors)); return data;
}
export function parseValue(input: unknown): Value {
  const data = detached(input); ensure(validateValue(data), 'SCHEMA_VALUE', JSON.stringify(validateValue.errors)); return data;
}
export function i32(value: number): Extract<Value, {kind: 'i32'}> {
  ensure(Number.isInteger(value) && value >= -2147483648 && value <= 2147483647, 'I32_RANGE', `${value}`); return {kind: 'i32', value};
}
export function string(value: string): Extract<Value, {kind: 'string'}> { const v = parseValue({kind:'string',value}); ensure(v.kind === 'string','VALUE_KIND','string'); return v; }
export function bool(value: boolean): Extract<Value, {kind: 'bool'}> { ensure(typeof value==='boolean','BOOL_TYPE','Expected boolean');return {kind:'bool',value}; }
export function emptyProfile(): Profile { return {revision:0,values:{},read:[]}; }
export function readUnit(text: {textId: string; revision: string}): string { return `${text.textId}@${text.revision}`; }
export const capabilities = ['adv', 'stage.linear', 'audio.wav', 'tasks.all', 'profile'] as const;
