import {expr as E,variable,assignExpression,randomI32,templatePage,expressionOperand} from '../../packages/galbox-sdk/src/program-tools/index.js';
const count=variable('count','i32'),name=variable('name','string');
assignExpression('good',count,E.binary('add',E.variable(count),E.integer(1)));templatePage('page','hello','v1',E.text('speaker'),E.template`Hello ${E.variable(name)}: ${E.variable(count)}`);
// @ts-expect-error Actual arithmetic factory rejects bool operands.
E.binary('add',E.flag(true),E.integer(1));
// @ts-expect-error NoInfer pins comparison operand identity to the left kind.
E.equal(E.integer(1),E.text('1'));
// @ts-expect-error Actual assignment factory retains destination/expression association.
assignExpression('bad',count,E.text('wrong'));
// @ts-expect-error Conditional branches must have the same value family.
E.choose(E.flag(true),E.integer(1),E.text('wrong'));
// @ts-expect-error Booleans have no ordering.
E.compare(E.flag(true),'lt',E.flag(false));
// @ts-expect-error RNG destinations must be integer variables.
randomI32('bad',name,E.integer(1),E.integer(2));
// @ts-expect-error Template pages require string expressions.
templatePage('bad','text','v1',E.text('speaker'),E.integer(1));
// @ts-expect-error Raw JSON cannot fabricate factory provenance.
expressionOperand({kind:'i32'});
