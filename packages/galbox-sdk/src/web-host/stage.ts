import {RuleTransitions} from './rule-transition.js';
import {Container,Sprite,Graphics,BlurFilter,ColorMatrixFilter,AlphaFilter} from 'pixi.js';
import {CanvasEffects} from './canvas-effects.js';
import {WebGLRenderer,CanvasRenderer} from 'pixi.js';
import type {Texture,Filter} from 'pixi.js';
import type {GraphicsApplication} from './graphics.js';
import {ensure} from '../protocol/index.js';
import type {Snapshot,DeepReadonly,StageFilters,InteractionRect} from '../protocol/index.js';
import {objectPose,identityFilters,initialScene} from '../protocol/stage.js';
class Filters {
 private blur:BlurFilter|null=null;private color:ColorMatrixFilter|null=null;private key='';
 apply(node:Container,state:DeepReadonly<StageFilters>):void {const key=JSON.stringify(state);if(key===this.key)return;this.key=key;const filters:Filter[]=[];
  if(state.blur>0){this.blur??=new BlurFilter({strength:state.blur,quality:4});this.blur.strength=state.blur;filters.push(this.blur);}
  if(state.brightness!==1||state.grayscale!==0){this.color??=new ColorMatrixFilter();const g=state.grayscale,b=state.brightness,r=.2126*g,k=.7152*g,l=.0722*g;this.color.matrix=[(1-g+r)*b,k*b,l*b,0,0,r*b,(1-g+k)*b,l*b,0,0,r*b,k*b,(1-g+l)*b,0,0,0,0,0,1,0];filters.push(this.color);}
  node.filters=filters;
 }
 dispose():void {this.blur?.destroy(false);this.color?.destroy(false);this.blur=null;this.color=null;}
}
interface Display {root:Container;image:Container;compositor:AlphaFilter|null;sprites:Sprite[];mask:Graphics|null;clipKey:string;filters:Filters;}
export class ImageStage {
 private video:Sprite|null=null;private readonly world=new Container();private readonly overlay=new Graphics();private readonly filters=new Filters();private readonly displays=new Map<string,Display>();private key:string|null=null;private disposed=false;private readonly effects:CanvasEffects|undefined;private readonly rules:RuleTransitions;
 constructor(private readonly app:GraphicsApplication,private readonly textures:ReadonlyMap<string,Texture>,images:ReadonlyMap<string,HTMLImageElement>,private readonly maxCanvasBytes?:number,maxRuleBytes?:number){this.rules=new RuleTransitions(images,maxRuleBytes);this.effects=app.renderer instanceof CanvasRenderer?new CanvasEffects(app.renderer,maxCanvasBytes):undefined;this.world.sortableChildren=true;this.world.zIndex=0;this.overlay.zIndex=1;app.stage.addChild(this.world,this.overlay);}
 canvasDiagnostics(){return this.effects?.diagnostics;}
 ruleDiagnostics(){return this.rules.diagnostics;}
 validate(snapshot:DeepReadonly<Snapshot>):void {const bytes=this.rules.validate(snapshot),canvas=this.effects?.validate(snapshot);if(canvas)ensure(bytes+canvas.bytes<=(this.maxCanvasBytes??67108864),'CANVAS_COMPOSITION_BUDGET','Combined Canvas and rule composition exceeds budget');}
 setVideo(texture:Texture|null,rect:InteractionRect|null):void {if(this.video){this.video.destroy();this.video=null;}if(texture&&rect){this.video=new Sprite(texture);this.video.label='galbox-video';this.video.position.set(rect.x,rect.y);this.video.width=rect.width;this.video.height=rect.height;this.video.zIndex=2;this.app.stage.addChild(this.video);}this.invalidate();}
 invalidate():void {this.key=null;}
 render(snapshot:DeepReadonly<Snapshot>):void {
  if(this.disposed)return;const key=JSON.stringify({stage:snapshot.stage,scene:snapshot.scene});if(key===this.key)return;this.rules.prune(snapshot);
  for(const display of this.displays.values())display.root.removeFromParent();
  for(const [id,d]of this.displays)if(!snapshot.stage.some(o=>o.id===id)){d.filters.dispose();d.compositor?.destroy(false);d.root.destroy({children:true});this.displays.delete(id);}
  for(const o of snapshot.stage){let d=this.displays.get(o.id);if(!d){const root=new Container();root.label=`galbox:${o.id}`;root.sortableChildren=true;const image=new Container();root.addChild(image);d={root,image,compositor:null,sprites:[],mask:null,clipKey:'',filters:new Filters()};this.displays.set(o.id,d);}const pose=objectPose(o),layers=o.layers??[{asset:o.asset,weight:1}];
   while(d.sprites.length>layers.length)d.sprites.pop()?.destroy();
   layers.forEach((layer,index)=>{const texture=o.ruleTransition?this.rules.texture(o.id,o.asset,o.ruleTransition):this.textures.get(layer.asset);ensure(texture,'TEXTURE_MISSING',layer.asset);let sprite=d.sprites[index];if(!sprite){sprite=new Sprite(texture);d.sprites.push(sprite);d.image.addChild(sprite);}sprite.texture=texture;sprite.alpha=layer.weight;sprite.anchor.set(pose.anchorX,pose.anchorY);sprite.blendMode=layers.length>1?'add':o.blend??'normal';});
   if(layers.length>1){d.compositor??=new AlphaFilter({alpha:1});d.compositor.blendMode=o.blend??'normal';d.image.filters=[d.compositor];}else d.image.filters=[];
   d.root.position.set(pose.x+(o.shake?.x??0),pose.y+(o.shake?.y??0));d.root.scale.set(pose.scaleX,pose.scaleY);d.root.rotation=pose.rotation*Math.PI/180;d.root.skew.set(pose.skewX*Math.PI/180,pose.skewY*Math.PI/180);d.root.pivot.set(pose.pivotX,pose.pivotY);d.root.alpha=pose.alpha;d.root.visible=o.visible??true;d.root.zIndex=o.z;d.filters.apply(d.root,o.filters??identityFilters);
   const clipKey=JSON.stringify(o.clip??null);if(clipKey!==d.clipKey){d.clipKey=clipKey;if(o.clip){d.mask??=new Graphics();if(!d.mask.parent)d.root.addChild(d.mask);d.mask.clear().rect(o.clip.x,o.clip.y,o.clip.width,o.clip.height).fill(0xffffff);d.root.mask=d.mask;}else if(d.mask){d.root.mask=null;d.mask.removeFromParent();d.mask.destroy();d.mask=null;}}
  }
  for(const o of snapshot.stage){const d=this.displays.get(o.id);ensure(d,'STAGE_RENDER','Object absent');const parent=o.parent?this.displays.get(o.parent)?.root:this.world;ensure(parent,'STAGE_RENDER','Parent absent');parent.addChild(d.root);}
  const scene=snapshot.scene??initialScene(),camera=scene.camera;this.world.position.set(640+(scene.shake?.x??0),360+(scene.shake?.y??0));this.world.pivot.set(camera.x,camera.y);this.world.scale.set(camera.zoom);this.world.rotation=-camera.rotation*Math.PI/180;this.filters.apply(this.world,scene.filters);this.overlay.clear();if(scene.overlay.alpha>0)this.overlay.rect(0,0,1280,720).fill({color:scene.overlay.color,alpha:scene.overlay.alpha});
  if(this.effects)this.effects.draw(snapshot,()=>this.app.render());else this.app.render();if(this.app.renderer instanceof WebGLRenderer)this.app.renderer.gl.flush();this.key=key;
 }
 dispose():void {if(this.disposed)return;this.disposed=true;this.video?.destroy();this.video=null;this.effects?.dispose();this.rules.dispose();for(const d of this.displays.values())d.root.removeFromParent();for(const d of this.displays.values()){d.filters.dispose();d.compositor?.destroy(false);d.root.destroy({children:true});}this.displays.clear();this.filters.dispose();this.world.removeFromParent();this.world.destroy({children:true});this.overlay.removeFromParent();this.overlay.destroy();this.key=null;}
}
