import {stageImage,stageTween,stageFilter,stageTransition,stageCamera,expr as E,variable} from '../../packages/galbox-sdk/src/program-tools/index.js';
import type {AssetRef} from '../../packages/galbox-sdk/src/program-tools/index.js';
export function stageTypes(image:AssetRef<'image'>,audio:AssetRef<'audio'>){stageImage('put','character',image,{x:E.variable(variable('x','f64')),scaleX:-1,anchorX:.5});stageTween('move','move','character',{rotation:90},{duration:E.integer(1000),relative:true});stageFilter('blur','blur',{kind:'camera'},{blur:4},{duration:500});stageCamera('zoom','zoom',{zoom:1.2},{duration:500});
 // @ts-expect-error Images cannot be sourced from audio handles.
 stageTransition('bad','bad','character',audio,{duration:500});
 // @ts-expect-error Numeric stage fields cannot use bool expressions.
 stageTween('bad','bad','character',{x:E.flag(true)},{duration:500});
 // @ts-expect-error Duration is an integer expression, not f64.
 stageTween('bad','bad','character',{x:10},{duration:E.real(500)});
 // @ts-expect-error Unknown transform fields are not a capability.
 stageImage('bad','bad',image,{quaternion:1});
 // @ts-expect-error Registered filters have finite published fields.
 stageFilter('bad','bad',{kind:'camera'},{shader:'custom'},{duration:500});
}
