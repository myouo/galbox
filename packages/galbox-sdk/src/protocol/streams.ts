import {wireDigest} from './digest.js';
import {canonicalWireJSON,ensure} from './index.js';
import type {Program} from './index.js';
export function streamCatalog(p:Program):string|undefined {if(!p.capabilities.includes('media.stream'))return;const token=canonicalWireJSON(p.assets);return token.length<=65536?token:'sha256:'+wireDigest(p.assets);}
