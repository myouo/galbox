import {Texture,Rectangle} from 'pixi.js';
import type {ImageFrame,Snapshot,DeepReadonly} from '../protocol/index.js';
import {ensure} from '../protocol/index.js';
/** Views share the loaded base texture; destroying a view never destroys its source. */
export class SpriteFrames {
 private readonly cache=new Map<string,{base:Texture;view:Texture}>();private readonly seen=new Set<string>();private readonly bases=new Set<Texture>();
 validate(s:DeepReadonly<Snapshot>,textures:ReadonlyMap<string,Texture>):void {const check=(id:string,f:DeepReadonly<ImageFrame>)=>{const t=textures.get(id);ensure(t&&f.x+f.width<=t.width&&f.y+f.height<=t.height,'STAGE_FRAME_BOUNDS','Sprite frame exceeds its actual image');};for(const o of s.stage)if(o.frame)for(const id of new Set([o.asset,...(o.layers??[]).map(l=>l.asset)]))check(id,o.frame);for(const task of s.tasks)if(task.kind==='particles'&&task.status==='running'&&task.particleTask){const m=task.particleTask;for(const n of new Set(m.particles.map(p=>p.style))){const style=m.config.styles[n]!;for(const frame of style.frames)check(style.asset,frame);}}}
 begin():void {this.seen.clear();this.bases.clear();}
 get(base:Texture,frame:DeepReadonly<ImageFrame>|undefined):Texture {if(!frame)return base;const key=[base.uid,frame.x,frame.y,frame.width,frame.height].join(':');this.seen.add(key);this.bases.add(base);let entry=this.cache.get(key);if(!entry){ensure(this.cache.size<1024&&this.seen.size<=512,'STAGE_FRAME_BUDGET','At most 512 active sprite frame views');entry={base,view:new Texture({source:base.source,frame:new Rectangle(frame.x,frame.y,frame.width,frame.height)})};}this.cache.delete(key);this.cache.set(key,entry);return entry.view;}
 end():void {for(const [key,e]of this.cache)if(!this.bases.has(e.base)||this.cache.size>512&&!this.seen.has(key)){e.view.destroy(false);this.cache.delete(key);}}
 dispose():void {for(const entry of this.cache.values())entry.view.destroy(false);this.cache.clear();this.seen.clear();this.bases.clear();}
}
