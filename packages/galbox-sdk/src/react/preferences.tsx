import {useState} from 'react';
import type {Player,PlayerView} from '../player/index.js';
import type {PreferencesPatch} from '../settings/index.js';
import {GalboxError} from '../protocol/index.js';
function preferenceError(error:unknown):string {
 if(error instanceof GalboxError){if(error.code.startsWith('SCHEMA_'))return `设置格式无效（${error.code}）`;if(error.code==='INPUT_BINDING_CONFLICT')return '该按键已分配给其他操作，请先修改原绑定。';if(error.code==='PREFERENCES_CONFLICT')return '其他页面已更新设置，请重新读取后再修改。';if(error.code==='PREFERENCES_COMMIT_UNKNOWN')return '保存结果尚未确认，请重新读取设置。';}
 return error instanceof SyntaxError?'设置文件不是有效 JSON。':error instanceof Error?error.message:String(error);
}
export function PreferencesPanel({player,view}:{player:Player;view:PlayerView}){
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[pending,setPending]=useState(0),settings=view.preferences.value;const intervals=[0,8,16,32,64,100,200];
 function change(patch:PreferencesPatch){setPending(n=>n+1);void player.updatePreferences(patch).then(()=>setNotice('设置已保存'),e=>setNotice(preferenceError(e))).finally(()=>setPending(n=>n-1));}
 if(!view.preferencesSupported)return <label>音量<input aria-label="主音量" type="range" min="0" max="1" step="0.05" defaultValue={settings.audio.master} onChange={e=>player.setVolume(Number(e.target.value))}/></label>;
 return <fieldset disabled={busy} className="preferences"><legend>系统设置</legend>
  {(['master','bgm','voice','sfx'] as const).map(role=><label key={role}>{({master:'主音量',bgm:'背景音乐音量',voice:'语音音量',sfx:'音效音量'})[role]}<input aria-label={({master:'主音量',bgm:'背景音乐音量',voice:'语音音量',sfx:'音效音量'})[role]} type="range" min="0" max="1" step="0.05" value={settings.audio[role]} onChange={e=>change({audio:{[role]:Number(e.target.value)}})}/></label>)}
  <label>文字速度<select aria-label="文字显示间隔" value={settings.text.intervalMs} onChange={e=>change({text:{intervalMs:Number(e.target.value)}})}>{!intervals.includes(settings.text.intervalMs)&&<option value={settings.text.intervalMs}>{settings.text.intervalMs} ms/字</option>}{intervals.map(ms=><option key={ms} value={ms}>{ms===0?'立即显示':`${ms} ms/字`}</option>)}</select></label>
  <label>自动阅读等待<input aria-label="自动阅读等待毫秒" type="number" min="0" max="60000" step="100" value={settings.playback.autoDelayMs} onChange={e=>change({playback:{autoDelayMs:Number(e.target.value)}})}/></label>
  <label><input aria-label="允许快进未读正文" type="checkbox" checked={settings.playback.skipUnread} onChange={e=>change({playback:{skipUnread:e.target.checked}})}/>允许快进未读正文</label>
  <label>字体大小<select aria-label="字体缩放" value={settings.display.fontScale} onChange={e=>change({display:{fontScale:Number(e.target.value)}})}>{![.75,1,1.25,1.5].includes(settings.display.fontScale)&&<option value={settings.display.fontScale}>{settings.display.fontScale}</option>}{[.75,1,1.25,1.5].map(n=><option key={n} value={n}>{n*100}%</option>)}</select></label>
  <label>文本框背景透明度<input aria-label="文本框背景透明度" type="range" min="0" max="1" step="0.05" value={settings.display.windowOpacity} onChange={e=>change({display:{windowOpacity:Number(e.target.value)}})}/></label>
  {(['advance','menu','auto','skip','quickSave','quickLoad'] as const).map(action=>{const current=settings.input[action][0]??'',codes=['Enter','Space','ArrowRight','Escape','KeyA','KeyD','KeyZ','ControlLeft','ShiftLeft','F5','F9'];return <label key={action}>{({advance:'推进按键',menu:'菜单按键',auto:'自动按键',skip:'快进按键',quickSave:'快速保存按键',quickLoad:'快速读取按键'})[action]}<select aria-label={({advance:'推进按键',menu:'菜单按键',auto:'自动按键',skip:'快进按键',quickSave:'快速保存按键',quickLoad:'快速读取按键'})[action]} value={current} onChange={e=>change({input:{[action]:e.target.value?[e.target.value]:[]}})}><option value="">禁用</option>{current&&!codes.includes(current)&&<option value={current}>{current}</option>}{codes.map(code=><option key={code} value={code}>{code}</option>)}</select></label>;})}
  <button onClick={()=>{setBusy(true);void player.resetPreferences().then(()=>setNotice('已恢复默认设置'),e=>setNotice(preferenceError(e))).finally(()=>setBusy(false));}}>恢复默认设置</button>
  <button onClick={()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(player.exportPreferences())],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='galbox-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('已导出系统设置');}}>导出系统设置</button>
  <label>导入系统设置<input aria-label="导入系统设置" type="file" accept=".json,application/json" onChange={e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);void(async()=>{if(file.size>32768)throw new Error('设置文件过大');await player.importPreferences(JSON.parse(await file.text()));setNotice('已导入系统设置');})().catch(e=>setNotice(preferenceError(e))).finally(()=>setBusy(false));}}/></label>
  <button onClick={()=>{setBusy(true);void player.reloadPreferences().then(()=>setNotice('已重新读取设置'),e=>setNotice(preferenceError(e))).finally(()=>setBusy(false));}}>重新读取设置</button><p aria-live="polite" data-testid="preferences-notice">{pending?'正在保存设置…':notice}</p>
 </fieldset>;
}
