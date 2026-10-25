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
const demonstrations={standard:{program:'./program.json',synthetic:true},expressions:{program:'./expressions/program.json',synthetic:false},text:{program:'./text/program.json',synthetic:false},layout:{program:'./layout/program.json',synthetic:false},data:{program:'./data/program.json',synthetic:false},stage:{program:'./stage/program.json',synthetic:false}};
const selected=new URLSearchParams(location.search).get('demo');const demo=selected==='stage'?demonstrations.stage:selected==='data'?demonstrations.data:selected==='layout'?demonstrations.layout:selected==='text'?demonstrations.text:selected==='expressions'?demonstrations.expressions:demonstrations.standard;
function App(){
 const mount=useRef<HTMLDivElement>(null),[player,setPlayer]=useState<Player|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true,instance:Player|undefined;void(async()=>{
  try{const response=await fetch(demo.program);if(!response.ok)throw new Error('PROGRAM_HTTP');const program:unknown=await response.json();const releaseResponse=await fetch(demo.program+'.release.json');if(!releaseResponse.ok)throw new Error('RELEASE_HTTP');const release=parseReleaseManifest(await releaseResponse.json());if(!mount.current||!active)return;
   instance=await createPlayer({program,provider:createHttpProvider(program,new URL('./',new URL(demo.program,location.href)).href),mount:mount.current,saveCompatibilitySeries:release.series,release,bindings:createSaveBindingRegistry(demo.synthetic?[createFixtureBinding(program)]:[])});
   if(!active){instance.dispose();return;}setPlayer(instance);
  }catch(e){if(active)setError(e instanceof Error?e.message:String(e));}
 })();return()=>{active=false;instance?.dispose();};},[]);
 return <main className="galbox-player"><div className="stage" ref={mount}/>{player?<DefaultUI player={player}/>:<div className="loading" role="status">{error||'正在点亮灯塔…'}</div>}<footer>galbox-sdk · 原创验证作品 · <a href="?demo=standard">灯塔来信</a> · <a href="?demo=expressions">值班簿：表达式与随机</a> · <a href="?demo=text">信纸上的光</a> · <a href="?demo=layout">双页值班簿</a> · <a href="?demo=data">补给簿</a> · <a href="?demo=stage">光影回信</a></footer></main>;
}
const root=document.getElementById('root');if(root)createRoot(root).render(<App/>);
