import {useState} from 'react';
import type {Player,PlayerView,SaveLibraryEntry} from '../player/index.js';
export function SaveLibrary({player,view}:{player:Player;view:PlayerView}) {
 const [label,setLabel]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[confirm,setConfirm]=useState<{action:'overwrite'|'delete';slot:string;revision:number}|null>(null);
 async function invoke(work:()=>Promise<unknown>,message:string){setBusy(true);try{await work();setNotice(message);setConfirm(null);}catch(e){setNotice(String(e));}finally{setBusy(false);}}
 function overwrite(row:SaveLibraryEntry){setConfirm({action:'overwrite',slot:row.slot,revision:row.revision});}
 const selected=confirm?view.slots.find(s=>s.slot===confirm.slot):undefined;
 return <details className="save-library"><summary>图文存档管理</summary><p>自动保存：{view.saveSystem.policy.auto==='on-prompt'?'剧情提示处':'关闭'} · 手动槽 {view.saveSystem.policy.manualSlots} · 自动槽 {view.saveSystem.policy.autoSlots}</p>
  {!view.saveSystem.supported&&<p>当前存储不支持图文存档系统。</p>}
  <label>存档名称<input aria-label="存档名称" maxLength={128} value={label} onChange={e=>setLabel(e.target.value)}/></label>
  <button disabled={busy||!view.saveSystem.supported||!view.core?.canSave} onClick={()=>{void invoke(()=>player.saveGame(label?{label}:{}),'图文存档已提交');}}>新建手动存档</button>
  <button disabled={busy} onClick={()=>{void invoke(()=>player.refreshSaveLibrary(),'槽位列表已刷新');}}>刷新存档列表</button>
  <div className="save-grid">{view.slots.map(row=><article className="save-card" key={row.slot} data-slot={row.slot}>
   {row.capture?.thumbnail?<img src={row.capture.thumbnail.dataURL} width={320} height={180} alt={`${row.label}：${row.capture.speaker} ${row.capture.text}`}/>:<div className="save-no-image">无缩略图</div>}
   <strong>{row.label}</strong><small>{({manual:'手动',quick:'快速',auto:'自动',legacy:'旧档'})[row.kind]} · {row.profileId===view.profileId?'当前进度':'其他进度'} · 修订 {row.revision}</small>
   {row.capture&&<><time dateTime={new Date(row.capture.createdAt).toISOString()}>{new Date(row.capture.createdAt).toLocaleString()}</time><p>{row.capture.speaker} {row.capture.text}</p></>}
   <button disabled={busy} onClick={()=>{void invoke(async()=>{await player.load(row.slot);player.setMenu(false);},'已读取');}}>读取 {row.label}</button>
   {row.hasPrevious&&<button disabled={busy} onClick={()=>{void invoke(async()=>{await player.load(row.slot,'previous');player.setMenu(false);},'已读取上一修订');}}>读取上一修订 {row.label}</button>}
   <button disabled={busy||!view.core?.canSave||row.profileId!==view.profileId||row.kind==='auto'||row.kind==='legacy'} onClick={()=>overwrite(row)}>覆盖 {row.label}</button>
   <button disabled={busy||!label} onClick={()=>{void invoke(()=>player.renameSave(row.slot,row.revision,label),'名称已更新');}}>重命名 {row.label}</button>
   <button disabled={busy} onClick={()=>setConfirm({action:'delete',slot:row.slot,revision:row.revision})}>删除 {row.label}</button>
  </article>)}</div>
  {confirm&&<div role="alertdialog" aria-label="确认存档操作"><p>{confirm.action==='delete'?'删除':'覆盖'}“{selected?.label??confirm.slot}”？</p><button disabled={busy} onClick={()=>{if(confirm.action==='delete')void invoke(()=>player.deleteSave(confirm.slot,confirm.revision),'槽位已删除');else void invoke(()=>player.saveGame({slot:confirm.slot,expectedRevision:confirm.revision,kind:selected?.kind==='quick'?'quick':'manual',...(label?{label}:{})}),'覆盖已提交');}}>确认{confirm.action==='delete'?'删除':'覆盖'}</button><button disabled={busy} onClick={()=>setConfirm(null)}>取消操作</button></div>}
  {view.saveSystem.pending.map(p=><button key={p.id} disabled={busy} onClick={()=>{void invoke(()=>player.retrySave(p.id),'保存已核验');}}>核验并重试保存 {p.id}</button>)}
  <p role="status" data-testid="save-notice">{notice}</p>
 </details>;
}
