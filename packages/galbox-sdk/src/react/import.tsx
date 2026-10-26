import {useState} from 'react';
import type {Player,PlayerView} from '../player/index.js';
export function ProfilePicker({player,view}:{player:Player;view:PlayerView}){
 const [selected,setSelected]=useState('main'),[notice,setNotice]=useState('');const current=view.profiles.some(p=>p.profileId===selected)?selected:'main';
 return view.profiles.length>1?<div className="slot-picker"><label>开始时使用的进度<select aria-label="开始时使用的进度" value={current} onChange={e=>setSelected(e.target.value)}>{view.profiles.map((p,i)=><option key={p.profileId} value={p.profileId}>{p.profileId==='main'?'网页进度':`独立进度 ${i}`}</option>)}</select></label><button onClick={()=>{if(!view.presentation)player.setMenu(false);void player.start(current).catch(e=>setNotice(String(e)));}}>使用所选进度从头开始</button>{notice&&<p>{notice}</p>}</div>:null;
}
export function SlotPicker({player,view}:{player:Player;view:PlayerView}){
 const [selected,setSelected]=useState('quick'),[notice,setNotice]=useState('');
 const current=view.slots.some(s=>s.slot===selected)?selected:view.slots[0]?.slot??'';
 return view.slots.length?<div className="slot-picker"><label>存档槽位<select aria-label="存档槽位" value={current} onChange={e=>setSelected(e.target.value)}>{view.slots.map(s=><option key={s.slot} value={s.slot}>{s.label} · {s.profileId==='main'?'网页进度':'独立导入进度'}</option>)}</select></label><button onClick={()=>{if(!view.presentation)player.setMenu(false);void player.load(current).catch(e=>setNotice(String(e)));}}>读取所选槽位</button>{notice&&<p>{notice}</p>}</div>:null;
}
export function ImportPanel({player,view}:{player:Player;view:PlayerView}){
 const [source,setSource]=useState('0'),[files,setFiles]=useState<File[]>([]),[busy,setBusy]=useState(false),[notice,setNotice]=useState('');
 const selected=view.importSources[Number(source)];
 async function prepare(){if(!selected)return;setBusy(true);try{const result=await player.prepareImportFiles(selected,files);setNotice(result.status==='ready'?'准备完成；检查报告后提交导入。':`${result.status}: ${result.message}`);}catch(e){setNotice(String(e));}finally{setBusy(false);}}
 async function commit(){setBusy(true);try{const result=await player.commitImport();setNotice(result.disposed?'导入已提交；播放器已关闭。':'已导入，尚未载入；当前游戏未被替换。');}catch(e){setNotice(String(e));}finally{setBusy(false);}}
 if(!view.importSources.length)return null;
 return <details className="import-panel"><summary>导入存档</summary><p>导入会建立独立进度。提交后可另行载入，网页进度保留。</p><label>来源<select aria-label="原档来源" value={source} onChange={e=>setSource(e.target.value)}>{view.importSources.map((s,j)=><option key={`${s.sourceKey}:${s.schema}:${s.version}`} value={j}>{s.label}</option>)}</select></label>
  <label>来源文件<input aria-label="原档文件（可多选）" data-testid="import-files" type="file" multiple onChange={e=>setFiles(Array.from(e.target.files??[]))}/></label>
  <button disabled={busy||!files.length} onClick={()=>{void prepare();}}>准备导入</button>
  {view.importReport&&<div className="conversion-report"><strong>{view.importReport.label}</strong><p>转换等级：{view.importReport.grade}</p><ul>{view.importReport.warnings.map((w,j)=><li key={j}>{w}</li>)}</ul><button disabled={busy||!!view.lastImport} onClick={()=>{void commit();}}>提交导入</button></div>}
  {view.lastImport&&<button data-testid="load-import" data-slot={view.lastImport.slot} onClick={()=>{const slot=view.lastImport?.slot;if(slot){if(!view.presentation)player.setMenu(false);void player.load(slot).catch(e=>setNotice(String(e)));}}}>载入导入槽位</button>}
  <p data-testid="import-notice">{notice}</p>
 </details>;
}
