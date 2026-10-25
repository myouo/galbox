# 0011：持久进度提交验证组合结果

最后约束反例覆盖到“每条增量合法，但组合后的 profile 超过已有 Schema 上限”。不能只验证 ProgressBatch；否则已读超过 20000 项或修订溢出会把不可读取的 profile 提交到数据库。

在候选 state 上应用批次、增加修订后，使用现有 parseProfile 验证完整结果，再写回执/返回提交结果。MemoryStore 只在 reducer 成功后安装候选，IndexedDB 只在成功回调后 put；失败保留旧 profile、head、槽位且不提交回执。不改 wire Schema 或支持限额，也不删除旧进度来腾出空间。

反例使用真实 MemoryStore/导入/激活，把 profile 填到现有限额，再提交同时 set 和新增 read 的合法批次。应整体拒绝；随后合法重试证明没有残留半批次或回执。真实 IndexedDB 的事务 abort/未知回包与所有权另由浏览器套件回归。
