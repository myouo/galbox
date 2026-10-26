import {ensure,GalboxError,parseSaveThumbnail} from '../protocol/index.js';
import type {SaveThumbnail} from '../protocol/index.js';
export interface TextCapture {readonly svg:string;}
// Capture is synchronous: all computed values and scrolling belong to this cut.
export function captureText(roots:readonly HTMLElement[],mount:HTMLElement,fontCSS:string):TextCapture {
 const rect=mount.getBoundingClientRect();ensure(rect.width>0&&rect.height>0,'SAVE_CAPTURE_LAYOUT','Visible mount size is required');
 const wrapper=document.createElement('div');wrapper.style.cssText=`position:relative;width:${rect.width}px;height:${rect.height}px;overflow:hidden`;
 function copy(source:HTMLElement):HTMLElement {
  const clone=document.createElement(source.tagName),style=getComputedStyle(source);for(const property of style)clone.style.setProperty(property,style.getPropertyValue(property));
  clone.style.animation='none';clone.style.transition='none';clone.removeAttribute('id');
  for(const child of source.childNodes){if(child instanceof HTMLElement)clone.append(copy(child));else if(child.nodeType===Node.TEXT_NODE)clone.append(document.createTextNode(child.textContent??''));}
  if(source.scrollTop||source.scrollLeft){const content=document.createElement('div');content.style.transform=`translate(${-source.scrollLeft}px,${-source.scrollTop}px)`;content.append(...clone.childNodes);clone.append(content);}
  return clone;
 }
 for(const root of roots){const clone=copy(root),bounds=root.getBoundingClientRect();clone.style.position='absolute';clone.style.inset='auto';clone.style.left=`${bounds.left-rect.left}px`;clone.style.top=`${bounds.top-rect.top}px`;clone.style.width=`${bounds.width}px`;clone.style.height=`${bounds.height}px`;clone.style.margin='0';wrapper.append(clone);}
 const style=document.createElement('style');style.textContent=fontCSS;wrapper.prepend(style);
 const content=new XMLSerializer().serializeToString(wrapper),svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}"><foreignObject width="100%" height="100%">${content}</foreignObject></svg>`;
 ensure(svg.length<=4_000_000,'SAVE_CAPTURE_SIZE','Text capture exceeds 4 MB');return {svg};
}
export async function composeThumbnail(stage:HTMLCanvasElement,text:TextCapture,signal:AbortSignal):Promise<SaveThumbnail> {
 ensure(!signal.aborted,'SAVE_CAPTURE_CANCELLED','Capture cancelled');ensure(text&&typeof text.svg==='string'&&text.svg.length<=4_000_000,'SAVE_CAPTURE_TEXT','Invalid text capture');
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;const image=new Image();let timer:ReturnType<typeof setTimeout>|undefined,abort:()=>void=()=>{};
 try{
  const context=canvas.getContext('2d');ensure(context,'SAVE_CAPTURE_UNAVAILABLE','2D capture unavailable');context.drawImage(stage,0,0,320,180);
  await new Promise<void>((resolve,reject)=>{abort=()=>reject(new GalboxError('SAVE_CAPTURE_CANCELLED','Capture cancelled'));signal.addEventListener('abort',abort,{once:true});image.onload=()=>resolve();image.onerror=()=>reject(new GalboxError('SAVE_CAPTURE_TEXT','Text rasterization failed'));timer=setTimeout(()=>reject(new GalboxError('SAVE_CAPTURE_TIMEOUT','Text rasterization timed out')),5000);image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(text.svg);if(signal.aborted)abort();});
  ensure(!signal.aborted,'SAVE_CAPTURE_CANCELLED','Capture cancelled');context.drawImage(image,0,0,320,180);return parseSaveThumbnail({width:320,height:180,dataURL:canvas.toDataURL('image/png')});
 }catch(e){if(e instanceof GalboxError)throw e;throw new GalboxError('SAVE_CAPTURE_FAILED',e instanceof Error?e.message:String(e));}
 finally{if(timer)clearTimeout(timer);signal.removeEventListener('abort',abort);image.onload=null;image.onerror=null;image.src='';canvas.width=0;canvas.height=0;}
}
