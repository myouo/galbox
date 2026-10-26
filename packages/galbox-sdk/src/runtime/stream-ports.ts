import {parseResolvedStreamIdentity,parseResourceFact,ensure} from '../protocol/index.js';
import type {ResolvedStreamIdentity,ResourceFact} from '../protocol/index.js';
export type MediaKind='audio'|'video';
type IdentityMap={audio:Extract<ResolvedStreamIdentity,{kind:'audio'}>;video:Extract<ResolvedStreamIdentity,{kind:'video'}>};
type FactMap={audio:Extract<ResourceFact,{kind:'audio'}>;video:Extract<ResourceFact,{kind:'video'}>};
export interface Cancellation {readonly cancelled:boolean;onCancel(listener:()=>void):()=>void;}
export interface MediaStreamRequest<K extends MediaKind=MediaKind> {readonly identity:IdentityMap[K];readonly fact:FactMap[K];}
export interface MediaStreamLease<K extends MediaKind=MediaKind> {readonly identity:IdentityMap[K];readonly uri:string;releaseLease():void;}
export interface MediaStreamProvider {open<K extends MediaKind>(request:MediaStreamRequest<K>,cancellation:Cancellation):Promise<MediaStreamLease<K>>;}
export function streamRequest<K extends MediaKind>(identity:ResolvedStreamIdentity&{kind:K},fact:NoInfer<FactMap[K]>):MediaStreamRequest<K> {
 const i=parseResolvedStreamIdentity(identity),f=parseResourceFact(fact);function identityKind(value:ResolvedStreamIdentity):value is IdentityMap[K]{return value.kind===identity.kind;}function factKind(value:ResourceFact):value is FactMap[K]{return value.kind===identity.kind;}
 if(f.kind==='audio'&&i.kind==='audio')ensure(f.playback==='element'&&(i.mime==='audio/mpeg'?f.encoding==='mp3':i.mime==='audio/ogg'?f.encoding==='opus'||f.encoding==='vorbis':f.encoding==='wav'),'STREAM_FACT','Audio stream fact encoding/playback mismatch');
 ensure(f.id===i.assetId&&identityKind(i)&&factKind(f),'STREAM_IDENTITY','Media fact/identity mismatch');Object.freeze(i);Object.freeze(f);const request:MediaStreamRequest<K>={identity:i,fact:f};return Object.freeze(request);
}
