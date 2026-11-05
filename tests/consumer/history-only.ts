import {createCore} from 'galbox-sdk/core';
import {ProgramBuilder,historyText,richPage,richText,instruction} from 'galbox-sdk/port-kit';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
export function verifyHistoryOnly(){
 const p=new ProgramBuilder({gameId:'packed-history-only',release:'v1',entry:'main'}).function({id:'main',entry:'note',layout:1,params:[],locals:[],returns:'void',code:[historyText('note','note','v1',[richText.text('Only in history')],{append:true}),richPage('body','body','v1','',[richText.text('Visible')]),instruction('control.end',{at:'end'})]}).build(),c=createCore(decodeWire('Program',encodeWire('Program',p)));c.accept({type:'text.preferences',value:{intervalMs:0}});c.run(100);const s=c.capture(),cold=createCore(p,c.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',s)));if(s.text?.content!=='Visible'||s.history[0]?.content!=='Only in history'||s.history[0]?.rich?.historyAppend!==true||c.view().profile.read.length||cold.capture().history.length!==1)throw new Error('packed history-only state');return true;
}
