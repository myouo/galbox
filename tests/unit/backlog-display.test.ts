import {it,expect} from 'vitest';
import {historyPolicy} from 'galbox-sdk/player';
import {HistoryJournal,MemoryStore} from 'galbox-sdk/testing';
import {createCore} from 'galbox-sdk/core';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {parseHistoryPolicy,parseHistoryRecord} from 'galbox-sdk/protocol';
import {largeBacklogCut} from '../fixtures/game-data/large-backlog/source.js';

it('validates an independent optional display bound through the public factory and wire',()=>{
 const legacy=historyPolicy();expect(legacy).toEqual({maxEntries:32,maxCharacters:500000,rollback:true});expect(decodeWire('HistoryPolicy',encodeWire('HistoryPolicy',legacy))).toEqual(legacy);
 const expanded=historyPolicy({maxEntries:8,maxDisplayEntries:2048,rollback:false});expect(decodeWire('HistoryPolicy',encodeWire('HistoryPolicy',expanded))).toEqual(expanded);
 for(const value of [0,2049,1.5,'2048'])expect(()=>parseHistoryPolicy({...expanded,maxDisplayEntries:value})).toThrow('HISTORY_POLICY');expect(()=>historyPolicy({maxEntries:65,maxDisplayEntries:2048})).toThrow('HISTORY_POLICY');
});
it('projects actual long-run text separately from the unchanged checkpoint journal and cold restores',async()=>{
 const {program,cut,profile}=largeBacklogCut(),cold=createCore(program,profile,decodeWire('Snapshot',encodeWire('Snapshot',cut))).capture();expect(cold.history).toEqual(cut.history);
 const policy=historyPolicy({maxEntries:8,maxDisplayEntries:2048,rollback:false}),store=new MemoryStore(),journal=new HistoryJournal(policy,{revision:0,entries:[]},'main',null,'test',store);for(const text of cold.history)journal.confirmed(null,text,'ROLLBACK_DISABLED',program.release);await journal.flush();const persisted=await store.readHistory('main');expect(persisted.entries).toHaveLength(8);expect(persisted.entries.every(e=>e.snapshot===null)).toBe(true);
 const rows=journal.items(cold.history,true,null,program.release);expect(rows).toHaveLength(2048);expect(rows[0]?.text.content).toBe('Entry 52');expect(rows.at(-1)?.text.content).toBe('Entry 2099');expect(rows.every(r=>!r.canRollback&&r.rollbackReason==='ROLLBACK_DISABLED')).toBe(true);
 const legacy=new HistoryJournal(historyPolicy({maxEntries:8}),{revision:0,entries:[]},'main',null,'old',new MemoryStore());expect(legacy.items(cold.history,true,null)).toHaveLength(8);
 const expired=new HistoryJournal(historyPolicy({maxEntries:8,maxDisplayEntries:2048}),{revision:0,entries:[]},'main',null,'expired',new MemoryStore());expect(expired.items(cold.history,true,null)[0]?.rollbackReason).toBe('CHECKPOINT_EXPIRED');
 expect(()=>parseHistoryRecord({revision:0,entries:cold.history.slice(0,65).map(text=>({id:text.historyId!,release:program.release,text,snapshot:null,reason:'ROLLBACK_DISABLED'}))})).toThrow('HISTORY_RECORD');
},60000);
