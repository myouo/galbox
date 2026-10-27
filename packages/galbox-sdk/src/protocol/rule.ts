import {ensure} from './index.js';
/** KRKR-compatible integer phase/threshold profile for opaque image pairs. */
export function rulePhase(progress:number,vague:number):number {ensure(Number.isFinite(progress)&&progress>=0&&progress<=1&&Number.isInteger(vague)&&vague>=1&&vague<=256,'STAGE_RULE_ARGUMENT','Invalid rule phase');return Math.floor(progress*(255+vague));}
export function ruleWeights(progress:number,vague:number,output:Uint16Array=new Uint16Array(256)):Uint16Array {
 const phase=rulePhase(progress,vague),low=phase-vague;ensure(output.length===256,'STAGE_RULE_ARGUMENT','Expected 256 weights');
 if(progress===1){output.fill(256);return output;}for(let mask=0;mask<256;mask++)output[mask]=mask>=phase?0:mask<low?256:255-Math.floor((mask-low)*255/vague);return output;
}
export function blendRulePixels(from:Uint8ClampedArray,to:Uint8ClampedArray,rule:Uint8Array,weights:Uint16Array,output:Uint8ClampedArray):void {
 ensure(from.length===to.length&&from.length===output.length&&from.length===rule.length*4&&weights.length===256,'STAGE_RULE_PIXELS','Mismatched image dimensions');
 for(let pixel=0,i=0;pixel<rule.length;pixel++,i+=4){const weight=weights[rule[pixel]!]!;
  if(weight===0||weight===256){const source=weight===0?from:to;output[i]=source[i]!;output[i+1]=source[i+1]!;output[i+2]=source[i+2]!;output[i+3]=source[i+3]!;continue;}
  const a=from[i+3]!,b=to[i+3]!;
  if(a===255&&b===255){for(let c=0;c<3;c++)output[i+c]=from[i+c]!+(((to[i+c]!-from[i+c]!)*weight)>>8);output[i+3]=255;continue;}
  const left=a*(256-weight),right=b*weight,sum=left+right;output[i+3]=sum>>8;for(let c=0;c<3;c++)output[i+c]=sum>0?Math.floor((from[i+c]!*left+to[i+c]!*right)/sum):0;
 }
}
