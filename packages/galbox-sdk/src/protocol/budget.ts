// Shared external wire and internal projection limits. A footprint is only for
// already schema-checked, owned JSON; it does not replace unknown-input checks.
export const wireBudget=Object.freeze({nodes:100000,depth:64,characters:4000000});
export const programWireBudget=Object.freeze({nodes:512000,depth:64,characters:8000000});
export interface WireLimit {readonly nodes:number;readonly depth:number;readonly characters:number;}
export const wireLimit=(kind:string):WireLimit=>kind==='Program'||kind==='ProgramTextCatalog'?programWireBudget:wireBudget;
export interface WireFootprint {readonly nodes:number;readonly depth:number;readonly characters:number;}
export function ownedWireFootprint(value:unknown):WireFootprint {
 function walk(v:unknown):{nodes:number;depth:number}{if(v===null||typeof v!=='object')return {nodes:1,depth:0};let nodes=1,depth=0;for(const child of Object.values(v)){const size=walk(child);nodes+=size.nodes;depth=Math.max(depth,size.depth+1);}return {nodes,depth};}
 const serialized=JSON.stringify(value);if(serialized===undefined)throw new Error('Expected owned JSON');return {...walk(value),characters:serialized.length};
}
