import {Application,CanvasRenderer,WebGLRenderer} from 'pixi.js';
import {ensure,GalboxError} from '../protocol/index.js';
import type {GraphicsOptions,Program,Snapshot,DeepReadonly,StageFilters,StageObject} from '../protocol/index.js';
export type GraphicsApplication=Application<WebGLRenderer|CanvasRenderer>;
export type GraphicsBackend='webgl'|'canvas';
function hasFilters(f:DeepReadonly<StageFilters>|undefined):boolean{return !!f&&(f.blur!==0||f.brightness!==1||f.grayscale!==0);}
function supportedObject(o:DeepReadonly<StageObject>):boolean{return !hasFilters(o.filters)&&!o.layers;}
type BlendMap=CanvasRenderer['canvasContext']['blendModes'];
function validateBlend(blend:StageObject['blend'],map:BlendMap):void {if(blend)ensure(map[blend]===({normal:'source-over',add:'lighter',multiply:'multiply',screen:'screen'} as const)[blend],'GRAPHICS_FEATURE_UNSUPPORTED',`Canvas device does not support ${blend} blending`);}
export function validateCanvasProgram(program:DeepReadonly<Program>,map:BlendMap):void {
 for(const f of program.functions)for(const i of f.code){
  if(i.op==='stage.put')validateBlend(i.object.blend,map);if(i.op==='stage.image')validateBlend(i.style?.blend,map);if(i.op==='stage.style')validateBlend(i.style.blend,map);
  ensure(i.op!=='stage.filter'&&i.op!=='stage.transition'&&(i.op!=='stage.put'||supportedObject(i.object)),'GRAPHICS_FEATURE_UNSUPPORTED',`Canvas compatibility mode cannot execute filters or crossfade at ${i.at}`);
 }
}
export function validateCanvasSnapshot(snapshot:DeepReadonly<Snapshot>,map:BlendMap):void {
 snapshot.stage.forEach(o=>validateBlend(o.blend,map));
 ensure(!hasFilters(snapshot.scene?.filters)&&snapshot.stage.every(supportedObject)&&!snapshot.tasks.some(t=>t.status==='running'&&(t.stageTask?.type==='filter'||t.stageTask?.type==='transition')),'GRAPHICS_FEATURE_UNSUPPORTED','Canvas compatibility mode cannot restore GPU filters or layered crossfade');
}
// Application has no renderer until asynchronous initialization succeeds.
export function destroyGraphicsApplication(app:GraphicsApplication|null):void {if(app?.renderer)app.destroy({removeView:true,releaseGlobalResources:false},{children:true});}
export async function prepareGraphics(options:GraphicsOptions,cancelled:()=>boolean,own:(app:GraphicsApplication)=>void):Promise<{app:GraphicsApplication;backend:GraphicsBackend;fallback:string|null}> {
 let fallback:string|null=null;
 for(const backend of options.renderer==='auto'?['webgl','canvas'] as const:[options.renderer]){
  ensure(!cancelled(),'HOST_DISPOSED','Graphics initialization cancelled');const canvas=document.createElement('canvas');let gl:WebGL2RenderingContext|null=null;
  if(backend==='webgl')try{gl=canvas.getContext('webgl2',{stencil:true,antialias:true});}catch{}
  if(backend==='webgl'&&!gl){if(options.renderer!=='auto')throw new GalboxError('GRAPHICS_UNAVAILABLE','WebGL is unavailable; use auto or canvas mode');fallback='WebGL context unavailable';continue;}
  const app:GraphicsApplication=new Application<WebGLRenderer|CanvasRenderer>();own(app);
  try{
   await app.init({width:1280,height:720,canvas,...(gl?{context:gl}:{}),preference:[backend],background:'#122c44',antialias:true,autoStart:false});
   if(cancelled()){destroyGraphicsApplication(app);throw new GalboxError('HOST_DISPOSED','Graphics initialization cancelled');}
   ensure(backend==='webgl'?app.renderer instanceof WebGLRenderer:app.renderer instanceof CanvasRenderer,'GRAPHICS_UNAVAILABLE','Selected graphics backend did not initialize');
   return {app,backend,fallback};
  }catch(error){
   // Cancelled late success was already destroyed above. Failed partial GL init still owns its canvas/context.
   if(app.renderer)destroyGraphicsApplication(app);else {app.stage?.destroy({children:true});gl?.getExtension('WEBGL_lose_context')?.loseContext();canvas.remove();}
   if(cancelled())throw new GalboxError('HOST_DISPOSED','Graphics initialization cancelled');
   if(backend==='canvas'||options.renderer!=='auto')throw new GalboxError('GRAPHICS_UNAVAILABLE',`${backend} initialization failed: ${error instanceof Error?error.message:String(error)}`);
   fallback='WebGL initialization failed';
  }
 }
 throw new GalboxError('GRAPHICS_UNAVAILABLE','No supported graphics backend');
}
