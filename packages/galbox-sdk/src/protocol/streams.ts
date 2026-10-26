import {canonicalWireJSON,ensure} from './index.js';
import type {Program} from './index.js';
export function streamCatalog(p:Program):string|undefined {if(!p.capabilities.includes('media.stream'))return;const token=canonicalWireJSON(p.assets);ensure(token.length<=65536,'STREAM_CATALOG_SIZE','Streaming catalog exceeds supported snapshot bound');return token;}
