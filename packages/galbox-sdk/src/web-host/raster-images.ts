import {imageFilterRows} from '../protocol/image-filter.js';
import {Texture} from 'pixi.js';
import {ensure,canonicalWireJSON} from '../protocol/index.js';
import type {DeepReadonly,Snapshot,Task,RasterEffect,ImageFilter,ImageFilterState} from '../protocol/index.js';
import {rasterStep,rasterFilmSample} from '../protocol/raster.js';

interface Entry {
 key:string;canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;texture:Texture;
 source:CanvasImageSource|null;colored:HTMLCanvasElement|null;step:number;bytes:number;
}
export interface PreparedRasters {commit():void;cancel():void;}
type FilterEffect=ImageFilter&{kind:'filter'};
interface Work {id:string;key:string;asset:string;effect:DeepReadonly<RasterEffect|FilterEffect>;step:number;}
function taskWork(t:DeepReadonly<Task>):Work {const m=t.rasterTask;ensure(m,'RASTER_STATE','Raster state missing');return {id:t.id,key:JSON.stringify([t.id,m.startedAt,m.asset,m.signature]),asset:m.asset,effect:m.effect,step:rasterStep(t)};}
function filterWork(m:DeepReadonly<ImageFilterState>):Work {const effect:FilterEffect={kind:'filter',...m.effect},id='filter:'+canonicalWireJSON([m.asset,effect]);return {id,key:id,asset:m.asset,effect,step:0};}
function wanted(s:DeepReadonly<Snapshot>):Map<string,Work> {const out=new Map<string,Work>();for(const o of s.stage){if(o.rasterRef){const t=s.tasks.find(t=>t.id===o.rasterRef);ensure(t?.kind==='raster'&&t.rasterTask,'RASTER_REFERENCE','Raster task missing');out.set(t.id,taskWork(t));}if(o.imageFilter){const work=filterWork(o.imageFilter);out.set(work.id,work);}}return out;}
function cost(c:Work['effect']):number {return c.width*c.height*(8+(c.kind==='accumulate'&&(c.brightness!==1||c.grayscale!==0)?8:0));}
function surface(width:number,height:number){const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');ensure(context,'GRAPHICS_UNAVAILABLE','Procedural surface unavailable');context.imageSmoothingEnabled=false;return {canvas,context};}

/** Device-owned surfaces; all phase/configuration authority remains in Core. */
export class RasterImages {
 readonly diagnostics={bytesEstimated:0,peakBytesEstimated:0,surfaces:0,steps:0,yields:0};
 private entries=new Map<string,Entry>();private readonly live=new Set<Entry>();private readonly retired=new Set<Entry>();private disposed=false;
 constructor(private readonly images:ReadonlyMap<string,HTMLImageElement>,private readonly limit=67108864){}
 hasState(s:DeepReadonly<Snapshot>):boolean{return this.live.size>0||s.stage.some(o=>!!o.rasterRef||!!o.imageFilter);}
 validate(s:DeepReadonly<Snapshot>,extra:number):number {
  let bytes=0;for(const t of wanted(s).values()){const c=t.effect;bytes+=cost(c);if(c.kind!=='film'){const source=this.images.get(t.asset);ensure(source&&source.naturalWidth===c.width&&source.naturalHeight===c.height,'RASTER_SOURCE_SIZE','Accumulation source dimensions must match');}}
  if(bytes||this.live.size)ensure(Math.max(bytes,this.diagnostics.bytesEstimated)+extra<=this.limit,'RASTER_COMPOSITION_BUDGET','Procedural and existing workspaces exceed their unchanged limit');return bytes;
 }
 needsPreparation(s:DeepReadonly<Snapshot>):boolean {
  const tasks=wanted(s);if(tasks.size!==this.entries.size)return true;for(const [id,t]of tasks){const e=this.entries.get(id);if(!e||e.key!==t.key)return true;if(t.effect.kind==='accumulate'&&(e.step>t.step||t.step-e.step>32))return true;}return false;
 }
 private allocate(t:Work,extra:number):Entry {
  ensure(!this.disposed,'HOST_DISPOSED','Procedural renderer disposed');const c=t.effect,bytes=cost(c);ensure(this.diagnostics.bytesEstimated+bytes+extra<=this.limit,'RASTER_COMPOSITION_BUDGET','Procedural allocation exceeds workspace limit');const output=surface(c.width,c.height);let texture:Texture|undefined,colored:HTMLCanvasElement|null=null;
  try{let source:CanvasImageSource|null=null;if(c.kind!=='film'){const image=this.images.get(t.asset);ensure(image,'RASTER_SOURCE_IMAGE','Source image is not prepared');source=image;if(c.kind==='accumulate'&&(c.brightness!==1||c.grayscale!==0)){const hold=surface(c.width,c.height);colored=hold.canvas;hold.context.drawImage(image,0,0);const pixels=hold.context.getImageData(0,0,c.width,c.height),d=pixels.data;for(let n=0;n<d.length;n+=4){const r=d[n]!,g=d[n+1]!,b=d[n+2]!,gray=.2126*r+.7152*g+.0722*b;d[n]=(r*(1-c.grayscale)+gray*c.grayscale)*c.brightness;d[n+1]=(g*(1-c.grayscale)+gray*c.grayscale)*c.brightness;d[n+2]=(b*(1-c.grayscale)+gray*c.grayscale)*c.brightness;}hold.context.putImageData(pixels,0,0);source=colored;}}
   texture=Texture.from(output.canvas,true);const e:Entry={...output,texture,key:t.key,source,colored,step:c.kind==='accumulate'?0:-2,bytes};this.live.add(e);this.diagnostics.bytesEstimated+=bytes;this.diagnostics.peakBytesEstimated=Math.max(this.diagnostics.peakBytesEstimated,this.diagnostics.bytesEstimated);this.diagnostics.surfaces+=colored?2:1;return e;
  }catch(error){texture?.destroy(true);output.canvas.width=output.canvas.height=0;if(colored)colored.width=colored.height=0;throw error;}
 }
 private release(e:Entry):void {if(!this.live.delete(e))return;e.texture.destroy(true);e.canvas.width=e.canvas.height=0;if(e.colored)e.colored.width=e.colored.height=0;this.diagnostics.bytesEstimated-=e.bytes;this.diagnostics.surfaces-=e.colored?2:1;this.retired.delete(e);}
 private paint(e:Entry,t:Work,target:number):void {
  const c=t.effect,ctx=e.context;
  if(c.kind==='film'){ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.clearRect(0,0,c.width,c.height);if(target>=0){const sample=rasterFilmSample(c,target);ctx.fillStyle=sample.fill.color;ctx.globalAlpha=sample.fill.alpha;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle=c.lineColor;for(const line of sample.lines){ctx.globalAlpha=line.alpha;ctx.fillRect(line.x,0,1,c.height);}ctx.globalAlpha=1;ctx.fillStyle='#ffffff';for(const noise of sample.noise)ctx.fillRect(noise.x,noise.y,noise.width,noise.height);}e.step=target;this.diagnostics.steps++;return;}
  ensure(c.kind==='accumulate','IMAGE_FILTER_PREPARATION','Static filters must be prepared');ensure(e.source,'RASTER_SOURCE_IMAGE','Accumulation source absent');while(e.step<target){const step=++e.step,p=Math.min(1,step*c.intervalMs/c.durationMs),scale=c.fromScale+(c.toScale-c.fromScale)*p,alpha=Math.max(0,Math.min(255,Math.trunc((c.fromOpacity+(c.toOpacity-c.fromOpacity)*p)*255)))/255,x=c.width/2+c.moveX*p,y=c.height/2+c.moveY*p;ctx.save();try{ctx.globalCompositeOperation='source-over';ctx.globalAlpha=alpha;ctx.imageSmoothingEnabled=false;if(c.square){const size=Math.max(1,Math.round(c.height*scale));ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(e.source,Math.trunc((1-scale)*x),Math.trunc((1-scale)*y),size,size);}else{ctx.setTransform(1,0,0,1,0,0);ctx.translate(x,y);ctx.rotate(-(c.fromRotation+(c.toRotation-c.fromRotation)*p)*Math.PI/180);ctx.scale(scale,scale);ctx.translate(-x,-y);ctx.drawImage(e.source,0,0);}}finally{ctx.restore();}this.diagnostics.steps++;}
 }
 async prepare(s:DeepReadonly<Snapshot>,signal:AbortSignal,extra:number):Promise<PreparedRasters> {
  this.validate(s,extra);const tasks=wanted(s),bytes=[...tasks.values()].reduce((n,t)=>n+cost(t.effect),0);if(bytes||this.live.size)ensure(this.diagnostics.bytesEstimated+bytes+extra<=this.limit,'RASTER_COMPOSITION_BUDGET','Candidate overlap exceeds workspace limit');const next=new Map<string,Entry>();let settled=false;
  const cancelled=()=>ensure(!signal.aborted&&!this.disposed,'RASTER_PREPARATION_CANCELLED','Procedural preparation cancelled');
  try{cancelled();for(const [id,t]of tasks){cancelled();const entry=this.allocate(t,extra);next.set(id,entry);const old=this.entries.get(id),target=t.step;if(t.effect.kind==='accumulate'&&old?.key===entry.key&&old.step<=target){entry.context.drawImage(old.canvas,0,0);entry.step=old.step;}
    if(t.effect.kind==='filter'){ensure(this.diagnostics.bytesEstimated+extra+t.effect.width*t.effect.height*12+t.effect.width*16<=this.limit,'RASTER_COMPOSITION_BUDGET','Image filter scratch exceeds workspace budget');ensure(entry.source,'IMAGE_FILTER_SOURCE','Filter source missing');entry.context.drawImage(entry.source,0,0);const input=entry.context.getImageData(0,0,t.effect.width,t.effect.height),output=entry.context.createImageData(t.effect.width,t.effect.height);const {kind,...filter}=t.effect;for(const row of imageFilterRows(input.data,filter,output.data)){cancelled();this.diagnostics.yields++;await new Promise<void>(resolve=>setTimeout(resolve,0));cancelled();}entry.context.putImageData(output,0,0);entry.step=0;this.diagnostics.steps++;}else if(t.effect.kind==='film')this.paint(entry,t,target);else while(entry.step<target){this.paint(entry,t,Math.min(target,entry.step+32));cancelled();if(entry.step<target){this.diagnostics.yields++;await new Promise<void>(resolve=>setTimeout(resolve,0));cancelled();}}entry.texture.source.update();}
   cancelled();return {commit:()=>{if(settled)return;cancelled();settled=true;for(const e of this.entries.values())this.retired.add(e);this.entries=next;},cancel:()=>{if(settled)return;settled=true;for(const e of next.values())this.release(e);}};
  }catch(error){for(const e of next.values())this.release(e);throw error;}
 }
 private textureWork(t:Work):Texture {const e=this.entries.get(t.id);ensure(e&&e.key===t.key,'RASTER_PREPARATION','Procedural surface is not prepared');const target=t.step;if(e.step!==target){ensure(t.effect.kind==='film'||t.effect.kind==='accumulate'&&e.step<=target&&target-e.step<=32,'RASTER_PREPARATION','Large raster replay must be prepared');this.paint(e,t,target);e.texture.source.update();}return e.texture;}
 texture(t:DeepReadonly<Task>):Texture{return this.textureWork(taskWork(t));}
 filteredTexture(m:DeepReadonly<ImageFilterState>):Texture{return this.textureWork(filterWork(m));}
 finishFrame():void {for(const e of this.retired)this.release(e);}
 dispose():void {if(this.disposed)return;this.disposed=true;for(const e of this.live)this.release(e);this.entries.clear();this.retired.clear();}
}
