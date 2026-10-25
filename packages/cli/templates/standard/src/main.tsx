import {createRoot} from 'react-dom/client';
import {useEffect,useRef,useState} from 'react';
import {createPlayer,createHttpProvider} from 'galbox-sdk/player';
import type {Player} from 'galbox-sdk/player';
import {parseReleaseManifest} from 'galbox-sdk/protocol';
import {DefaultUI} from 'galbox-sdk/react';
import registration from '../port.mjs';
import 'galbox-sdk/react/style.css';
import './style.css';
function App(){
 const mount=useRef<HTMLDivElement>(null),[player,setPlayer]=useState<Player|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true,current:Player|undefined;void(async()=>{try{const response=await fetch('./program.json');if(!response.ok)throw new Error('PROGRAM_HTTP');const program:unknown=await response.json();const releaseResponse=await fetch('./program.json.release.json');if(!releaseResponse.ok)throw new Error('RELEASE_HTTP');const release=parseReleaseManifest(await releaseResponse.json());if(!active||!mount.current)return;current=await createPlayer({program,provider:createHttpProvider(program,new URL('./',location.href).href),mount:mount.current,saveCompatibilitySeries:release.series,release,operations:registration.operations,bindings:registration.bindings});if(!active){current.dispose();return;}setPlayer(current);}catch(e){if(active)setError(String(e));}})();return()=>{active=false;current?.dispose();};},[]);
 return <main className="galbox-player"><div className="stage" ref={mount}/>{player?<DefaultUI player={player}/>:<p className="loading">{error||'正在准备故事…'}</p>}</main>;
}
const root=document.getElementById('root');if(!root)throw new Error('Missing root');createRoot(root).render(<App/>);
