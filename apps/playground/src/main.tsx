import { createRoot } from 'react-dom/client';
import { useEffect,useRef,useState } from 'react';
import { createPlayer,createHttpProvider } from 'galbox-sdk/player';
import type { Player } from 'galbox-sdk/player';
import { DefaultUI } from 'galbox-sdk/react';
import 'galbox-sdk/react/style.css';
import './style.css';
function App(){
 const mount=useRef<HTMLDivElement>(null),[player,setPlayer]=useState<Player|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true,instance:Player|undefined;void(async()=>{
  try{const response=await fetch('./program.json');if(!response.ok)throw new Error('PROGRAM_HTTP');const program:unknown=await response.json();if(!mount.current||!active)return;
   instance=await createPlayer({program,provider:createHttpProvider(program,new URL('./',location.href).href),mount:mount.current,saveCompatibilitySeries:'1'});
   if(!active){instance.dispose();return;}setPlayer(instance);
  }catch(e){if(active)setError(e instanceof Error?e.message:String(e));}
 })();return()=>{active=false;instance?.dispose();};},[]);
 return <main className="galbox-player"><div className="stage" ref={mount}/>{player?<DefaultUI player={player}/>:<div className="loading" role="status">{error||'正在点亮灯塔…'}</div>}<footer>galbox-sdk · 原创验证作品 · ADV / Pixi / Web Audio / IndexedDB</footer></main>;
}
const root=document.getElementById('root');if(root)createRoot(root).render(<App/>);
