# 数值、集合与数据表达式（G0-03）

同一生产Core支持bool/i32/string，以及i64/f64/null/list/dict。外部unknown先走同源Schema及规范化，所有原生值取得独立所有权；不把源值退化为任意JS对象或隐式Number。

```ts
import {i64,f64,f64Bits,f64Number,nullValue,list,dict} from 'galbox-sdk/protocol';
import {expr as E,variable,assignExpression,assignProfile} from 'galbox-sdk/port-kit';
const credit=variable('credit','f64'),inventory=variable('inventory','list');
builder.global({...credit,initial:f64(12.5)});
builder.global({...inventory,initial:list([])});
assignExpression('buy',credit,E.f64Binary('sub',E.variable(credit),E.real(2.25)));
assignExpression('add',inventory,E.listPush(E.variable(inventory),E.text('回信')));
assignProfile('persist','supplies',E.dict([{key:'credit',value:E.variable(credit)}]));
```

Value wire都为{kind,value}。i64.value是规范十进制文本，范围-9223372036854775808..9223372036854775807；无加号、前导零或-0。i64(bigint|string)使用checked范围，不能先用不精确的Number构造大整数。f64.value是大端16位hex：正零0000000000000000、负零8000000000000000、正无穷7ff0000000000000、NaN固定7ff8000000000000。输入hex可大写或非规范NaN，所有原生入口转为小写/固定quiet NaN；f64(number)先编码再过JSON边界，f64Bits读位模式，f64Number返回平台数值。不能直接把JS NaN/Infinity/BigInt当JSON写入存档。

nullValue()明确{kind:'null',value:null}，与缺键/无返回不同。stored void/undefined、heap/ref/循环与源对象引用身份未启用；函数returns='void'继续表示没有返回值。旧bool/i32/string和checked i32语义保留。

数值算子：E.i64Binary/E.f64Binary的add/sub/mul/div/mod/min/max；i64Unary neg/abs；f64Unary neg/abs/floor/ceil/trunc。i64溢出和除零拒绝，不回绕；负数除法向零，余数同被除数符号。f64使用ECMAScript基本IEEE运算，除零/溢出产生相应Infinity或NaN；mod是截断商的ECMAScript余数，min/max遇NaN传播并规范化。暂不开放超越函数或依赖环境的随机数。

E.toI64接受i32/f64，E.toI32接受i64/f64，必须有限整数且在目标范围，不隐式截断（需要时先显式f64Unary('trunc',...)）。E.toF64接受i32/i64，i32精确，i64允许显式舍入。E.equal严格区分kind；容器递归比较，字典顺序有意义。f64 ±0相等、NaN不等于任何值，lt/le/gt/ge遇NaN全false。E.compare仅i32/i64/f64/string。format/template只接标量，保留-0文字和规范十进制i64，使用非locale格式；集合须明确选项/键，不会变成[object Object]。

list(value[])和dict([{key,value}])是值语义，接受只读输入并复制。列表最多256项、字典最多64项、单值树最多8层/1024节点。字典按插入顺序保存，键1..128 UTF-16单元且非NUL，允许__proto__等普通字符串而不使用原型表；重复键拒绝。列表/字典可以异构嵌套，null不等于缺键。

表达式：E.list/E.dict，listAt(kind,list,index)、dictGet(kind,dict,key)、dictHas、listSet/listPush/listSlice/listConcat/listLength、dictSet/dictRemove/dictKeys/dictSize。get/at必须声明预期返回kind；缺键、越界或存在但错kind会拒绝，不用fallback掩盖。用dictHas配合E.choose显式处理缺键。dictSet覆盖原键保序、新键追加；remove缺失合法键返回同内容新值。查询键也验证键范围。所有更新返回新值，不改变源集合。

表达式仍是有界纯AST，所有分支完整链接，and/or/choose只在运行时短路；512节点/16层、字符串和集合规模限制继续。未知变量/kind、非法字面量即使在未选分支也拒绝；未执行分支的运行时故障不被提前猜执行。Builder自动声明values.extended和expressions；可信扩展需声明时可builder.capability('values.extended')。原生profile写入新族也检查能力。

规范化只遍历明确native字段：Program/表达式/字面量、全局/帧、profile、原生actions、批次、recipe和备份/槽位闭包；插件args/state的任意JSON保留其codec语义，不因形似Value被改写。候选/扩展/赋值失败不提交半个值；profile/进度批次深复制/深冻结，失败重试保持相同payload。

SDK validator采用strict=true、失败分支短路错误聚合；不放宽Schema或语义链接。这样递归多族AST不会在kind已不匹配的错误分支指数级重复遍历。旧的生成一致/原生ESM/地址诊断及深层负例继续执行。

Snapshot wire version仍1，新族由能力/Schema限定。旧槽位在新Program类型不匹配时拒绝，不能把i32暗转为f64。跨release用defineContentMigration明确转换所有profile、当前/上一修订、帧和相关内容；来源和修订闭包仍验证，原档不改写。operation args/phase/wait ABI改变必须defineInvocationMigration，单独state迁移不够。未启用的源语义不自动获取兼容结论。

原创《灯塔来信·补给簿》在/?demo=data，Builder输入fixtures/data-novel/build.ts；实际余额12.5→10.25，货号9007199254740993→9007199254740994，物资列表/有序账本和当前profile跨保存/刷新保留。G3舞台参数表达式后续复用数据基础，本任务不代表演出/媒体/流程图/图文存档已齐备。
