# 0010：已读身份保留分隔符

最终 alpha 一致性审查发现现有 ReadUnit 为 textId@revision，而通用 wire ID 允许 @。例如 (a@b,c) 与 (a,b@c) 同键，会错误继承已读。

当前可执行 Program 的 textId/revision 限定为原有 ASCII ID 支持集去掉 @，由同一 readUnit helper 校验并在真实 linker/Builder/Core 使用。当前 Program 中所有正文都在执行前验证，不等到快进或写 profile 才发现。只收紧当前内容链接，不改 Snapshot/Profile 的 wire Schema：旧数据仍能读取/备份，不因新版拒绝字符而使整库存储无法导出。旧多分隔符键不匹配合法新键；旧内容需要显式映射/重建，不能猜拆分位置。

这是消除歧义的约束修复，不引入新 opcode、Snapshot ABI 或自动 profile 迁移。现有原创样例、内容/SDK 版本与合法 ReadUnit 不变，公开声明签名不变。负例必须经真实 Builder/工厂拒绝，旧 wire 快照仍保留。
