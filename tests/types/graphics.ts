import {parseGraphicsOptions} from 'galbox-sdk/protocol';
import type {PlayerOptions,GraphicsOptions} from 'galbox-sdk/player';
export function graphicsTypes(options:PlayerOptions){const graphics:GraphicsOptions=parseGraphicsOptions({renderer:'auto'});const canvas:PlayerOptions={...options,graphics:{renderer:'canvas',maxCanvasBytes:67108864}};void graphics;void canvas;
 // @ts-expect-error Only validated and implemented backends are public.
 const invalid:PlayerOptions={...options,graphics:{renderer:'webgpu'}};void invalid;
 // @ts-expect-error Composition budget is numeric and validated at runtime.
 const wrongBudget:GraphicsOptions={renderer:'canvas',maxCanvasBytes:'unlimited'};void wrongBudget;
 // @ts-expect-error Renderer selection is not an arbitrary string.
 const disabled:GraphicsOptions={renderer:'disabled'};void disabled;
}
