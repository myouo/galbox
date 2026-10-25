import {ProgramBuilder,textFont,textLayout,textTheme,textWindow,instruction} from '../../packages/galbox-sdk/src/program-tools/index.js';
import {createDomTextRenderer} from '../../packages/galbox-sdk/src/player/index.js';
import type {PlayerOptions,TextRendererFactory} from '../../packages/galbox-sdk/src/player/index.js';
export function layoutTypes(b:ProgramBuilder,options:PlayerOptions){const font=b.asset('font',{id:'font',path:'font.ttf',mime:'font/ttf',sha256:'0'.repeat(64)});b.textLayout(textLayout('main',[textTheme('paper',{font:textFont(font)})],[textWindow('main','nvl','paper',{x:0,y:0,width:1280,height:720})]));
 // @ts-expect-error Font factory rejects audio resources.
 textFont(b.asset('audio',{id:'audio',path:'a.wav',mime:'audio/wav',sha256:'0'.repeat(64)}));
 // @ts-expect-error Window controls have opcode-correlated arguments.
 instruction('text.window.theme',{at:'x',window:'main',visible:false});
 // @ts-expect-error NVL mode is a finite capability.
 textWindow('bad','scroll-anywhere','paper',{x:0,y:0,width:1280,height:720});
 const renderer:TextRendererFactory=context=>{const inner=createDomTextRenderer(context);return {render(snapshot){
 // @ts-expect-error Renderer cannot write the supplied snapshot.
 snapshot.textLayout?.windows.push({id:'x',theme:'x',visible:true,entries:[]});inner.render(snapshot);},applyDisplayPreferences:v=>inner.applyDisplayPreferences(v),dispose:()=>inner.dispose()};};void {...options,textRenderer:renderer};
}
