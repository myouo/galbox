# 0014：纯表达式、已求值正文与显式 RNG

G0-02 的有限支持集为现有 bool/i32/string：常量、当前帧/全局槽、带显式缺省的 profile 查询、已读查询、checked 算术、比较/短路逻辑、条件、concat/format/codepoint length/slice 与模板正文。深度至多 16、总节点 512；所有分支在链接时验证，即使运行中短路。没有 JS eval、隐式数值转换、未声明函数或任意对象访问。浮点/集合族在 G0-03，不能提前标支持。

表达式无副作用和随机性。可作为标准 Operand 用于赋值、比较、call/return 等；公共工厂保留值族关联、真实类型负例和运行时来源验证。动态 profile 值必须与声明 kind 相符，只有缺键使用作者明确的 fallback。i32 算术越界/除零拒绝，除法向零截断；字符串转换格式固定，slice 使用 codepoint 非负有效区间，不用 DOM 行号。失败不更改赋值目标、profile、等待或 RNG。

新增 text.template，求值 speaker/content 后保存 TextState 的显示值以及规范化模板签名。恢复验证 textId/revision/PC/模板签名与揭示位置，不用后来改变的 globals/profile 重新生成旧页。普通 text.page ABI 保持，旧 wire 仍可读。模板签名最多 65536 JSON 字符，不是真实性签名。

新增显式 random.i32（闭区间）和 rng.seed，Program.rng 声明初始化，Snapshot.rng 保存 algorithm/state/draws。算法 lcg32@1 精确定义为 `(imul(state,1664525)+1013904223) >>> 0`，种子/状态为完整 u32，范围采样用 2^32 域拒绝取样，最多 128 次；所有消耗先在副本上完成再提交。只面向可复现剧情随机，不声称密码学用途。任何失败包括无效区间、目标/消耗上限都不前进 RNG。扩展 reducer 不获得隐式随机端口。

新游戏只从显式 Program seed 初始化；恢复必须使用保存状态，不能缺失时补 seed 或重抛一次随机。旧档在没有启用 RNG 的旧 Program 仍可读；新 Program 需要 RNG 而旧档没有状态时明确拒绝并保留旧档，转换必须显式迁移。recipe 暂不允许随机/重播正文指令，不能猜恢复中的随机或真人结果。

由正式 SDK Builder 生成原创《灯塔来信·值班簿》验证表达式/随机/两路线/已求值正文和保存恢复，与既有样例共用生产 Core/Player。新增 demo 只选择 Program 数据，不在 React 写剧情。

ProgramBuilder.rng(seed) 显式固定种子；rngFromHost() 则只声明源，初始 RunInput 的 u32 seed 由 CoreOptions.rngSeed 注入，Web Player 使用 crypto.getRandomValues，不能把每次运行的种子混进 immutable Program/manifest。Core 缺主机种子时拒绝，不读时间/随机设备。恢复禁止注入新 seed，只接纳完整 saved state，pending 重试也不重新采熵。

字符串排序使用确定的 UTF-16 ordinal（不调用 localeCompare），length/slice/reveal 为 codepoint；G2 将另行定义字素/排版 profile。draws 自上次显式 seed 起计数，包括拒绝取样消耗。

当前显示的模板额外保存源 at；恢复不仅在 text wait 检查，也在后继 choice/group/end 等切点检查可见正文的来源/签名，仍不重算显示值。
