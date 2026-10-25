import {richPage,richText as R,expr as E,variable} from '../../packages/galbox-sdk/src/program-tools/index.js';
import type {DeepReadonly,TextState} from '../../packages/galbox-sdk/src/protocol/index.js';
export function textTypes(saved:DeepReadonly<TextState>){
 richPage('rich','rich.page','v1','澪',[R.text(E.variable(variable('name','string')),{color:'#FFCCAA',effect:{kind:'fade',duration:100}}),R.ruby('海','うみ'),R.br(),R.pause(100),R.speed(20)]);
 // @ts-expect-error Text factories require string expressions.
 R.text(E.integer(2));
 // @ts-expect-error Ruby reading cannot be a boolean expression.
 R.ruby('海',E.flag(true));
 // @ts-expect-error Registered text effects have correlated required parameters.
 R.text('海',{effect:{kind:'wave',duration:10}});
 // @ts-expect-error Arbitrary CSS is not a typed text capability.
 R.text('海',{filter:'blur(2px)'});
 // @ts-expect-error Snapshot runs remain recursively readonly.
 saved.rich?.runs.push(R.br());
}
