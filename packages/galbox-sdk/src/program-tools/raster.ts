import {ensure,parseInstruction} from '../protocol/index.js';
import type {RasterEffect} from '../protocol/index.js';
import type {AssetRef} from './linker.js';
export function stageRaster(at:string,task:string,targets:readonly string[],source:AssetRef<'image'>,effect:RasterEffect,options:{loop?:boolean;delayMs?:number;policy?:'reject'|'replace'}={}){
 ensure(source.kind==='image','ASSET_KIND','Raster source must be an image');
 const value=parseInstruction({op:'stage.raster',at,task,targets:[...targets],asset:source.id,effect,loop:options.loop??false,delayMs:options.delayMs??0,policy:options.policy??'reject'});ensure(value.op==='stage.raster','RASTER_FACTORY','Unexpected instruction');return value;
}
export function stopStageRaster(at:string,task:string){return parseInstruction({op:'stage.raster.stop',at,task});}
