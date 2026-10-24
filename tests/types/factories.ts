import { instruction, set, variable, imagePut, ProgramBuilder } from '../../packages/galbox-sdk/src/program-tools/index.js';
import { i32, bool } from '../../packages/galbox-sdk/src/protocol/index.js';
import type { DeepReadonly } from '../../packages/galbox-sdk/src/protocol/index.js';
instruction('control.end',{at:'end'});
// @ts-expect-error opcode and args remain correlated
instruction('control.end',{at:'bad',target:'wrong'});
// @ts-expect-error missing branch comparison operands
instruction('control.branch',{at:'bad',yes:'one',no:'two'});
set('set',variable('number','i32'),i32(1));
// @ts-expect-error variable/value correlation in the actual factory
set('bad',variable('number','i32'),bool(true));
const builder=new ProgramBuilder({gameId:'types',release:'v1',entry:'main'});
const audio=builder.asset('audio',{id:'tone',path:'tone.wav',mime:'audio/wav',sha256:'0'.repeat(64)});
// @ts-expect-error audio references cannot enter image operations
imagePut('bad','picture',audio,{x:0,y:0,alpha:1});
declare const brand:unique symbol;
type Address=string&{readonly [brand]:'Address'};
declare const address:Address;
const tuple:DeepReadonly<[Address,number]>=[address,1];
const preserved:Address=tuple[0];void preserved;
// @ts-expect-error tuple length preserved
const wrong:DeepReadonly<[Address,number]>=[address];void wrong;
// @ts-expect-error branded primitive preserved
const lost:Address='ordinary';void lost;
