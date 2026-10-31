import {ensure,parseImageFilter,canonicalWireJSON} from './index.js';
import type {ImageFilter,DeepReadonly,Snapshot,Program} from './index.js';
import {sourceSignature} from './stage.js';

/** RGBA8, tint before alpha-aware clipped box averaging; caller input is isolated. */
export function* imageFilterRows(input:Uint8ClampedArray,definition:DeepReadonly<ImageFilter>,output:Uint8ClampedArray):Generator<number,void> {
 const c=parseImageFilter(definition),{width:w,height:h,radiusX:rx,radiusY:ry}=c;ensure(input.length===w*h*4&&output.length===input.length,'IMAGE_FILTER_BYTES','RGBA dimensions differ');const data=new Uint8ClampedArray(input),color=parseInt(c.color.slice(1),16),rgb=[color>>>16&255,color>>>8&255,color&255],opacity=c.opacity;
 if(c.channelCeil){const ceilings=[c.channelCeil.red,c.channelCeil.green,c.channelCeil.blue];for(let i=0;i<data.length;i+=4)if(data[i+3])for(let k=0;k<3;k++)data[i+k]=Math.floor(data[i+k]!/255*ceilings[k]!+.5);}
 if(opacity)for(let i=0;i<data.length;i+=4){const a=data[i+3]!;let weight=255;if(a){const at=Math.fround(a/255),bt=Math.fround(opacity/255),ratio=Math.fround(bt/at);weight=Math.min(255,Math.trunc(Math.fround(Math.fround(ratio/(1-bt+ratio))*255)));}for(let k=0;k<3;k++)data[i+k]=opacity===255?rgb[k]!:data[i+k]!+((rgb[k]!-data[i+k]!)*weight>>8);data[i+3]=opacity===255?255:255-((255-a)*(255-opacity)>>8);}
 if(!rx&&!ry){output.set(data);return;}
 const columns=new Uint32Array(w*4),addRow=(y:number,sign:number)=>{for(let x=0;x<w;x++){const i=(y*w+x)*4,a=data[i+3]!,adjusted=a+(a>>7),j=x*4;for(let k=0;k<3;k++)columns[j+k]=columns[j+k]!+sign*(data[i+k]!*adjusted>>8);columns[j+3]=columns[j+3]!+sign*a;}};
 for(let y=0;y<=Math.min(h-1,ry);y++)addRow(y,1);const fast=(rx*2+1)*(ry*2+1)<256;
 for(let y=0;y<h;y++){const vertical=Math.min(h-1,y+ry)-Math.max(0,y-ry)+1,sum=[0,0,0,0];for(let x=0;x<=Math.min(w-1,rx);x++)for(let k=0;k<4;k++)sum[k]=sum[k]!+columns[x*4+k]!;
  for(let x=0;x<w;x++){const horizontal=Math.min(w-1,x+rx)-Math.max(0,x-rx)+1,n=horizontal*vertical,half=n>>1,reciprocal=fast?Math.floor(65536/n):0,average=(value:number)=>fast?Math.floor((value+half)*reciprocal/65536):Math.floor((value+half)/n),alpha=average(sum[3]!),i=(y*w+x)*4;for(let k=0;k<3;k++)output[i+k]=alpha?Math.min(255,Math.floor(average(sum[k]!)*255/alpha)):0;output[i+3]=alpha;
   const remove=x-rx,add=x+rx+1;for(let k=0;k<4;k++){if(remove>=0)sum[k]=sum[k]!-columns[remove*4+k]!;if(add<w)sum[k]=sum[k]!+columns[add*4+k]!;}}
  const remove=y-ry,add=y+ry+1;if(remove>=0)addRow(remove,-1);if(add<h)addRow(add,1);if((y+1)%32===0)yield y+1;
 }
}
export function filterImageRGBA(input:Uint8ClampedArray,effect:DeepReadonly<ImageFilter>):Uint8ClampedArray {const output=new Uint8ClampedArray(input.length);for(const _ of imageFilterRows(input,effect,output)){}return output;}
export function validateImageFilters(p:Program,s:Snapshot):void {const code=new Map(p.functions.flatMap(f=>f.code).map(i=>[i.at,i]));for(const o of s.stage){const m=o.imageFilter;if(!m)continue;const i=code.get(m.at);ensure(i?.op==='stage.image.filtered'&&p.capabilities.includes('stage.raster')&&(!m.effect.channelCeil||p.capabilities.includes('stage.channel-ceil'))&&i.asset===m.asset&&o.asset===m.asset&&m.signature===sourceSignature(i)&&canonicalWireJSON(i.effect)===canonicalWireJSON(m.effect)&&!o.rasterRef&&!o.frame&&!o.layers&&!o.ruleTransition,'RESTORE_IMAGE_FILTER','Image filter source/config/reference changed');}}
