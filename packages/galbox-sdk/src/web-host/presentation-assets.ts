import {ensure,parsePresentationAssetCatalog} from '../protocol/index.js';
import type {PresentationAssetCatalog,Asset} from '../protocol/index.js';
export function presentationAssets(input:unknown,assets:readonly Asset[]):PresentationAssetCatalog {
 const catalog=parsePresentationAssetCatalog(input??{version:1,assets:[],resources:[]});const ids=new Set(assets.map(a=>a.id));
 ensure(catalog.assets.every(a=>!ids.has(a.id)),'PRESENTATION_ASSETS_COLLISION','View images must not replace a Program asset');return catalog;
}
