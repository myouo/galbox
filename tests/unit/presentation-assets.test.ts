import {it,expect} from 'vitest';
import {parsePresentationAssetCatalog} from 'galbox-sdk/protocol';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {presentationAssets} from '../../packages/galbox-sdk/src/web-host/presentation-assets.js';
import {dialoguePresentation} from '../../packages/galbox-sdk/src/web-host/dialogue.js';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
const image={id:'hidden',kind:'image' as const,path:'hidden.png',mime:'image/png' as const,sha256:'0'.repeat(64)},fact={id:'hidden',kind:'image' as const,bytes:100,width:2,height:2};
const catalog=()=>({version:1 as const,assets:[{...image}],resources:[{...fact}]});
it('owns a bounded image-only catalog and roundtrips it without changing the Program',()=>{
 const raw=catalog(),owned=parsePresentationAssetCatalog(raw);raw.assets[0]!.path='mutated.png';raw.resources[0]!.width=7;expect(owned.assets[0]?.path).toBe('hidden.png');expect(owned.resources[0]?.kind==='image'&&owned.resources[0].width).toBe(2);expect(decodeWire('PresentationAssetCatalog',encodeWire('PresentationAssetCatalog',owned))).toEqual(owned);
 const b=new ProgramBuilder({gameId:'view-assets',release:'v1',entry:'main'});b.asset('image',{...image,id:'visible'});const p=b.function({id:'main',entry:'end',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.end',{at:'end'})]}).build(),before=encodeWire('Program',p);const linked=presentationAssets(owned,p.assets);expect(dialoguePresentation({objects:[],images:[{source:'visible',hidden:'hidden'}]},p,linked).images).toHaveLength(1);expect(encodeWire('Program',p)).toEqual(before);expect(()=>presentationAssets(owned,[image])).toThrow('PRESENTATION_ASSETS_COLLISION');expect(()=>dialoguePresentation({objects:[],images:[{source:'hidden',hidden:'visible'}]},p,linked)).toThrow('DIALOGUE_IMAGE_KIND');
});
it('rejects unknown versions, oversized, missing, duplicate, wrong-kind and nonmatching fact catalogs',()=>{
 for(const bad of [{...catalog(),version:2},{...catalog(),extra:true},{...catalog(),assets:Array(129).fill(image)},{...catalog(),resources:[]},{...catalog(),assets:[image,image],resources:[fact,fact]},{...catalog(),resources:[{...fact,id:'other'}]},{...catalog(),assets:[{...image,kind:'audio',mime:'audio/wav'}]},{...catalog(),resources:[{...fact,width:0}]}])expect(()=>parsePresentationAssetCatalog(bad)).toThrow();
});
