import {HistoryText} from './history-text.js';
import {useEffect,useState,useRef,useLayoutEffect} from 'react';
import type {Player,PlayerView} from '../player/index.js';
export function HistoryPanel({player,view}:{player:Player;view:PlayerView}) {
 const [notice,setNotice]=useState(''),[confirm,setConfirm]=useState<{id:string;epoch:number}|null>(null),[busy,setBusy]=useState(false);
 const confirmation=useRef<HTMLDivElement>(null);useLayoutEffect(()=>{if(confirm){confirmation.current?.scrollIntoView({block:'nearest'});confirmation.current?.querySelector('button')?.focus();}},[confirm]);
 useEffect(()=>()=>player.stopHistoryVoice(),[player]);
 const invoke=(work:Promise<unknown>,message='')=>{void work.then(()=>setNotice(message),e=>setNotice(String(e)));};
 const reason=(value:string|null)=>value==='LEGACY_HISTORY'?'旧档未记录回溯切点':value==='CHECKPOINT_EXPIRED'?'切点已超出保留窗口':value==='CHECKPOINT_BUDGET'?'切点超出容量':value==='SAVE_POLICY'?'此处禁止回溯':value==='ROLLBACK_DISABLED'?'作品配置关闭回溯':value?'当前切点无法回溯':'';
 return <div className="history" data-testid="history-panel"><p>最近 {view.backlog.policy.maxEntries} 条历史 · {view.backlog.storage==='durable'?'历史切点持久保存':'当前会话切点'}</p><button onClick={()=>player.stopHistoryVoice()}>停止历史语音</button><p role="status" data-testid="history-voice-status">{({idle:'未播放历史语音',starting:'正在准备历史语音',playing:'正在回放历史语音',paused:'历史语音已暂停',buffering:'历史语音正在缓冲',blocked:'请再次点击以启用历史语音',failed:'历史语音播放失败'})[view.backlog.voice.state]} {view.backlog.voice.error}</p>
  {view.backlog.entries.map(row=><article className="history-entry" key={row.id} data-history-id={row.id}><p><strong>{row.text.speaker}</strong><HistoryText text={row.text}/></p><button disabled={!row.canReplay||busy} onClick={()=>invoke(player.replayHistory(row.id,view.epoch))}>回放这句语音</button><button disabled={!row.canRollback||busy} onClick={()=>setConfirm({id:row.id,epoch:view.epoch})}>回到此处</button>{!row.canRollback&&<small>{reason(row.rollbackReason)}</small>}</article>)}
  {confirm&&<div ref={confirmation} role="alertdialog" aria-label="确认历史回溯"><p>回到这句正文并重新选择后续剧情？已读、解锁与系统设置会保留。</p><button disabled={busy} onClick={()=>{setBusy(true);void player.rollback(confirm.id,confirm.epoch).then(()=>{setConfirm(null);if(!view.presentation)player.setMenu(false);setNotice('已回溯');},e=>setNotice(String(e))).finally(()=>setBusy(false));}}>确认回溯</button><button data-dialog-cancel disabled={busy} onClick={()=>setConfirm(null)}>取消回溯</button></div>}
  <p role="status" data-testid="history-notice">{notice}</p>
 </div>;
}
