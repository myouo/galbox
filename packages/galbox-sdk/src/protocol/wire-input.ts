import {ensure,GalboxError} from './index.js';
import {wireBudget} from './budget.js';
export function detached(input: unknown): unknown {
  let nodes=0;const ancestors=new Set<object>();
  function visit(value:unknown,depth:number):void {
    ensure(++nodes<=wireBudget.nodes&&depth<=wireBudget.depth,'INPUT_SIZE','JSON tree exceeds the supported bound');
    if(value===null||typeof value==='boolean'||typeof value==='string')return;
    if(typeof value==='number'){ensure(Number.isFinite(value),'INPUT_JSON','Non-finite number');return;}
    ensure(typeof value==='object','INPUT_JSON','Expected plain JSON');
    ensure(!ancestors.has(value),'INPUT_JSON','Cyclic JSON');
    ensure(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'INPUT_JSON','Expected plain JSON objects');
    const keys=Object.keys(value);if(Array.isArray(value))ensure(keys.length===value.length,'INPUT_JSON','Sparse/decorated arrays are unsupported');
    ancestors.add(value);
    for(const key of keys){const descriptor=Object.getOwnPropertyDescriptor(value,key);ensure(descriptor&&'value'in descriptor,'INPUT_JSON','Accessors are not wire data');visit(descriptor.value,depth+1);}
    ancestors.delete(value);
  }
  try {visit(input,0);const text=JSON.stringify(input);ensure(text&&text.length<=wireBudget.characters,'INPUT_SIZE','At most 4 MB of finite JSON');return JSON.parse(text);}
  catch(error){if(error instanceof GalboxError)throw error;throw new GalboxError('INPUT_JSON','Expected plain acyclic JSON');}
}
