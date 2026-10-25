import {useState} from 'react';
import type {Player} from '../player/index.js';
import type {PreparedBackupRestore} from '../backups/index.js';
export function BackupPanel({player}:{player:Player}) {
  const [plan,setPlan]=useState<PreparedBackupRestore|null>(null),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
  const work=(run:()=>Promise<void>)=>{setBusy(true);void run().catch(e=>setNotice(e instanceof Error?e.message:String(e))).finally(()=>setBusy(false));};
  return <fieldset disabled={busy}><legend>便携备份</legend><p>下载已持久化的槽位与阅读进度。恢复后添加独立进度，再选择槽位读取。</p>
    <button onClick={()=>work(async()=>{const data=await player.exportBackup(),url=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='galbox-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('已导出持久进度；未保存的游戏位置不在备份中。');})}>下载备份</button>
    <label>选择备份<input aria-label="选择便携备份" type="file" accept=".json,application/json" onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';setPlan(null);if(file)work(async()=>{if(file.size>4_000_000)throw new Error('备份超过 4 MB');const candidate=player.prepareBackupRestore(JSON.parse(await file.text()));setPlan(candidate);setNotice(`已检查 ${candidate.report().slots} 个槽位；确认恢复后可从存档列表读取。`);});}}/></label>
    {plan&&<button onClick={()=>work(async()=>{const result=await player.commitBackupRestore(plan);setPlan(null);setNotice(`已恢复 ${result.slots.length} 个槽位和 ${result.profiles.length} 份独立进度。`);})}>确认恢复备份</button>}
    <p aria-live="polite" data-testid="backup-notice">{notice}</p></fieldset>;
}
