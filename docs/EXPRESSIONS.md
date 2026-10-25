# 类型化表达式、插值与 RNG（G0-02）

当前支持 bool/i32/string，浮点/集合值在 G0-03，未启用。所有功能走正式 protocol→Builder/linker→Core→Snapshot→Player；没有 JS eval。公开入口位于 `galbox-sdk/port-kit`，低层 wire 类型在 protocol。

```ts
import {expr as E,variable,assignExpression,templatePage,randomI32} from 'galbox-sdk/port-kit';
const count = variable('count','i32');
// 需要在 Builder 中声明 count 的 global 或当前帧 slot。
const calculation = assignExpression('calculate',count,
  E.binary('add',E.variable(count),E.integer(1)));
const page = templatePage('greeting','greeting','zh-1',E.text('澪'),
  E.template`今晚是第${E.variable(count)}次值班。`);
const draw = randomI32('draw',count,E.integer(1),E.integer(100));
// 使用 draw 前 builder.rng(seed) 或 builder.rngFromHost()。
```

表达式实际工厂：value/integer/flag/text、variable、profile(kind,key,fallback)、wasRead、binary、unary、equal、compare、logic/not、choose、concat/format/template、length/slice/stringTest。`expressionWire`/`expressionOperand` 导出隔离的 wire 副本；不能用普通对象冒充 TypedExpression。assignExpression、branchExpression、templatePage、randomI32 保留输入/目标类型关联，类型负例使用这些真实工厂验证。

支持的算术为 add/sub/mul/div/mod/min/max、neg/abs；全部 checked i32，除零和 INT_MIN/-1 等溢出拒绝，除法向零截断，余数沿 dividend 符号。不能隐式把字符串/布尔变数字。format 输出固定十进制或 true/false，作者需要本地化标签时用 choose。比较要求同值族，bool 只有 eq/ne；字符串排序为 UTF-16 ordinal，不调用 localeCompare。

逻辑 and/or 与 choose 运行时短路，链接仍遍历全部分支，检查引用/类型。profile 查询缺键才使用显式 fallback，已有键类型不符则报错。普通 slot 只读取当前帧 locals/params 与 globals，不穿越其他调用帧。只查询已读不会写 profile。

字符串 length/slice 使用 codepoint（A😀B 长度 3），slice 区间需 0<=start<=end<=length，不自动裁剪；结果不超过既有 string 的 4096 codepoints，模板 speaker/content 不能为空。AST 深度<=16、总节点<=512、concat parts<=64，模板签名 JSON<=65536 字符，另有通用 wire 输入大小/深度限制。G2 将另行定义字素/排版/富文本 profile，当前不冒充支持。

模板正文是新 opcode text.template：在执行时一次求值并把显示值、源地址与模板签名写入 TextState。恢复验证 textId/revision/PC/source/signature/revealed；即使当前等在后面的 choice/group/end，仍检查显示中的模板来源，不用后来变化的变量重新生成旧页。旧 text.page 保持原 ABI；内容/模板变化没有显式迁移时拒绝旧档，不能只比较 anchor。签名是规范 JSON 身份，不是防篡改签名。

RNG 精确定义为 lcg32@1，下一字为 `(imul(state,1664525)+1013904223)>>>0`，u32 全范围种子/状态。random.i32 是 i32 闭区间，范围映射用拒绝取样，draws 记录包括拒绝样本的全部消耗，自上次 rng.seed 起计；单指令最多 128 次。运算先在状态副本上进行，失败不更改权威 RNG 或赋值目标。不是密码学随机，也不隐式出现在表达式或 reducer 中。

`builder.rng(seed)` 为作者明确固定的可重现配置；`builder.rngFromHost()` 只声明来源，不把每局种子混入不可变 Program/发布清单。Headless 新运行须传 `createCore(program,profile,undefined,{rngSeed:u32})`，Web Player 用 crypto.getRandomValues 采一次运行输入；Core 自身不读随机设备/时间。恢复只用 saved algorithm/state/draws，禁止传 rngSeed 或缺状态时补种子。pending 激活恢复、加载旧槽位都不再采熵。显式 rng.seed 指令可重置序列。

Snapshot.rng 是可选 wire 扩展：没有启用 RNG 的旧 Program/快照照常读取；新 Program 已声明 RNG 却缺完整旧状态时 RESTORE_RNG，原槽位保留，须显式迁移。recipe 本阶段拒绝 random.i32/rng.seed/text.template，不猜恢复随机或人类结果；现有纯赋值表达式仍可用于候选重建并遵守回滚。

原创浏览器章节：`pnpm dev` 后打开 `http://127.0.0.1:4173/?demo=expressions`。Program/清单来自 fixtures/expression-novel 的公开 SDK Builder，复用《灯塔来信》原创素材；固定 seed=12345 的首个值班号为 69，读档前后保持。主样例仍在默认 URL，React 仅选择 Program 数据与订阅 Player。

G0-03 已增加i64/f64/null/list/dict、规范化和有界数据算子，详见 [DATA_VALUES](DATA_VALUES.md)。本页基础运算保留原语义；新族需要values.extended，不以JS隐式转换猜类型。stored void/undefined、引用heap和未启用算子仍拒绝。
