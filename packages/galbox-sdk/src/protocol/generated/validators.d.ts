import type { Program, Snapshot, Profile, Instruction, Value } from './wire.js';
export declare const validateProgram: { (data: unknown): data is Program; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };
export declare const validateSnapshot: { (data: unknown): data is Snapshot; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };
export declare const validateProfile: { (data: unknown): data is Profile; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };
export declare const validateInstruction: { (data: unknown): data is Instruction; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };
export declare const validateValue: { (data: unknown): data is Value; errors?: readonly {readonly instancePath: string; readonly message?: string}[] | null };
