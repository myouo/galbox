import type {ColorMatrixFilter} from 'pixi.js';
/** Exact authored color transform, shared by the GPU matrix and Canvas filter paths. */
export const canvasColors=new WeakMap<ColorMatrixFilter,{brightness:number;grayscale:number}>();
