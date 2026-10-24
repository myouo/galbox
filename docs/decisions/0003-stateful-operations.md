# ADR-0003：有状态同步操作与调用迁移

状态：采纳并实现，2026-10-25；M3-01。

- wire Schema 增加有限 JSON、extension.invoke、SavedInvocation、operation wait/resume、受控 set/profile.set actions 和既有 audio intents。旧 M2 Snapshot 的可选 invocations 按空集合读取。
- ProtocolCodec 由受审查的组合工厂产生：i32 范围整数、string、bool、literal、精确 object、有限 array/tuple/union。类型从子 codec 推导，工厂同时构建校验与规范 schema 身份，不允许独立泛型与任意 JSON Schema 各说各话；完整 schema signature 用于身份比较，不冒充加密摘要。
- Core 前冻结操作表；每个 ID/version 唯一。每次调用有独立 id/args/state/phase/wait/帧归属；initialize 与首次 reduce 在同一个候选事务中运行，恢复不初始化。
- reducer 输入和 context 为隔离、冻结的视图；输出整体校验后取得独立所有权。变量/profile/任务与效果均在候选提交，任何 reducer/输出/actions/flow 错误保留调用前的权威状态。
- 单剧情流的扩展可 continue、登记目标 jump 或手动 signal wait。resume 必须匹配 invocation/request/attempt/schema/kind；恢复重建 attempt，旧结果无效。不在首个扩展版本中伪造设备结果或开放任意宿主代码效果。
- manifest 明确保存、恢复与 recipe 资格；未支持切点拒绝。源码是受信任 TS，工厂/冻结不被称作同 realm 安全沙箱。
- state-only 迁移只允许 args 和 resume 身份/签名相同；改变 ABI 必须由正式的完整调用迁移工厂转换 args/state/phase/wait，并重新链接帧/地址/请求关系。缺迁移时拒绝，保留原存档。
