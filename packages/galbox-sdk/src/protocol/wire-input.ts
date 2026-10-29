import {ensure,GalboxError} from './index.js';
import type {WireLimit} from './budget.js';
import {wireBudget} from './budget.js';
export function detached(input: unknown,limit:WireLimit=wireBudget): unknown {
  let nodes=0;const ancestors=new Set<object>();
  function visit(value:unknown,depth:number):unknown {
    ensure(++nodes<=limit.nodes&&depth<=limit.depth,'INPUT_SIZE','JSON tree exceeds the supported bound');
    if(value===null||typeof value==='boolean'||typeof value==='string')return value;
    if(typeof value==='number'){ensure(Number.isFinite(value),'INPUT_JSON','Non-finite number');return value===0?0:value;}
    ensure(typeof value==='object','INPUT_JSON','Expected plain JSON');
    ensure(!ancestors.has(value),'INPUT_JSON','Cyclic JSON');
    ensure(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype||Object.getPrototypeOf(value)===null,'INPUT_JSON','Expected plain JSON objects');
    const hook=Object.getOwnPropertyDescriptor(value,'toJSON');
    ensure(!hook||('value'in hook&&typeof hook.value!=='function'),'INPUT_JSON','Serialization hooks are not wire data');
    const keys=Object.keys(value);if(Array.isArray(value))ensure(keys.length===value.length&&keys.every((key,index)=>key===String(index)),'INPUT_JSON','Sparse/decorated arrays are unsupported');
    ancestors.add(value);
    // Copy descriptor values once. Never serialize the caller's object: inherited
    // array hooks or changed properties must not replace the tree we inspected.
    function child(key:string):unknown {
      const descriptor=Object.getOwnPropertyDescriptor(value,key);
      ensure(descriptor&&'value'in descriptor,'INPUT_JSON','Accessors are not wire data');
      return visit(descriptor.value,depth+1);
    }
    if(Array.isArray(value)){
      const owned:unknown[]=[];for(const key of keys)owned.push(child(key));
      ancestors.delete(value);return owned;
    }
    const owned:Record<string,unknown>={};
    for(const key of keys){
      const entry=child(key);
      if(key==='__proto__')Object.defineProperty(owned,key,{value:entry,enumerable:true,writable:true,configurable:true});
      else owned[key]=entry;
    }
    ancestors.delete(value);return owned;
  }
  try {const owned=visit(input,0),text=JSON.stringify(owned);ensure(text&&text.length<=limit.characters,'INPUT_SIZE','Finite JSON exceeds its type budget');return owned;}
  catch(error){if(error instanceof GalboxError)throw error;throw new GalboxError('INPUT_JSON','Expected plain acyclic JSON');}
}
