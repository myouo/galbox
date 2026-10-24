# ADR-0005：有限候选恢复阶段

状态：采纳并实现，M3-03，2026-10-25。

- RestoreRecipe 的版本、总步数和可用 opcode 从同一 wire Schema 生成；固定有限步骤，不支持控制流循环。
- recipe 只对独立 candidate Core 开放，经生产 dispatcher 执行 value/checked i32、图像、文本清理、音频意图、profile 和被 manifest 允许的同步扩展。不建立第二解释器。
- choice、正文推进、task.join、delay、flush、jump/call/return 均不能被 recipe 当作已完成。扩展只允许 continue，wait/jump 拒绝，不猜真人或设备结果。
- 整份 recipe 原子提交到候选。任一步失败回滚候选的剧情/profile/任务/效果；调用者输入和活动 Core 不变。reducer 内不允许重入执行、分发、捕获或权威回执更新。
- 预演丢弃返回的工作变化，导入计划始终保留 source baseline + recipe；加载时再基于当前 durable profile 建立候选。syntheticLoadCount 的持久恰好一次由后续 M3-04 的 activation 事务兑现。
- 音频只是未执行的意图，候选不接触 Host。既有任务按 restore 策略处理，新 recipe 意图在正式激活时启动；不把虚拟时间或模拟 Host 当媒体已完成。
