import {ensure,parseInstruction} from '../protocol/index.js';
import type {ParticleConfig,ParticleStyle,Instruction} from '../protocol/index.js';
import type {AssetRef} from './linker.js';
export type ParticleStyleInput=Omit<ParticleStyle,'asset'>&{asset:AssetRef<'image'>};
export type ParticleConfigInput=Omit<ParticleConfig,'styles'>&{styles:[ParticleStyleInput,...ParticleStyleInput[]]};
export function stageParticles(at:string,task:string,prefix:string,config:ParticleConfigInput):Extract<Instruction,{op:'stage.particles'}>{const styles=config.styles.map(style=>{ensure(style.asset.kind==='image','ASSET_KIND','Particle sprites require images');return {...style,asset:style.asset.id};}),i=parseInstruction({op:'stage.particles',at,task,prefix,config:{...config,styles}});ensure(i.op==='stage.particles','PARTICLE_FACTORY','Invalid opcode');return i;}
export function stopStageParticles(at:string,task:string):Extract<Instruction,{op:'stage.particles.stop'}>{const i=parseInstruction({op:'stage.particles.stop',at,task});ensure(i.op==='stage.particles.stop','PARTICLE_FACTORY','Invalid opcode');return i;}
