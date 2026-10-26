import {streamRequest} from 'galbox-sdk/port-kit';
import type {MediaStreamProvider} from 'galbox-sdk/port-kit';
import type {ResolvedStreamIdentity,ResourceFact} from 'galbox-sdk/protocol';
export function streamTypes(audio:Extract<ResolvedStreamIdentity,{kind:'audio'}>,video:Extract<ResolvedStreamIdentity,{kind:'video'}>,af:Extract<ResourceFact,{kind:'audio'}>,vf:Extract<ResourceFact,{kind:'video'}>,provider:MediaStreamProvider){const a=streamRequest(audio,af),v=streamRequest(video,vf);void provider.open(a,{cancelled:false,onCancel:()=>()=>{}}).then(lease=>{const kind:'audio'=lease.identity.kind;void kind;});void v;
 // @ts-expect-error Fact kind is anchored by identity; it cannot widen to a mismatched union.
 streamRequest(audio,vf);
 // @ts-expect-error Image facts cannot become media stream requests.
 streamRequest(video,{kind:'image',id:'image',bytes:1,width:1,height:1});
}
