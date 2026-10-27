// Internal only: the caller has already parsed/normalized this JSON tree.
// Public unknown values must go through canonicalWireJSON's detachment first.
export function canonicalParsedJSON(input:unknown):string {return JSON.stringify(input,(_key:string,v:unknown)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,Reflect.get(v,k)])):v);}
