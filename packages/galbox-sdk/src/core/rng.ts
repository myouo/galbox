import {ensure,parseRngState,parseRngConfig,i32} from '../protocol/index.js';
import type {RngState,RngConfig} from '../protocol/index.js';
export function initialRng(config:RngConfig|undefined,seed?:number):RngState|undefined {
 if(!config){ensure(seed===undefined,'RNG_SEED_POLICY','Program did not declare RNG');return;}
 if('seed'in config){ensure(seed===undefined,'RNG_SEED_POLICY','Fixed seed belongs to the Program');return {algorithm:config.algorithm,state:config.seed,draws:0};}
 ensure(seed!==undefined,'RNG_SEED_REQUIRED','Provide an explicit host u32 seed');const checked=parseRngConfig({algorithm:config.algorithm,seed});ensure('seed'in checked,'RNG_SEED_REQUIRED','Expected a concrete seed');return {algorithm:config.algorithm,state:checked.seed,draws:0};
}
export function sampleI32(input:RngState,min:number,max:number):{rng:RngState;value:ReturnType<typeof i32>} {
 const rng=parseRngState(input);i32(min);i32(max);ensure(min<=max,'RNG_RANGE','Expected min <= max');const width=max-min+1,limit=4294967296-(4294967296%width);
 for(let attempt=0;attempt<128;attempt++){ensure(rng.draws<2147483647,'RNG_DRAWS','RNG consumption limit');rng.state=(Math.imul(rng.state,1664525)+1013904223)>>>0;rng.draws++;if(rng.state<limit)return {rng,value:i32(min+rng.state%width)};}
 ensure(false,'RNG_BUDGET','Range sampling exceeded its bounded attempts');
}
