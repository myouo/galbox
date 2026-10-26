import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {gamePresentation,ProgramBuilder,instruction,linkProgram} from 'galbox-sdk/port-kit';
import {parseProgram,parseGamePresentation,parseSystemScreen} from 'galbox-sdk/protocol';
import {createCore} from 'galbox-sdk/core';
import {PressGesture} from '../../packages/galbox-sdk/src/runtime/press.js';
const program=(name='program')=>parseProgram(JSON.parse(readFileSync(`fixtures/presentation-novel/${name}.json`,'utf8')));
it('real presentation factories validate kind associations, safe tokens, finite actions and required navigation',()=>{
 // @ts-expect-error Runtime resource kind validation is not replaced by the type.
 expect(()=>gamePresentation({title:{background:{id:'music',kind:'audio'}}})).toThrow('PRESENTATION_IMAGE');
 // @ts-expect-error Font association is checked at runtime.
 expect(()=>gamePresentation({font:{family:'sans',asset:{id:'image',kind:'image'}}})).toThrow('PRESENTATION_FONT');
 expect(()=>gamePresentation({toolbar:['auto']})).toThrow('PRESENTATION_MENU');expect(()=>gamePresentation({toolbar:['menu','menu']})).toThrow('PRESENTATION_SCHEMA');expect(()=>gamePresentation({palette:{accent:'red;display:none'}})).toThrow('PRESENTATION_SCHEMA');expect(()=>parseSystemScreen('script:jump')).toThrow('PRESENTATION_SCHEMA');const wire=gamePresentation();expect(()=>parseGamePresentation({...wire,url:'https://example.invalid'})).toThrow('PRESENTATION_SCHEMA');const raw=program();raw.presentation!.title.background='bgm-long';expect(()=>linkProgram(raw)).toThrow('PRESENTATION_IMAGE');
});
it('skin configuration is detached from caller mutations and old unconfigured programs remain accepted',()=>{
 const opts={palette:{accent:'#123456'},labels:{start:'新的开始'}},skin=gamePresentation(opts),builder=new ProgramBuilder({gameId:'skin-owner',release:'v1',entry:'main'}).presentation(skin).function({id:'main',entry:'end',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.end',{at:'end'})]});opts.palette.accent='#ffffff';skin.labels.start='mutated';const p=builder.build();expect(p.presentation?.palette.accent).toBe('#123456');expect(p.presentation?.labels.start).toBe('新的开始');const legacy=parseProgram(p);delete legacy.presentation;expect(()=>linkProgram(legacy)).not.toThrow();
});
it('changing only authored skin keeps the same Core snapshot and current profile restore semantics',()=>{
 const night=program(),paper=program('paper'),a=createCore(night);a.run(100);const saved=a.capture(),b=createCore(paper,a.view().profile,saved);expect(b.capture().wait).toEqual(saved.wait);expect(b.capture().globals).toEqual(saved.globals);expect(b.capture().flow).toEqual(saved.flow);expect(b.capture().ui).toEqual(saved.ui);expect(b.capture().extrasSignature).toBe(saved.extrasSignature);expect(b.view().profile).toEqual(a.view().profile);expect(saved).not.toHaveProperty('presentation');expect(paper.presentation?.palette.background).not.toBe(night.presentation?.palette.background);
});
it('production press tracker rejects pan, cancellation, another pointer, changed identities and release outside bounds',()=>{
 const p=new PressGesture(),bounds={left:0,top:0,right:100,bottom:100};p.pointerDown('a',1,10,10);expect(p.pointerUp('a',2,10,10,bounds)).toBe(false);expect(p.pointerUp('a',1,10,10,bounds)).toBe(true);p.pointerDown('a',2,20,20,false);expect(p.pointerUp('a',2,20,20,bounds)).toBe(false);p.pointerDown('a',1,10,10);p.pointerMove(1,10,50);expect(p.pointerUp('a',1,10,10,bounds)).toBe(false);p.pointerDown('a',1,95,10);expect(p.pointerUp('a',1,101,10,bounds)).toBe(false);p.pointerDown('a',1,10,10);expect(p.pointerUp('b',1,10,10,bounds)).toBe(false);p.pointerDown('a',1,10,10);p.cancel();expect(p.pointerUp('a',1,10,10,bounds)).toBe(false);
});
it('production press tracker consumes keyboard releases once and cancels held keys across session changes',()=>{
 const p=new PressGesture();p.keyDown('a','Enter',true);expect(p.keyUp('a','Enter')).toBe(false);p.keyDown('a','Enter',false);p.keyDown('b','Enter',true);expect(p.keyUp('b','Enter')).toBe(false);p.keyDown('b','Space',false);expect(p.keyUp('b','Space')).toBe(true);expect(p.keyUp('b','Space')).toBe(false);p.keyDown('b','Enter',false);p.cancel();expect(p.keyUp('b','Enter')).toBe(false);
});
