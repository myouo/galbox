import type {ExtraEntry,Profile} from '../protocol/index.js';
import type {Coordinator} from '../runtime/coordinator.js';
import type {Player} from './index.js';
export type PreviewKind='cg'|'music'|'scene';
export interface ExtraSessionView {readonly id:string;readonly kind:PreviewKind;readonly state:'loading'|'ready'|'failed'|'closing';readonly variant:number;readonly variants:number;readonly error:string|null;}
export interface ExtraSession {id:string;kind:PreviewKind;state:ExtraSessionView['state'];entry:ExtraEntry|null;profile:Profile|null;controller:AbortController;barrier:Promise<void>|null;runtime:Coordinator|null;profileId:string;variant:number;variants:number;error:string|null;mount:HTMLElement|null;child:Player|null;image:(()=>void)|null;imageAbort:AbortController|null;imageSequence:number;closing:Promise<void>|null;}
