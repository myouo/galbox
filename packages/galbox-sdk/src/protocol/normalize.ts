import {interactionExpressions} from './interaction.js';
import {isAudioInstruction,audioExpressions} from './audio.js';
import {isStageInstruction,stageExpressions} from './stage.js';
import {normalizeNativeValue} from './values.js';
import {expressionChildren} from './expressions.js';
import {parseValue,GalboxError,parseSaveCapture,assertSaveCut} from './index.js';
import type {Expression,Instruction,Operand,Program,Snapshot,Profile,SlotMetadata,PortableBackup,RestoreRecipe} from './index.js';
export function normalizeExpression(e:Expression):Expression {for(const child of expressionChildren(e))normalizeExpression(child);if(e.op==='literal')Object.assign(e,{value:parseValue({kind:e.kind,value:e.value}).value});if(e.op==='profile')Object.assign(e,{fallback:parseValue({kind:e.kind,value:e.fallback}).value});return e;}
function operand(o:Operand):void {if('literal'in o)normalizeNativeValue(o.literal);else if('expression'in o)normalizeExpression(o.expression);}
export function normalizeInstruction(i:Instruction):Instruction {
 try {if(i.op==='interaction.prompt')interactionExpressions(i).forEach(normalizeExpression);if(isAudioInstruction(i))audioExpressions(i).forEach(normalizeExpression);if(isStageInstruction(i))stageExpressions(i).forEach(normalizeExpression);switch(i.op){case 'control.branch':case 'i32.add.checked':operand(i.left);operand(i.right);break;case 'control.call':i.args.forEach(operand);break;case 'control.return':if(i.value)operand(i.value);break;case 'value.set':operand(i.value);break;case 'profile.set':normalizeNativeValue(i.value);break;case 'profile.expression':normalizeExpression(i.value);break;case 'text.template':normalizeExpression(i.speaker);normalizeExpression(i.content);break;case 'text.rich':normalizeExpression(i.speaker);for(const r of i.runs)if(r.kind==='text'||r.kind==='ruby'){normalizeExpression(r.content);if(r.kind==='ruby')normalizeExpression(r.reading);}break;case 'random.i32':normalizeExpression(i.min);normalizeExpression(i.max);break;}
 return i;}catch(error){if(error instanceof GalboxError)throw new GalboxError(error.code,error.reason,{...error.location,address:i.at});throw error;}
}
export function normalizeProgram(p:Program):Program {p.globals.forEach(s=>normalizeNativeValue(s.initial));for(const f of p.functions){[...f.params,...f.locals].forEach(s=>normalizeNativeValue(s.initial));f.code.forEach(normalizeInstruction);}return p;}
export function normalizeSnapshot(s:Snapshot):Snapshot {Object.values(s.globals).forEach(normalizeNativeValue);for(const f of s.frames)Object.values(f.locals).forEach(normalizeNativeValue);return s;}
export function normalizeProfile(p:Profile):Profile {Object.values(p.values).forEach(normalizeNativeValue);return p;}
export function normalizeRecipe(r:RestoreRecipe):RestoreRecipe {r.steps.forEach(normalizeInstruction);return r;}
export function normalizeMetadata(m:SlotMetadata):SlotMetadata {if(m.capture)parseSaveCapture(m.capture);if(m.recipe)normalizeRecipe(m.recipe);if(m.onLoad)normalizeRecipe(m.onLoad);return m;}
export function normalizeBackup(b:PortableBackup):PortableBackup {b.profiles.forEach(p=>normalizeProfile(p.profile));for(const s of b.slots){normalizeSnapshot(s.snapshot);normalizeMetadata(s.metadata);assertSaveCut(s.snapshot,s.metadata);if(s.previous)normalizeSnapshot(s.previous);if(s.previousMetadata){normalizeMetadata(s.previousMetadata);if(s.previous)assertSaveCut(s.previous,s.previousMetadata);}}return b;}
