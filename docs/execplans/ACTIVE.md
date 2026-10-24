# M3 续建计划

2026-10-25：在 main 初始化 Git 并提交 M0–M2（7d463b3）；当前分支 feat/stateful-operations。

1. M3-01：先实现绑定 schema 的 codec 组合工厂与冻结操作表；扩展 invoke/wait/snapshot，再做原子 reducer、恢复及完整调用迁移。
2. M3-02：codec/source 身份绑定与 fixture-save@1；真实 bytes/摘要/附件负例，prepare 不改持久状态。
3. M3-03/04：有界候选 recipe、独立导入提交/profile 分支、激活幂等与 head 故障；接入 Player/UI、浏览器和打包消费者。
4. 每项通过相关验收后记录证据并提交。沿任务依赖继续可执行工作；N/F 输入不足保持 blocked，不伪称真实兼容。

当前 M3-01 实施中。M0–M2 的基线证据由 7d463b3 固定；受本轮代码更改影响的路径必须重新验收，不能直接复用旧结论。
