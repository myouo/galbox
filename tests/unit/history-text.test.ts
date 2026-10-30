import {it,expect} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {HistoryText} from 'galbox-sdk/react';
import {ProgramBuilder,richPage,richText as R,instruction} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
it('static history keeps rich styles and ruby, applies an authored palette and can respect the revealed prefix',()=>{
 const p=new ProgramBuilder({gameId:'history-format',release:'v1',entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[richPage('page','unit','v1','',[R.text('A',{scale:1.5,italic:true,color:'#707070'}),R.confirm(),R.ruby('B','bee',{bold:true,color:'#9CD0E3'}),R.br(),R.text('<tag>',{color:'#ff0000'})]),instruction('control.end',{at:'end'})]}).build(),c=createCore(p);c.run(100);
 const props={text:c.capture().text!,fontSize:16,lineHeight:25,allowedColors:['#ff0000','#9cd0e3'],defaultColor:'#ffffff'},html=renderToStaticMarkup(createElement(HistoryText,props));expect(html).toContain('font-size:24px');expect(html).toContain('line-height:33px');expect(html).toContain('font-style:italic');expect(html).toContain('color:#ffffff');expect(html).toContain('font-weight:bold');expect(html).toContain('color:#9CD0E3');expect(html).toContain('<ruby');expect(html).toContain('<rt>bee</rt>');expect(html).toContain('&lt;tag&gt;');expect(html).not.toContain('<tag>');
 expect(renderToStaticMarkup(createElement(HistoryText,{...props,respectRevealed:true}))).not.toContain('>A<');c.accept({type:'tick',ms:32});const prefix=renderToStaticMarkup(createElement(HistoryText,{...props,text:c.capture().text!,respectRevealed:true}));expect(prefix).toContain('>A<');expect(prefix).not.toContain('<ruby');
});
