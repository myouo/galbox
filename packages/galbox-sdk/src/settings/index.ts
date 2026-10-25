import {parsePlayerPreferences,parsePreferencesPatch,parsePreferencesValue,parseStoredPreferencesRecord,parsePreferencesRecord,ensure} from '../protocol/index.js';
import type {PlayerPreferences} from '../protocol/index.js';
export type {PlayerPreferences,PreferencesRecord,PreferencesPatch} from '../protocol/index.js';
export function defaultPreferences():PlayerPreferences {return parsePlayerPreferences({version:2,audio:{master:.6,bgm:1,voice:1,sfx:1},text:{intervalMs:32},playback:{autoDelayMs:1500,skipUnread:false},input:{advance:['Enter','Space'],menu:['Escape'],auto:['KeyA'],skip:['ControlLeft','ControlRight'],quickSave:['F5'],quickLoad:['F9']},display:{fontScale:1,windowOpacity:1}});}
function validate(value:PlayerPreferences):PlayerPreferences {const keys=Object.values(value.input).flat();ensure(new Set(keys).size===keys.length,'INPUT_BINDING_CONFLICT','Each key code belongs to one action');return value;}
export function normalizePreferences(input:unknown):PlayerPreferences {const value=parsePreferencesValue(input);return validate(value.version===2?parsePlayerPreferences(value):parsePlayerPreferences({...defaultPreferences(),audio:value.audio,text:value.text}));}
export function normalizePreferencesRecord(input:unknown){const row=parseStoredPreferencesRecord(input);return parsePreferencesRecord({revision:row.revision,value:normalizePreferences(row.value)});}
export function mergePreferences(current:unknown,patch:unknown):PlayerPreferences {
 const value=normalizePreferences(current),changes=parsePreferencesPatch(patch);return validate(parsePlayerPreferences({version:2,audio:{...value.audio,...changes.audio},text:{...value.text,...changes.text},playback:{...value.playback,...changes.playback},input:{...value.input,...changes.input},display:{...value.display,...changes.display}}));
}
