import {parseDialoguePresentation,ensure} from '../protocol/index.js';
import type {AssetRef} from './linker.js';
export function dialoguePresentation(objects:readonly string[],images:readonly {source:AssetRef<'image'>;hidden:AssetRef<'image'>}[]=[]){for(const pair of images)ensure(pair.source.kind==='image'&&pair.hidden.kind==='image','DIALOGUE_IMAGE_KIND','Use image references');return parseDialoguePresentation({objects:[...objects],images:images.map(pair=>({source:pair.source.id,hidden:pair.hidden.id}))});}
