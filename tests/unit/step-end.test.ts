import {it,expect} from 'vitest';
import {ProgramBuilder,instruction,stageImage,stageTween} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {parseSnapshot,emptyProfile} from 'galbox-sdk/protocol';
it('step-end holds the authored pose until its exact endpoint and restores the remaining time through public wire',()=>{
 const b=new ProgramBuilder({gameId:'step-end',release:'v1',entry:'main'}),art=b.asset('image',{id:'art',path:'art.svg',mime:'image/svg+xml',sha256:'0'.repeat(64)}),p=b.function({id:'main',entry:'art',layout:1,params:[],locals:[],returns:'void',code:[stageImage('art','art',art,{alpha:1}),stageTween('hold','hold','art',{alpha:0},{duration:500,easing:'step-end'}),instruction('text.page',{at:'text',textId:'text',revision:'v1',speaker:'',content:'Hold'}),instruction('control.end',{at:'end'})]}).build(),core=createCore(decodeWire('Program',encodeWire('Program',p)));core.run(100);core.accept({type:'tick',ms:250});const cut=decodeWire('Snapshot',encodeWire('Snapshot',core.capture()));expect(cut.stage[0]?.position.alpha).toBe(1);const restored=createCore(p,undefined,cut);restored.accept({type:'tick',ms:249});expect(restored.capture().stage[0]?.position.alpha).toBe(1);restored.accept({type:'tick',ms:1});expect(restored.capture().stage[0]?.position.alpha).toBe(0);expect(restored.capture().frames).toEqual(cut.frames);
 const forged=parseSnapshot(cut);forged.stage[0]!.position.alpha=.5;expect(()=>createCore(p,emptyProfile(),forged)).toThrow();
});
