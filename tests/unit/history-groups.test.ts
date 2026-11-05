import {it,expect} from 'vitest';
import {createCore} from 'galbox-sdk/core';
import {groupHistoryEntries} from 'galbox-sdk/react';
import {HistoryJournal,MemoryStore,historyPolicy} from 'galbox-sdk/testing';
import {ProgramBuilder,richPage,historyText,richText as R,instruction} from 'galbox-sdk/port-kit';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
function fixture(){const p=new ProgramBuilder({gameId:'append-groups',release:'v1',entry:'main'}).function({id:'main',entry:'body',layout:1,params:[],locals:[],returns:'void',code:[richPage('body','body','v1','Writer',[R.text('Body')]),historyText('a','a','v1',[R.text(' + red',{color:'#ff0000'})],{speaker:'Writer',append:true}),historyText('b','b','v1',[R.text(' + tail')],{speaker:'Writer',append:true}),historyText('separate','separate','v1',[R.text('New block')],{append:false,speaker:'Archive'}),richPage('next','next','v1','Writer',[R.text('Next')]),instruction('control.end',{at:'end'})]}).build(),c=createCore(p);c.accept({type:'history.session',id:'group-test'});c.accept({type:'text.preferences',value:{intervalMs:0}});c.run(100);const w=c.view().run.wait;if(w?.kind!=='text')throw Error('body');c.accept({type:'advance',prompt:w.prompt,inputId:'advance'});c.run(100);return {p,c};}
it('groups actual factory-built append rows while preserving style, identity, pending boundaries and cold order',()=>{
 const {p,c}=fixture(),snapshot=c.capture(),before=JSON.stringify(snapshot),journal=new HistoryJournal(historyPolicy({includeCurrentText:true}),{revision:0,entries:[]},'main',null,'groups',new MemoryStore()),v=c.view(),rows=journal.items(v.run.history,true,null,p.release,v.currentHistoryText),groups=groupHistoryEntries(rows);
 expect(groups.map(g=>g.map(r=>r.text.textId))).toEqual([['body','a','b'],['separate'],['next']]);expect(groups[0]?.[1]?.text.rich?.runs[0]).toMatchObject({style:{color:'#ff0000'}});expect(groups[0]?.[1]).toBe(rows[1]);expect(Object.isFrozen(groups)).toBe(true);expect(groups.every(Object.isFrozen)).toBe(true);expect(c.capture()).toEqual(snapshot);expect(JSON.stringify(snapshot)).toBe(before);expect(c.view().profile.read).toEqual(['body@v1']);expect(journal.dirty).toBe(false);
 const cold=createCore(p,c.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',snapshot))),view=cold.view();expect(groupHistoryEntries(journal.items(view.run.history,true,null,p.release,view.currentHistoryText))).toEqual(groups);
});
it('a clipped leading append remains visible and false markers/ordinary text never get joined by matching speakers',()=>{
 const {p,c}=fixture(),h=new HistoryJournal(historyPolicy(),{revision:0,entries:[]},'main',null,'clipped',new MemoryStore()),rows=h.items(c.view().run.history,true,null,p.release),clipped=rows.slice(1),before=clipped.slice();
 expect(groupHistoryEntries(clipped).map(g=>g.map(r=>r.text.textId))).toEqual([['a','b'],['separate']]);expect(clipped).toEqual(before);expect(groupHistoryEntries([])).toEqual([]);expect(groupHistoryEntries([rows[0]!,rows[0]!])).toHaveLength(2);
});
