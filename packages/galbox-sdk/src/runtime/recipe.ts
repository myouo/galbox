import {Core} from '../core/index.js';
import type {CoreOptions,ProgressChange} from '../core/index.js';
import {parseRestoreRecipe,parseProfile} from '../protocol/index.js';
import type {Instruction,RecipeOpcode,RestoreRecipe,Profile,Snapshot} from '../protocol/index.js';
export type RecoveryInstruction=Extract<Instruction,{op:RecipeOpcode}>;
export function defineRestoreRecipe(id:string,steps:readonly RecoveryInstruction[],maxSteps=steps.length):RestoreRecipe {return parseRestoreRecipe({version:1,id,maxSteps,steps});}
export interface PreparedRecovery {readonly snapshot:Snapshot;readonly profile:Profile;readonly changes:readonly ProgressChange[];}
export function prepareRestoreRecipe(program:unknown,profile:unknown,snapshot:unknown,recipe:unknown,options:CoreOptions={}):PreparedRecovery {
 const core=new Core(program,profile,snapshot,'candidate',options.operations);core.applyRecipe(recipe);const view=core.view();return {snapshot:core.capture(),profile:parseProfile(view.profile),changes:core.pending()};
}
