import {useState} from 'react';
import type {Player,PlayerView} from '../player/index.js';
import type {PreferencesPatch} from '../settings/index.js';
export function PreferencesPanel({player,view}:{player:Player;view:PlayerView}){
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),settings=view.preferences.value;const intervals=[0,8,16,32,64,100,200];
 function change(patch:PreferencesPatch){setBusy(true);void player.updatePreferences(patch).then(()=>setNotice('设置已保存'),e=>setNotice(String(e))).finally(()=>setBusy(false));}
 if(!view.preferencesSupported)return <label>音量<input aria-label="主音量" type="range" min="0" max="1" step="0.05" defaultValue={settings.audio.master} onChange={e=>player.setVolume(Number(e.target.value))}/></label>;
 return <fieldset disabled={busy} className="preferences"><legend>系统设置</legend>
  {(['master','bgm','voice','sfx'] as const).map(role=><label key={role}>{({master:'主音量',bgm:'背景音乐音量',voice:'语音音量',sfx:'音效音量'})[role]}<input aria-label={({master:'主音量',bgm:'背景音乐音量',voice:'语音音量',sfx:'音效音量'})[role]} type="range" min="0" max="1" step="0.05" value={settings.audio[role]} onChange={e=>change({audio:{[role]:Number(e.target.value)}})}/></label>)}
  <label>文字速度<select aria-label="文字显示间隔" value={settings.text.intervalMs} onChange={e=>change({text:{intervalMs:Number(e.target.value)}})}>{!intervals.includes(settings.text.intervalMs)&&<option value={settings.text.intervalMs}>{settings.text.intervalMs} ms/字</option>}{intervals.map(ms=><option key={ms} value={ms}>{ms===0?'立即显示':`${ms} ms/字`}</option>)}</select></label>
  <button onClick={()=>{setBusy(true);void player.reloadPreferences().then(()=>setNotice('已重新读取设置'),e=>setNotice(String(e))).finally(()=>setBusy(false));}}>重新读取设置</button><p aria-live="polite" data-testid="preferences-notice">{notice}</p>
 </fieldset>;
}
