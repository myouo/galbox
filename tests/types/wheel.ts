import {defaultPreferences,mergePreferences} from 'galbox-sdk/settings';
import type {PreferencesPatch} from 'galbox-sdk/protocol';
const patch:PreferencesPatch={input:{wheel:false}};
mergePreferences(defaultPreferences(),patch);
// @ts-expect-error wheel is a boolean, not a key binding
const wrong:PreferencesPatch={input:{wheel:'WheelDown'}};
void wrong;

const step:PreferencesPatch={input:{wheelMode:'step'}};
mergePreferences(defaultPreferences(),step);
// @ts-expect-error wheel mode is a finite implemented policy
const invalidMode:PreferencesPatch={input:{wheelMode:'auto'}};
void invalidMode;
