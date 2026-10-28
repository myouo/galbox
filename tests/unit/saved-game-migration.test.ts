import {it,expect} from 'vitest';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {defineSavedGameMigration} from '../../packages/galbox-sdk/src/backups/saved-game.js';
import {createCore} from 'galbox-sdk/core';
import {parseSnapshot,parseProfile} from 'galbox-sdk/protocol';
import {bindSavedGameMigrations,migrateSavedGame} from '../../packages/galbox-sdk/src/backups/saved-game.js';
const program=(release:string)=>new ProgramBuilder({gameId:'migration',release,entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[instruction('text.page',{at:'page',textId:'page',revision:release,speaker:'',content:release}),instruction('control.end',{at:'end'})]}).build();
const cancel={cancelled:false,onCancel:()=>()=>{}};
it('real saved-game factory validates both releases, isolates callbacks and admits only declared read aliases',async()=>{
 const old=program('v1'),target=program('v2'),core=createCore(old);core.run(100);const snapshot=core.capture(),profile=parseProfile({...core.view().profile,read:['page@v1']});
 const m=defineSavedGameMigration({id:'upgrade',gameId:old.gameId,series:'1',fromRelease:'v1',toRelease:'v2',sourceProgram:()=>old,migrate(input){expect(Object.isFrozen(input.snapshot)).toBe(true);const s=parseSnapshot(input.snapshot);s.release='v2';if(s.text){s.text.revision='v2';s.text.content='v2';}return {snapshot:s,readAliases:[{from:'page@v1',to:'page@v2'}]};}});
 expect(bindSavedGameMigrations([m],target,'1')).toEqual([m]);expect(()=>bindSavedGameMigrations([m,m],target,'1')).toThrow('SAVE_MIGRATION_DUPLICATE');expect(()=>bindSavedGameMigrations([m],target,'wrong')).toThrow('SAVE_MIGRATION_TARGET');
 const next=await migrateSavedGame(m,target,snapshot,profile,cancel);expect(next.snapshot.text?.content).toBe('v2');expect(next.reads).toEqual(['page@v2']);expect(snapshot.text?.content).toBe('v1');expect(profile.read).toEqual(['page@v1']);
});
it('retag-only, unknown aliases, source drift and cancellation reject without mutating old saves',async()=>{
 const old=program('v1'),target=program('v2'),core=createCore(old);core.run(100);const s=core.capture(),p=parseProfile(core.view().profile);
 const m=defineSavedGameMigration({id:'bad',gameId:'migration',series:'1',fromRelease:'v1',toRelease:'v2',sourceProgram:()=>old,migrate(input){return {snapshot:{...parseSnapshot(input.snapshot),release:'v2'}};}});
 await expect(migrateSavedGame(m,target,s,p,cancel)).rejects.toThrow('RESTORE_TEXT');await expect(migrateSavedGame(m,target,s,p,{...cancel,cancelled:true})).rejects.toThrow('SAVE_MIGRATION_CANCELLED');expect(s.release).toBe('v1');
 const drift=defineSavedGameMigration({id:'drift',gameId:'migration',series:'1',fromRelease:'v1',toRelease:'v2',sourceProgram:()=>target,migrate(){throw new Error('must not call');}});await expect(migrateSavedGame(drift,target,s,p,cancel)).rejects.toThrow('SAVE_MIGRATION_SOURCE');
});
it('an ignored cancellation cannot hold the activation queue or admit its late result',async()=>{
 const old=program('v1'),target=program('v2'),core=createCore(old);core.run(100);let listener=()=>{},late:(p:unknown)=>void=()=>{};const pending=new Promise<unknown>(r=>{late=r;}),signal={cancelled:false,onCancel(fn:()=>void){listener=fn;return()=>{listener=()=>{};};}},m=defineSavedGameMigration({id:'cancelled',gameId:'migration',series:'1',fromRelease:'v1',toRelease:'v2',sourceProgram:()=>pending,migrate(){throw new Error('must not run');}}),work=migrateSavedGame(m,target,core.capture(),parseProfile(core.view().profile),signal);signal.cancelled=true;listener();await expect(work).rejects.toThrow('SAVE_MIGRATION_CANCELLED');late(old);
});
