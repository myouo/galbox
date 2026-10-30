import type {Program,DeepReadonly} from './index.js';
const contexts=new WeakMap<object,{identity:string;extrasAliases:readonly string[]}>();
/** Internal provenance: only projections assembled from checked module parts. */
export function registerModuleProjection(program:Program,identity:string,extrasAliases:readonly string[]):Program {contexts.set(program,{identity,extrasAliases:[...extrasAliases]});return program;}
export function moduleContext(program:DeepReadonly<Program>){return contexts.get(program);}
