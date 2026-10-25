import {createRoot} from 'react-dom/client';
import {useEffect,useRef,useState} from 'react';
import {createPlayer,createHttpProvider} from 'galbox-sdk/player';
import type {OperationResume} from 'galbox-sdk/protocol';
import type {Player} from 'galbox-sdk/player';
import {DefaultUI,usePlayer} from 'galbox-sdk/react';
import registration,{counter} from '../port.mjs';
import 'galbox-sdk/react/style.css';
import './style.css';
function Signal({player}:{player:Player}){
 const view=usePlayer(player),pending=useRef<{result:OperationResume;epoch:number}|null>(null),invocation=view.core?.run.invocations?.find(v=>v.phase==='waiting'&&v.operation===counter.id),wait=invocation?.wait;
 useEffect(()=>{if(view.menu||view.paused)pending.current=null;},[view.epoch,view.menu,view.paused]);
 if(!invocation||!wait||view.lifecycle!=='playing'||view.paused||view.menu)return null;
 const down=()=>{pending.current={result:counter.result(wait,invocation.id,{kind:'finish',amount:3}),epoch:view.epoch};};
 const up=()=>{const message=pending.current;pending.current=null;if(message)void player.resumeOperation(message.result,message.epoch);};
 return <button style={{position:'absolute',top:'35%',left:'40%',zIndex:5}} onPointerDown={down} onPointerUp={up} onPointerCancel={()=>{pending.current=null;}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)down();}}} onKeyUp={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();up();}}} onClick={e=>{if(e.detail===0){down();up();}}}>确认信号</button>;
}

function App(){const mount=useRef<HTMLDivElement>(null),[player,setPlayer]=useState<Player|null>(null),[error,setError]=useState('');useEffect(()=>{let active=true,current:Player|undefined;void(async()=>{try{const program:unknown=await(await fetch('./program.json')).json();if(!active||!mount.current)return;current=await createPlayer({program,provider:createHttpProvider(program,new URL('./',location.href).href),mount:mount.current,saveCompatibilitySeries:'1',operations:registration.operations,bindings:registration.bindings});if(!active){current.dispose();return;}setPlayer(current);}catch(e){setError(String(e));}})();return()=>{active=false;current?.dispose();};},[]);return <main className="galbox-player"><div className="stage" ref={mount}/>{player?<><DefaultUI player={player}/><Signal player={player}/></>:<p>{error||'准备中'}</p>}</main>;}
const root=document.getElementById('root');if(root)createRoot(root).render(<App/>);
