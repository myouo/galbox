import {uiButton,uiToggle,uiRange,uiInput,uiImage,uiScreen,uiCatalog,uiField,waitUI,setUIRange,setUIToggle,variable,expr} from 'galbox-sdk/port-kit';
import type {AssetRef} from 'galbox-sdk/port-kit';
import type {Player} from 'galbox-sdk/player';
export function uiTypes(audio:AssetRef<'audio'>,player:Player){const options={rect:{x:0,y:0,width:100,height:50},text:'label'},button=uiButton('ok',options),toggle=uiToggle('flag',true,options),range=uiRange('amount',5,{...options,min:0,max:10,step:1}),input=uiInput('name','',{...options,maxLength:20}),screen=uiScreen('form','form',[button,toggle,range,input]);uiCatalog('ui','v1',[screen]);waitUI('wait',screen,variable('choice','string'),[{control:button,target:'next'}],[uiField(toggle,variable('on','bool')),uiField(range,variable('value','i32')),uiField(input,variable('name','string'))]);setUIRange('change',screen,range,expr.integer(7));void player.uiAction({type:'ui.toggle',control:'flag',value:false},1,1,1,1);
 // @ts-expect-error UI image must be an image resource.
 uiImage('art',audio,options);
 // @ts-expect-error Toggle fields write bool slots.
 uiField(toggle,variable('bad','string'));
 // @ts-expect-error Range fields write i32 slots.
 uiField(range,variable('bad','bool'));
 // @ts-expect-error Update kind is associated with the control factory.
 setUIRange('bad',screen,toggle,expr.integer(1));
 // @ts-expect-error Toggle takes a bool expression.
 setUIToggle('bad',screen,toggle,expr.integer(1));
 // @ts-expect-error Buttons alone can choose branches.
 waitUI('bad',screen,variable('choice','string'),[{control:input,target:'next'}]);
 // @ts-expect-error Event discriminant determines payload type.
 void player.uiAction({type:'ui.range',control:'amount',value:'5'},1,1,1,1);
}
