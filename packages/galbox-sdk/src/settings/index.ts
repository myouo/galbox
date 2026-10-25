import {parsePlayerPreferences,parsePreferencesPatch} from '../protocol/index.js';
import type {PlayerPreferences} from '../protocol/index.js';
export type {PlayerPreferences,PreferencesRecord,PreferencesPatch} from '../protocol/index.js';
export function defaultPreferences():PlayerPreferences {return parsePlayerPreferences({version:1,audio:{master:.6,bgm:1,voice:1,sfx:1},text:{intervalMs:32}});}
export function mergePreferences(current:unknown,patch:unknown):PlayerPreferences {
 const value=parsePlayerPreferences(current),changes=parsePreferencesPatch(patch);return parsePlayerPreferences({version:1,audio:{...value.audio,...changes.audio},text:{...value.text,...changes.text}});
}
