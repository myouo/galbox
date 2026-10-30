import {Filter,GlProgram,UniformGroup,Matrix,Texture} from 'pixi.js';
import type {Sprite,FilterSystem,RenderSurface} from 'pixi.js';
import {ensure} from '../protocol/index.js';
import type {DeepReadonly,Snapshot} from '../protocol/index.js';
import {rulePhase,ruleWeights} from '../protocol/rule.js';
interface Matte {canvas:HTMLCanvasElement;context:CanvasRenderingContext2D;data:ImageData;phase:string;}
export class GroupRuleCache {
 private image:HTMLImageElement|null=null;private gray:Uint8Array|null=null;private mattes:Matte[]=[];private readonly weights=new Uint16Array(256);
 constructor(private readonly images:ReadonlyMap<string,HTMLImageElement>,private readonly limit:number,private readonly canvasMode:boolean,private readonly ruleAsset:(id:string)=>string=id=>id){}
 validate(s:DeepReadonly<Snapshot>):number {const id=s.scene?.mix?.rule;if(!id)return 0;const image=this.images.get(this.ruleAsset(id));ensure(image&&image.naturalWidth>0&&image.naturalHeight>0,'STAGE_MIX_RULE_IMAGE','Rule image missing');const pixels=image.naturalWidth*image.naturalHeight,bytes=pixels*(this.canvasMode?25:9)+512;ensure(bytes<=this.limit,'RULE_COMPOSITION_BUDGET','Group rule workspace exceeds budget');if(this.image!==image){this.clear();const probe=document.createElement('canvas');probe.width=image.naturalWidth;probe.height=image.naturalHeight;try{const c=probe.getContext('2d',{willReadFrequently:true});ensure(c,'GRAPHICS_UNAVAILABLE','Rule readback unavailable');c.drawImage(image,0,0);const rgba=c.getImageData(0,0,probe.width,probe.height).data,gray=new Uint8Array(pixels);for(let n=0;n<pixels;n++){const i=n*4;ensure(rgba[i]===rgba[i+1]&&rgba[i]===rgba[i+2]&&rgba[i+3]===255,'STAGE_RULE_FORMAT','Rule must be opaque grayscale');gray[n]=rgba[i]!;}this.image=image;this.gray=gray;}finally{probe.width=probe.height=0;}}return bytes;}
 matte(progress:number,vague:number,inverse:boolean):HTMLCanvasElement {const image=this.image,gray=this.gray;ensure(image&&gray,'STAGE_MIX_RULE_IMAGE','Rule is not prepared');const slot=inverse?1:0;let m=this.mattes[slot];if(!m){const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;const context=canvas.getContext('2d');ensure(context,'GRAPHICS_UNAVAILABLE','Rule matte unavailable');const data=context.createImageData(canvas.width,canvas.height);data.data.fill(255);m={canvas,context,data,phase:''};this.mattes[slot]=m;}const phase=`${rulePhase(progress,vague)}:${vague}:${progress===1}`;if(m.phase!==phase){ruleWeights(progress,vague,this.weights);for(let n=0;n<gray.length;n++){const weight=this.weights[gray[n]!]!/256;m.data.data[n*4+3]=Math.round((inverse?1-weight:weight)*255);}m.context.putImageData(m.data,0,0);m.phase=phase;}return m.canvas;}
 clear():void {for(const m of this.mattes)if(m)m.canvas.width=m.canvas.height=0;this.mattes=[];this.gray=null;this.image=null;}
 dispose():void {this.clear();}
}
const vertex=`#version 300 es
precision highp float;
in vec2 aPosition;out vec2 vTextureCoord;out vec2 vMaskCoord;
uniform vec4 uInputSize;uniform vec4 uOutputFrame;uniform vec4 uOutputTexture;uniform mat3 uFilterMatrix;
void main(){vec2 p=aPosition*uOutputFrame.zw+uOutputFrame.xy;gl_Position=vec4(p.x*2.0/uOutputTexture.x-1.0,p.y*2.0*uOutputTexture.z/uOutputTexture.y-uOutputTexture.z,0.0,1.0);vTextureCoord=aPosition*uOutputFrame.zw*uInputSize.zw;vMaskCoord=(uFilterMatrix*vec3(vTextureCoord,1.0)).xy;}`;
const fragment=`#version 300 es
precision highp float;
in vec2 vTextureCoord;in vec2 vMaskCoord;uniform sampler2D uTexture;uniform sampler2D uMaskTexture;uniform vec4 uRuleParams;uniform vec2 uMaskSize;out vec4 finalColor;
void main(){float valid=step(0.0,vMaskCoord.x)*step(0.0,vMaskCoord.y)*step(vMaskCoord.x,1.0)*step(vMaskCoord.y,1.0);vec2 uv=(floor(vMaskCoord*uMaskSize)+0.5)/uMaskSize;float mask=floor(textureLod(uMaskTexture,uv,0.0).r*255.0+0.5);float phase=uRuleParams.x,low=phase-uRuleParams.y;float w=uRuleParams.w>0.5?1.0:(mask>=phase?0.0:mask<low?1.0:(255.0-floor((mask-low)*255.0/uRuleParams.y))/256.0);w*=valid;if(uRuleParams.z>0.5)w=1.0-w;finalColor=texture(uTexture,vTextureCoord)*w;}`;
const uniforms=()=>new UniformGroup({uFilterMatrix:{value:new Matrix(),type:'mat3x3<f32>'},uRuleParams:{value:new Float32Array(4),type:'vec4<f32>'},uMaskSize:{value:new Float32Array(2),type:'vec2<f32>'}});
export class GroupRuleFilter extends Filter {
 private readonly data:ReturnType<typeof uniforms>;private progress=0;private vague=64;
 constructor(private readonly sprite:Sprite,private readonly cache:GroupRuleCache,private readonly inverse:boolean){const data=uniforms();super({glProgram:GlProgram.from({vertex,fragment,name:'galbox-group-rule'}),resources:{ruleUniforms:data,uMaskTexture:Texture.EMPTY.source},padding:0,clipToViewport:true});this.data=data;this.blendMode='add';}
 configure(progress:number,vague:number):void {this.progress=progress;this.vague=vague;this.data.uniforms.uRuleParams.set([rulePhase(progress,vague),vague,this.inverse?1:0,progress===1?1:0]);this.data.uniforms.uMaskSize.set([this.sprite.texture.width,this.sprite.texture.height]);this.resources.uMaskTexture=this.sprite.texture.source;}
 releaseTexture():void {this.resources.uMaskTexture=Texture.EMPTY.source;}
 override apply(manager:FilterSystem,input:Texture,output:RenderSurface,clear:boolean):void {manager.calculateSpriteMatrix(this.data.uniforms.uFilterMatrix,this.sprite);this.resources.uMaskTexture=this.sprite.texture.source;manager.applyFilter(this,input,output,clear);}
 applyCanvas(context:CanvasRenderingContext2D,padding:number):void {const mask=this.cache.matte(this.progress,this.vague,this.inverse),m=this.sprite.getGlobalTransform(new Matrix());context.save();try{context.setTransform(m.a,m.b,m.c,m.d,m.tx+padding,m.ty+padding);context.globalAlpha=1;context.globalCompositeOperation='destination-in';context.imageSmoothingEnabled=false;context.drawImage(mask,0,0);}finally{context.restore();}}
}
