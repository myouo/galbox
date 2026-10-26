import {interactionPrompt,videoPlay,variable,expr as E} from 'galbox-sdk/port-kit';
import type {AssetRef} from 'galbox-sdk/port-kit';
export function interactionTypes(video:AssetRef<'video'>,image:AssetRef<'image'>){interactionPrompt('p',variable('route','string'),'路線',[{id:'a',label:'A',target:'end',enabled:E.flag(true)}],{deadlineMs:E.integer(1000),timeout:{id:'timeout',target:'end'}});videoPlay('v','v',video,{restore:'replay'});
 // @ts-expect-error Destination must remain a string variable.
 interactionPrompt('bad',variable('route','i32'),'bad',[{id:'a',label:'A',target:'end'}]);
 // @ts-expect-error Enabled expressions are boolean.
 interactionPrompt('bad',variable('route','string'),'bad',[{id:'a',label:'A',target:'end',enabled:E.integer(1)}]);
 // @ts-expect-error Video factory rejects image resources.
 videoPlay('bad','bad',image,{restore:'replay'});
 // @ts-expect-error A deadline requires an authored timeout branch.
 interactionPrompt('bad',variable('route','string'),'bad',[{id:'a',label:'A',target:'end'}],{deadlineMs:100});
 // @ts-expect-error Deadline time is i32, not f64.
 interactionPrompt('bad',variable('route','string'),'bad',[{id:'a',label:'A',target:'end'}],{deadlineMs:E.real(1000)});
}
