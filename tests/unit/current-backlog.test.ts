import {it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {ProgramBuilder,richPage,richText as R,instruction} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {historyPolicy} from 'galbox-sdk/player';
import {HistoryJournal,MemoryStore} from 'galbox-sdk/testing';
import {HistoryText} from 'galbox-sdk/react';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
const program=()=>new ProgramBuilder({gameId:'current-history',release:'v1',entry:'main'}).function({id:'main',entry:'hidden',layout:1,params:[],locals:[],returns:'void',code:[richPage('hidden','hidden','v1','',[R.text('Suppressed')],{recordHistory:false}),richPage('first','first','v1','',[R.text('A'),R.ruby('猫','ねこ'),R.text('BC')]),richPage('next','next','v1','',[R.text('Next')]),instruction('control.end',{at:'end'})]}).build();
it('current-history policy is optional, boolean and wire compatible',()=>{
 expect(historyPolicy()).not.toHaveProperty('includeCurrentText');for(const includeCurrentText of [true,false]){const value=historyPolicy({includeCurrentText});expect(decodeWire('HistoryPolicy',encodeWire('HistoryPolicy',value))).toEqual(value);}expect(()=>historyPolicy({includeCurrentText:'yes'} as never)).toThrow('HISTORY_POLICY');
});
it('source-bound partial text is a read-only pending row, suppressed text stays hidden and confirmation never duplicates it',async()=>{
 const p=program();let c=createCore(p);c.accept({type:'history.session',id:'current-history-test'});c.accept({type:'text.preferences',value:{intervalMs:10}});c.run(100);expect(c.view().currentHistoryText).toBeNull();
 const advance=()=>{const w=c.view().run.wait;if(w?.kind!=='text')throw Error('text');c.accept({type:'reveal',prompt:w.prompt,inputId:'reveal:'+w.prompt});c.accept({type:'advance',prompt:w.prompt,inputId:'advance:'+w.prompt});c.run(100);};advance();
 const store=new MemoryStore(),journal=new HistoryJournal(historyPolicy({maxEntries:2,includeCurrentText:true}),{revision:0,entries:[]},'main',null,'current',store),rows=()=>{const v=c.view();return journal.items(v.run.history,v.canSave,v.saveReason,p.release,v.currentHistoryText);};
 expect(rows()).toEqual([]);c.accept({type:'tick',ms:10});const cut=c.capture(),profile=c.view().profile;expect(rows()).toHaveLength(1);expect(rows()[0]).toMatchObject({canReplay:false,canRollback:false,rollbackReason:'UNCONFIRMED_TEXT',text:{revealed:1}});
 expect(renderToStaticMarkup(createElement(HistoryText,{text:rows()[0]!.text,respectRevealed:true}))).toContain('>A<');expect(renderToStaticMarkup(createElement(HistoryText,{text:rows()[0]!.text,respectRevealed:true}))).not.toContain('ねこ');expect(c.capture()).toEqual(cut);expect(c.view().profile).toEqual(profile);expect(journal.dirty).toBe(false);await journal.flush();expect((await store.readHistory('main')).entries).toEqual([]);
 const legacy=new HistoryJournal(historyPolicy(),{revision:0,entries:[]},'main',null,'legacy',store);expect(legacy.items(cut.history,true,null,p.release,c.view().currentHistoryText)).toEqual([]);
 c=createCore(p,profile,decodeWire('Snapshot',encodeWire('Snapshot',cut)));expect(rows()[0]?.text).toEqual(cut.text);advance();c.accept({type:'tick',ms:10});expect(rows()).toHaveLength(2);expect(rows().map(r=>r.text.textId)).toEqual(['first','next']);expect(c.capture().history).toHaveLength(1);advance();expect(rows()).toHaveLength(2);expect(rows().every(r=>r.rollbackReason!=='UNCONFIRMED_TEXT')).toBe(true);
});
it('one-row display bounds include the current row without exposing older entries',()=>{
 const p=program(),c=createCore(p);c.accept({type:'history.session',id:'bound'});c.accept({type:'text.preferences',value:{intervalMs:0}});c.run(100);for(let n=0;n<2;n++){const w=c.view().run.wait;if(w?.kind!=='text')throw Error('text');c.accept({type:'advance',prompt:w.prompt,inputId:String(n)});c.run(100);}const v=c.view(),h=new HistoryJournal(historyPolicy({maxEntries:1,includeCurrentText:true}),{revision:0,entries:[]},'main',null,'bound',new MemoryStore());expect(v.run.history).toHaveLength(1);expect(h.items(v.run.history,true,null,p.release,v.currentHistoryText).map(r=>r.text.textId)).toEqual(['next']);
});
