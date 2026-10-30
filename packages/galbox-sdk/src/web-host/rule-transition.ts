import {Texture} from 'pixi.js';
import {ensure} from '../protocol/index.js';
import type {Snapshot,DeepReadonly,RuleTransition} from '../protocol/index.js';
import {rulePhase,ruleWeights,blendRulePixels} from '../protocol/rule.js';
export const defaultRuleBytes=67108864;
interface Entry {canvas:HTMLCanvasElement;texture:Texture;context:CanvasRenderingContext2D;from:Uint8ClampedArray;to:Uint8ClampedArray;mask:Uint8Array;output:ImageData;weights:Uint16Array;phase:number;inputs:readonly HTMLImageElement[];bytes:number;}
export class RuleTransitions {
 readonly diagnostics={bytesEstimated:0,peakBytesEstimated:0,surfaces:0,frames:0};
 private readonly entries=new Map<string,Entry>();private readonly checked=new WeakSet<HTMLImageElement>();
 constructor(private readonly images:ReadonlyMap<string,HTMLImageElement>,private readonly limit=defaultRuleBytes,private readonly ruleAsset:(id:string)=>string=id=>id){}
 private image(id:string):HTMLImageElement {const image=this.images.get(id);ensure(image&&image.naturalWidth>0&&image.naturalHeight>0,'STAGE_RULE_IMAGE',id);return image;}
 private inputs(to:string,state:DeepReadonly<RuleTransition>):[HTMLImageElement,HTMLImageElement,HTMLImageElement] {const result:[HTMLImageElement,HTMLImageElement,HTMLImageElement]=[this.image(state.from),this.image(to),this.image(this.ruleAsset(state.rule))],first=result[0];ensure(result.every(i=>i.naturalWidth===first.naturalWidth&&i.naturalHeight===first.naturalHeight),'STAGE_RULE_SIZE','Source, target and rule dimensions must match');return result;}
 validate(snapshot:DeepReadonly<Snapshot>):number {let bytes=0;for(const object of snapshot.stage){const state=object.ruleTransition;if(!state)continue;const images=this.inputs(object.asset,state),rule=images[2],pixels=rule.naturalWidth*rule.naturalHeight;bytes+=pixels*21+512;ensure(Number.isSafeInteger(bytes)&&bytes<=this.limit,'RULE_COMPOSITION_BUDGET',`Rule surfaces require ${bytes} bytes, limit ${this.limit}`);
   if(!this.checked.has(rule)){ensure(this.diagnostics.bytesEstimated+pixels*8<=this.limit,'RULE_COMPOSITION_BUDGET','Rule validation workspace exceeds budget');const canvas=document.createElement('canvas');canvas.width=rule.naturalWidth;canvas.height=rule.naturalHeight;try{const context=canvas.getContext('2d',{willReadFrequently:true});ensure(context,'GRAPHICS_UNAVAILABLE','Rule readback context unavailable');context.drawImage(rule,0,0);const d=context.getImageData(0,0,canvas.width,canvas.height).data;for(let i=0;i<d.length;i+=4)ensure(d[i]===d[i+1]&&d[i]===d[i+2]&&d[i+3]===255,'STAGE_RULE_FORMAT','Rule must be opaque grayscale');this.checked.add(rule);}finally{canvas.width=canvas.height=0;}}
  }return bytes;
 }
 prune(snapshot:DeepReadonly<Snapshot>):void {for(const [id,entry]of this.entries){const object=snapshot.stage.find(o=>o.id===id);if(!object?.ruleTransition||this.inputs(object.asset,object.ruleTransition).some((image,i)=>image!==entry.inputs[i]))this.release(id,entry);}}
 private release(id:string,entry:Entry):void {entry.texture.destroy(true);entry.canvas.width=entry.canvas.height=0;this.entries.delete(id);this.diagnostics.bytesEstimated-=entry.bytes;this.diagnostics.surfaces--;}
 texture(id:string,to:string,state:DeepReadonly<RuleTransition>):Texture {
  const images=this.inputs(to,state);let entry=this.entries.get(id);if(entry&&entry.inputs.some((image,i)=>image!==images[i])){this.release(id,entry);entry=undefined;}
  if(!entry){const width=images[0].naturalWidth,height=images[0].naturalHeight,bytes=width*height*21+512;ensure(this.diagnostics.bytesEstimated+bytes<=this.limit,'RULE_COMPOSITION_BUDGET','Rule allocation exceeds budget');const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;let texture:Texture|undefined;
   try{const context=canvas.getContext('2d',{willReadFrequently:true});ensure(context,'GRAPHICS_UNAVAILABLE','Rule composition context unavailable');const read=(image:HTMLImageElement)=>{context.clearRect(0,0,width,height);context.drawImage(image,0,0);return context.getImageData(0,0,width,height);},from=read(images[0]).data,target=read(images[1]).data,output=read(images[2]),mask=new Uint8Array(width*height);for(let i=0;i<mask.length;i++)mask[i]=output.data[i*4]!;texture=Texture.from(canvas,true);entry={canvas,texture,context,from,to:target,output,mask,weights:new Uint16Array(256),phase:-1,inputs:images,bytes};this.entries.set(id,entry);this.diagnostics.bytesEstimated+=bytes;this.diagnostics.peakBytesEstimated=Math.max(this.diagnostics.peakBytesEstimated,this.diagnostics.bytesEstimated);this.diagnostics.surfaces++;}
   catch(error){texture?.destroy(true);canvas.width=canvas.height=0;throw error;}
  }
  const phase=(state.progress===1?512:rulePhase(state.progress,state.vague))+state.vague*1024;if(entry.phase!==phase){ruleWeights(state.progress,state.vague,entry.weights);blendRulePixels(entry.from,entry.to,entry.mask,entry.weights,entry.output.data);entry.context.putImageData(entry.output,0,0);entry.texture.source.update();entry.phase=phase;this.diagnostics.frames++;}return entry.texture;
 }
 dispose():void {for(const [id,entry]of this.entries)this.release(id,entry);}
}
