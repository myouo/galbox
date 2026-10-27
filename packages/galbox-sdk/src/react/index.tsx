import {isTextConfirming} from '../protocol/index.js';
import {ResourceLoading} from './loading.js';
import {PressButton} from './press.js';
import {GameUI} from './game-ui.js';
export {GameUI} from './game-ui.js';
import {ExtrasPanel,ReplayUI} from './extras.js';
export {ExtrasPanel,ReplayUI} from './extras.js';
import {FlowchartPanel} from './flowchart.js';
export {FlowchartPanel} from './flowchart.js';
import {HistoryPanel} from './history.js';
export {HistoryPanel} from './history.js';
import {SaveLibrary} from './saves.js';
export {SaveLibrary} from './saves.js';
import {InteractionPanel} from './interaction.js';
import { useRef, useState, useSyncExternalStore, useEffect } from 'react';
import {PreferencesPanel} from './preferences.js';
import {BackupPanel} from './backup.js';
import {ImportPanel,SlotPicker,ProfilePicker} from './import.js';
import type { Player } from '../player/index.js';
export function usePlayer(player:Player){return useSyncExternalStore(player.subscribe,player.getSnapshot,player.getSnapshot);}
export function DefaultUI({player}:{player:Player}) {const view=usePlayer(player);return view.context==='gallery'?<ReplayUI player={player}/>:view.presentation?<GameUI player={player}/>:<StoryUI player={player}/>;}
function StoryUI({player}:{player:Player}) {
  const view=usePlayer(player),run=view.core?.run,wait=run?.wait;const [notice,setNotice]=useState('');const [history,setHistory]=useState(false);
  const inputRoot=useRef<HTMLDivElement>(null);useEffect(()=>{if(inputRoot.current)return player.attachInput(inputRoot.current);},[player]);
  const invoke=(work:Promise<unknown>,success='')=>{void work.then(()=>setNotice(success),e=>setNotice(e instanceof Error?e.message:String(e)));};
  useEffect(()=>{const blur=()=>player.setFast(false);window.addEventListener('blur',blur);return()=>window.removeEventListener('blur',blur);},[player]);
  return <div className="galbox-ui" ref={inputRoot} tabIndex={0}>
    <nav className="toolbar" aria-label="播放器菜单"><span className="brand">GALBOX <small>{view.title}</small></span><button onClick={()=>player.setMenu(!view.menu)}>菜单</button><button onClick={()=>{setHistory(!history);player.setMenu(!history);}}>历史</button><button onClick={()=>player.setPaused(!view.paused)}>{view.paused?'继续':'暂停'}</button><button aria-pressed={view.playback.mode==='auto'} onClick={()=>invoke(player.setAuto(view.playback.mode!=='auto'))}>自动阅读</button><button disabled={!view.canReplayVoice} onClick={()=>invoke(player.replayVoice())}>重播语音</button><button aria-pressed={view.fast} onPointerDown={()=>player.setFast(true)} onPointerUp={()=>player.setFast(false)} onPointerLeave={()=>player.setFast(false)}>已读快进</button></nav>
    {view.lifecycle==='ready'&&<div className="welcome"><p className="eyebrow">VISUAL NOVEL PLAYER</p>{view.resources.renderer==='canvas'&&<small data-testid="graphics-mode">兼容绘图模式已启用</small>}<h1>{view.title}</h1><p>开始一个新的故事。<br/>阅读进度会保存在这台设备上。</p><button className="primary" onClick={()=>invoke(player.start())}>开始阅读</button><button onClick={()=>invoke(player.quickLoad())}>读取快速存档</button></div>}
    {view.lifecycle==='preparing'&&<div className="busy" role="status">准备故事…</div>}
    {(view.lifecycle==='committed-pending'||view.lifecycle==='commit-unknown')&&<div className="modal"><p>{view.lifecycle==='commit-unknown'?'提交结果尚未确认，请先核验持久记录。':'存储已提交，等待接管。'}</p><button onClick={()=>invoke(player.resumeCommitted())}>恢复当前激活</button><button onClick={()=>invoke(player.start())}>开始新游戏</button></div>}
    {view.lifecycle==='playing'&&!view.menu&&!view.paused&&wait?.kind==='text'&&<PressButton className="advance" data-testid="advance" aria-label={run?.text&&isTextConfirming(run.text)?'确认并继续':'显完或下一页'} identity={`${view.epoch}:${wait.prompt}:${view.paused}:${view.menu}`} activate={()=>invoke(player.step(wait.prompt,view.epoch))}>{run?.text&&isTextConfirming(run.text)?'继续':'下一页'} <span>◇</span></PressButton>}
    {view.lifecycle==='playing'&&!view.menu&&!view.paused&&wait?.kind==='choice'&&<div className="choices">{wait.options.map(o=><PressButton key={`${wait.prompt}:${o.id}`} identity={`${view.epoch}:${wait.prompt}:${o.id}:${view.paused}:${view.menu}`} activate={()=>invoke(player.input('choose',wait.prompt,view.epoch,o.id))}>{o.text}</PressButton>)}</div>}
    <InteractionPanel player={player} view={view}/>
    {view.lifecycle==='playing'&&wait?.kind==='video'&&!view.menu&&!view.paused&&<div className="video-controls">{run?.tasks.find(t=>t.id===wait.task)?.videoTask?.skippable&&<button key={`${view.epoch}:${wait.prompt}`} onClick={()=>invoke(player.skipVideo(wait.prompt,view.epoch))}>跳過影片</button>}{run?.tasks.find(t=>t.id===wait.task)?.status==='blocked'&&<button onClick={()=>invoke(player.retryVideo())}>重試影片播放</button>}</div>}
    {run?.status==='ended'&&!view.menu&&<div className="ending"><p>阅读结束。</p><small>{view.core?.dirty?'正在提交阅读进度…':'阅读进度已提交'}</small><button onClick={()=>invoke(player.start())}>再次阅读</button></div>}
    {view.menu&&<div className="scrim" onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()}><section className="modal" role="dialog" aria-label={history?'阅读历史':'菜单'}>
      <header><h2>{history?'阅读历史':'阅读设置'}</h2><button onClick={()=>{setHistory(false);player.setMenu(false);}}>关闭</button></header>
      {history?<HistoryPanel player={player} view={view}/>:<><button disabled={!view.core?.canSave||!!view.extraSession} onClick={()=>invoke(player.quickSave(),'已保存到浏览器')}>快速保存</button><button onClick={()=>invoke(player.quickLoad(),'已读取存档')}>快速读档</button><button onClick={()=>invoke(player.discardAndLoad(),'已放弃未提交进度并读档')}>放弃未提交进度并读档</button><button onClick={()=>{player.setMenu(false);invoke(player.start());}}>重新开始</button><p>当前：{view.profileId==='main'?'网页进度':'独立导入进度'}</p><ExtrasPanel player={player} view={view}/><FlowchartPanel player={player} view={view}/><SaveLibrary player={player} view={view}/><SlotPicker player={player} view={view}/><ProfilePicker player={player} view={view}/><ImportPanel player={player} view={view}/><BackupPanel player={player}/><PreferencesPanel player={player} view={view}/></>}
      <p role="status">{notice}</p></section></div>}
    {(view.media.state==='needs-user-action'||run?.tasks.some(t=>(t.kind==='audio'||t.kind==='media')&&t.status==='blocked'))&&!view.paused&&view.lifecycle==='playing'&&<button className="audio-retry" onClick={()=>invoke(player.retryAudio())}>点击启用声音</button>}
    {(view.video.state==='buffering'||view.media.state==='buffering')&&!view.menu&&<p className="audio-retry" role="status">正在缓冲媒体…</p>}
    <ResourceLoading player={player} view={view} retry={()=>invoke(player.retryResources())}/>{view.error&&<p className="error" role="alert">{view.error}</p>}
    <details className="diagnostics"><summary>开发诊断 · {run?.frames.at(-1)?.pc??'ready'}</summary><pre data-testid="diagnostics">{JSON.stringify({release:view.release?{origin:view.release.origin,sha256:view.release.sha256}:null,resources:view.resources,preferences:view.preferences,playback:view.playback,profileId:view.profileId,lastImport:view.lastImport,video:view.video,epoch:view.epoch,lifecycle:view.lifecycle,globals:run?.globals,stage:run?.stage,scene:run?.scene,audioState:run?.audioState,textLayout:run?.textLayout,flow:run?.flow,ui:run?.ui,rng:run?.rng,wait:run?.wait,tasks:run?.tasks,canSave:view.core?.canSave,saveReason:view.core?.saveReason,dirty:view.core?.dirty,profile:view.core?.profile,media:view.media},null,2)}</pre></details>
  </div>;
}
