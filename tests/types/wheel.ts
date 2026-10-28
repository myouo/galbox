import {defaultPreferences,mergePreferences} from 'galbox-sdk/settings';
import type {PreferencesPatch} from 'galbox-sdk/protocol';
const patch:PreferencesPatch={input:{wheel:false}};
mergePreferences(defaultPreferences(),patch);
// @ts-expect-error wheel is a boolean, not a key binding
const wrong:PreferencesPatch={input:{wheel:'WheelDown'}};
void wrong;
