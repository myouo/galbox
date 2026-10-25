import {createReleaseManifest} from '../../packages/galbox-sdk/src/release/index.js';
import type {DigestPort} from '../../packages/galbox-sdk/src/release/index.js';
export function releaseFactoryTypes(program:unknown,port:DigestPort){
 void createReleaseManifest({program,series:'one',resources:[{id:'picture',kind:'image',bytes:4,width:1,height:1}]},port);
 // @ts-expect-error The actual release factory retains resource kind/dimension association.
 void createReleaseManifest({program,series:'one',resources:[{id:'sound',kind:'audio',bytes:4,width:1,height:1}]},port);
}
