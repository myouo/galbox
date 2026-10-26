import { createRoot } from 'react-dom/client';
import { useEffect,useRef,useState } from 'react';
import { createPlayer,createHttpProvider } from 'galbox-sdk/player';
import {createSaveBindingRegistry} from 'galbox-sdk/port-kit';
import {createFixtureBinding} from '../../../fixtures/synthetic-saves/binding.js';
import {parseReleaseManifest} from 'galbox-sdk/protocol';
import type { Player } from 'galbox-sdk/player';
import { DefaultUI } from 'galbox-sdk/react';
import 'galbox-sdk/react/style.css';
import './style.css';
const demonstrations={interface:{program:new URLSearchParams(location.search).get('skin')==='paper'?'./interface/paper.json':'./interface/program.json',synthetic:false},ui:{program:'./ui/program.json',synthetic:false},extras:{program:'./extras/program.json',synthetic:false},flowchart:{program:'./flowchart/program.json',synthetic:false},history:{program:'./history/program.json',synthetic:false},streaming:{program:'./streaming/program.json',synthetic:false},interactive:{program:'./interactive/program.json',synthetic:false},standard:{program:'./program.json',synthetic:true},expressions:{program:'./expressions/program.json',synthetic:false},text:{program:'./text/program.json',synthetic:false},layout:{program:'./layout/program.json',synthetic:false},data:{program:'./data/program.json',synthetic:false},stage:{program:'./stage/program.json',synthetic:false},media:{program:'./media/program.json',synthetic:false}};
const selected=new URLSearchParams(location.search).get('demo');const demo=selected==='interface'?demonstrations.interface:selected==='ui'?demonstrations.ui:selected==='extras'?demonstrations.extras:selected==='flowchart'?demonstrations.flowchart:selected==='history'?demonstrations.history:selected==='streaming'?demonstrations.streaming:selected==='interactive'?demonstrations.interactive:selected==='media'?demonstrations.media:selected==='stage'?demonstrations.stage:selected==='data'?demonstrations.data:selected==='layout'?demonstrations.layout:selected==='text'?demonstrations.text:selected==='expressions'?demonstrations.expressions:demonstrations.standard;
function App(){
 const mount=useRef<HTMLDivElement>(null),[player,setPlayer]=useState<Player|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true,instance:Player|undefined;void(async()=>{
  try{const response=await fetch(demo.program);if(!response.ok)throw new Error('PROGRAM_HTTP');const program:unknown=await response.json();const releaseResponse=await fetch(demo.program+'.release.json');if(!releaseResponse.ok)throw new Error('RELEASE_HTTP');const release=parseReleaseManifest(await releaseResponse.json());if(!mount.current||!active)return;
   instance=await createPlayer({program,provider:createHttpProvider(program,new URL('./',new URL(demo.program,location.href)).href),mount:mount.current,saveCompatibilitySeries:release.series,release,...(new URLSearchParams(location.search).get('autoSave')==='1'?{saves:{manualSlots:12,autoSlots:3,auto:'on-prompt' as const}}:{}),...(demo===demonstrations.streaming?{streaming:{integrity:'versioned-url' as const}}:{}),graphics:{renderer:new URLSearchParams(location.search).get('renderer')==='canvas'?'canvas':new URLSearchParams(location.search).get('renderer')==='webgl'?'webgl':'auto'},bindings:createSaveBindingRegistry(demo.synthetic?[createFixtureBinding(program)]:[])});
   if(!active){instance.dispose();return;}setPlayer(instance);
  }catch(e){if(active)setError(e instanceof Error?e.message:String(e));}
 })();return()=>{active=false;instance?.dispose();};},[]);
 return <main className="galbox-player"><div className="stage" ref={mount}/>{player?<DefaultUI player={player}/>:<div className="loading" role="status">{error||'正在点亮灯塔…'}</div>}<footer>galbox-sdk · 原创验证作品 · <a href="?demo=standard">灯塔来信</a> · <a href="?demo=interface">远航：完整游戏界面</a> · <a href="?demo=interface&skin=paper">信纸皮肤</a> · <a href="?demo=ui">值班面板：剧本控件</a> · <a href="?demo=extras">收藏室：鉴赏与成就</a> · <a href="?demo=flowchart">航路图：章节与节点</a> · <a href="?demo=history">回声书签：历史与回溯</a> · <a href="?demo=expressions">值班簿：表达式与随机</a> · <a href="?demo=text">信纸上的光</a> · <a href="?demo=layout">双页值班簿</a> · <a href="?demo=layout&autoSave=1">图文存档与自动槽</a> · <a href="?demo=data">补给簿</a> · <a href="?demo=stage">光影回信</a> · <a href="?demo=media">风声回放</a> · <a href="?demo=interactive">光中的選擇</a> · <a href="?demo=streaming">海上传声</a></footer></main>;
}
const root=document.getElementById('root');if(root)createRoot(root).render(<App/>);
