import {ensure,parseModuleFunction} from '../protocol/index.js';
import type {ModuleFunction,Function as ProgramFunction} from '../protocol/index.js';
export function moduleFunction(f:ProgramFunction):ModuleFunction {const {code,...header}=f,first=code.find(i=>i.at===f.entry),audioSources=code.flatMap(i=>i.op==='audio.track'?[i.task]:[]);return parseModuleFunction({...header,addresses:code.map(i=>i.at),...(first?.op==='extras.scene'?{entryMarker:{kind:'extras',id:first.entry}}:first?.op==='flow.node'?{entryMarker:{kind:'flow',id:first.node}}:{}),...(audioSources.length?{audioSources}:{})});}
/** Lossless external representation; full checked declarations stay internal. */
export function expandedModuleFunction(input:ModuleFunction):ModuleFunction {
 const {packedAddresses,...header}=input;if(packedAddresses===undefined)return parseModuleFunction(header);
 ensure(input.addresses.length===1&&input.addresses[0]===input.entry,'MODULE_ABI','Packed declarations carry only entry in addresses');const addresses=packedAddresses.split('\n');ensure(addresses.length<=10000,'MODULE_SIZE','Function address bound');return parseModuleFunction({...header,addresses});
}
export function packedModuleFunction(input:ProgramFunction):ModuleFunction {const declaration=moduleFunction(input);return parseModuleFunction({...declaration,addresses:[declaration.entry],packedAddresses:declaration.addresses.join('\n')});}
