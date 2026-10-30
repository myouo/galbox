import {ensure,parseDialoguePresentation} from '../protocol/index.js';
import type {DialoguePresentation,PresentationAssetCatalog,Program,Snapshot,DeepReadonly} from '../protocol/index.js';
export function dialoguePresentation(input:unknown,program:Program,catalog?:PresentationAssetCatalog):DialoguePresentation {
 const value=parseDialoguePresentation(input??{objects:[],images:[]});
 ensure(new Set(value.images.map(v=>v.source)).size===value.images.length,'DIALOGUE_IMAGE_DUPLICATE','Each source image has one alternative');
 for(const pair of value.images){ensure(program.assets.some(a=>a.id===pair.source&&a.kind==='image'),'DIALOGUE_IMAGE_KIND','Dialogue sources must be Program images');ensure([...program.assets,...catalog?.assets??[]].some(a=>a.id===pair.hidden&&a.kind==='image'),'DIALOGUE_IMAGE_KIND','Dialogue alternatives must be declared images');}
 return value;
}
export function assertDialogueCut(snapshot:DeepReadonly<Snapshot>):void {
 ensure(snapshot.wait?.kind==='text'&&!snapshot.scene?.mix&&!snapshot.stage.some(o=>o.layers||o.ruleTransition),'DIALOGUE_CUT_UNSUPPORTED','Hide dialogue only at a text cut without an image transition');
}
export function dialogueAssets(snapshot:DeepReadonly<Snapshot>,view:DialoguePresentation):string[]{const hidden=new Set(view.objects),images=new Map(view.images.map(v=>[v.source,v.hidden]));return [...new Set(snapshot.stage.flatMap(o=>!hidden.has(o.id)&&images.has(o.asset)?[images.get(o.asset)!]:[]))];}
/** View-only projection. None of these objects are committed to Core or storage. */
export function projectDialogue(snapshot:DeepReadonly<Snapshot>,view:DialoguePresentation):DeepReadonly<Snapshot>{const hidden=new Set(view.objects),images=new Map(view.images.map(v=>[v.source,v.hidden]));return {...snapshot,stage:snapshot.stage.map(o=>hidden.has(o.id)?{...o,visible:false}:images.has(o.asset)?{...o,asset:images.get(o.asset)!}:o)};}
