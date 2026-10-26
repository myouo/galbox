import {useEffect,useRef} from 'react';
import {PressButton} from './press.js';
import type {Player,PlayerView} from '../player/index.js';
export function InteractionPanel({player,view}:{player:Player;view:PlayerView}) {
 const wait=view.core?.run.wait,w=wait?.kind==='interaction'?wait:null,root=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(w?.phase==='prepared'&&view.lifecycle==='playing'&&!view.paused&&!view.menu&&root.current)void player.activateInteraction(w.prompt,w.attempt,view.epoch).catch(()=>{});},[player,view.epoch,view.lifecycle,view.paused,view.menu,w?.prompt,w?.attempt,w?.phase]);
 if(!w||view.lifecycle!=='playing'||view.menu||view.paused)return null;
 return <div className="interaction-layer" ref={root} aria-label={w.label} data-testid="interaction"><p className="interaction-label">{w.label}{w.deadlineMs!==null&&<span role="timer" data-testid="interaction-time">剩餘 {Math.ceil((w.deadlineMs-w.elapsedMs)/1000)} 秒</span>}</p><div className="interaction-choices">{w.options.map(o=><PressButton key={o.id} identity={`${view.epoch}:${w.prompt}:${w.attempt}:${w.phase}:${o.id}`} data-hotspot={o.rect?o.id:undefined} style={o.rect?{position:'absolute',left:`${o.rect.x/1280*100}%`,top:`${o.rect.y/720*100}%`,width:`${o.rect.width/1280*100}%`,height:`${o.rect.height/720*100}%`}:undefined} disabled={w.phase!=='active'||!o.enabled} activate={()=>{void player.chooseInteraction(o.id,w.prompt,w.attempt,view.epoch).catch(()=>{});}}>{o.label}</PressButton>)}</div></div>;
}
