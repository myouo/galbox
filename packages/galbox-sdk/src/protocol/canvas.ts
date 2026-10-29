import {ensure} from './index.js';
import type {Snapshot,DeepReadonly,StageFilters} from './index.js';
export const defaultCanvasBytes=67108864;
export interface CanvasPlan {width:number;height:number;padding:number;depth:number;blur:boolean;color:boolean;bytes:number;}
function filtered(f:DeepReadonly<StageFilters>|undefined):boolean{return !!f&&(f.blur>0||f.brightness!==1||f.grayscale!==0);}
export function canvasPlan(s:DeepReadonly<Snapshot>,nativeBlur:boolean,limit=defaultCanvasBytes):CanvasPlan {
 const objects=new Map(s.stage.map(o=>[o.id,o])),root=(filtered(s.scene?.filters)?1:0)+(s.scene?.mix?2:0);let depth=root,blur=(s.scene?.filters.blur??0)>0,color=!!s.scene&&(s.scene.filters.brightness!==1||s.scene.filters.grayscale!==0),radius=s.scene?.filters.blur??0;
 for(const o of s.stage){let count=root,spread=s.scene?.filters.blur??0,current:typeof o|undefined=o;const seen=new Set<string>();while(current){ensure(!seen.has(current.id),'CANVAS_GRAPH','Cyclic parent graph');seen.add(current.id);if(filtered(current.filters))count++;spread+=current.filters?.blur??0;if((current.filters?.blur??0)>0)blur=true;if(current.filters&&(current.filters.brightness!==1||current.filters.grayscale!==0))color=true;current=current.parent?objects.get(current.parent):undefined;}depth=Math.max(depth,count+((o.layers?.length??1)>1?1:0));radius=Math.max(radius,spread);}
 const padding=radius>0?Math.ceil(radius*3/32)*32:0,width=1280+padding*2,height=720+padding*2,pixels=width*height,workspace=blur?(nativeBlur?4+(color?4:0):36):color?4:0,bytes=1280*720*4+pixels*(depth*4+workspace);
 ensure(depth<=10&&width<=4096&&height<=4096&&Number.isSafeInteger(bytes)&&bytes<=limit,'CANVAS_COMPOSITION_BUDGET',`Canvas composition needs ${bytes} bytes, limit ${limit}`);return {width,height,padding,depth,blur,color,bytes};
}
