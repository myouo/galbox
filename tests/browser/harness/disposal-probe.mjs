// Test-only instrumentation of the pinned Pixi instance used by the production SDK.
import {Application,Texture,GlobalResourceRegistry} from '../../../packages/galbox-sdk/node_modules/pixi.js/lib/index.mjs';
export {GlobalResourceRegistry};
export function holdApplicationInitialization(){
 const original=Application.prototype.init,destroy=Application.prototype.destroy;let entered,release,canvas,destroyed=0;const ready=new Promise(r=>{entered=r;}),gate=new Promise(r=>{release=r;});
 Application.prototype.init=async function(...args){entered();await gate;await original.apply(this,args);canvas=this.canvas;};
 Application.prototype.destroy=function(...args){destroyed++;return destroy.apply(this,args);};
 return {ready,release:()=>release(),snapshot:()=>({destroyed,connected:canvas?.isConnected??false,contextLost:(canvas?.getContext('webgl2')??canvas?.getContext('webgl'))?.isContextLost()??false}),restore(){Application.prototype.init=original;Application.prototype.destroy=destroy;}};
}
export function instrumentDisposal(mode='baseline'){
 const events=[],renders={requested:0,submitted:0,flushes:0},restores=[];let disposing=false,phase=0,globalClears=0;const remembered=new WeakMap();
 function wrap(object,key,make){const original=object[key];object[key]=make(original);restores.push(()=>{object[key]=original;});}
 function measure(name,run){const t=performance.now();try{return run();}finally{if(disposing)events.push({phase,name,ms:performance.now()-t});}}
 wrap(Application.prototype,'destroy',original=>function(options,...rest){return measure('Application.destroy',()=>original.call(this,mode==='scoped-destroy'&&options===true?{removeView:true}:options,...rest));});
 wrap(Texture.prototype,'destroy',original=>function(...args){return measure('Texture.destroy',()=>original.apply(this,args));});
 wrap(GlobalResourceRegistry,'release',original=>function(...args){globalClears++;return measure('GlobalResourceRegistry.release',()=>original.apply(this,args));});
 wrap(Application.prototype,'render',original=>function(...args){renders.requested++;if(mode==='render-on-change'){const key=JSON.stringify(this.stage.children.map(s=>({id:s.uid,asset:s.texture?.uid,x:s.position.x,y:s.position.y,alpha:s.alpha,z:s.zIndex})));if(remembered.get(this)===key)return;remembered.set(this,key);}renders.submitted++;const result=original.apply(this,args);if(mode==='flush-after-render')this.renderer.gl.flush();return result;});
 const extensions=new WeakSet();for(const prototype of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype]){
  for(const key of ['deleteTexture','deleteBuffer','deleteProgram','useProgram','getParameter','getError','finish','flush'])wrap(prototype,key,original=>function(...args){if(key==='flush')renders.flushes++;return measure('WebGL.'+key,()=>original.apply(this,args));});
  wrap(prototype,'getExtension',original=>function(name){const ext=original.call(this,name);if(name==='WEBGL_lose_context'&&ext&&!extensions.has(ext)){extensions.add(ext);wrap(ext,'loseContext',fn=>function(...args){return measure('WebGL.loseContext',()=>fn.apply(this,args));});}return ext;});
 }
 wrap(AudioContext.prototype,'close',original=>function(...args){return measure('AudioContext.close',()=>original.apply(this,args));});
 return {events,renders,get globalClears(){return globalClears;},dispose(player){phase++;disposing=true;const t=performance.now();try{player.dispose();return performance.now()-t;}finally{disposing=false;}},restore(){for(const restore of restores.reverse())restore();}};
}

export function failWebGLInitialization(){const original=Application.prototype.init;let context;const attempts=[];Application.prototype.init=async function(options){attempts.push(options.preference[0]);if(options.preference[0]==='webgl'){context=options.context;throw new Error('Injected WebGL initialization failure');}return original.call(this,options);};return {snapshot:()=>({attempts:[...attempts],failedContextLost:context?.isContextLost()??false}),restore(){Application.prototype.init=original;}};}
