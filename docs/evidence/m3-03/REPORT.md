# M3-03 验收

2026-10-25；cwd `/home/myo/Desktop/galbox-sdk`；基线 1ef8913。源码摘要在 source-manifest.json。

实现：有限 RestoreRecipe、候选角色、生产 Core dispatcher 的恢复执行、checked profile 增量、完整候选回滚和受检扩展资格。fixture-save@1 的准备计划携带 baseline + recipe；预演 syntheticLoadCount 得 5，但 materialize 后的基线仍为 4，不消费实际加载钩子。

实际命令（TMPDIR=/dev/shm、GALBOX_EVIDENCE_DIR=docs/evidence/m3-03）：

- pnpm check：退出 0；Schema/OperationSpec/recipe opcode 生成、真实工厂类型负例、主包/应用与纯 headless 边界均通过。
- pnpm test（JSON reporter）：7 文件、45 测试通过；包含新恢复阶段和 reducer 重入拒绝。
- pnpm test:compatibility：4 个 synthetic 分项通过，N/F 仍 needs-input。
- pnpm test:browser：实际构建与 14 个真实 Chromium 测试通过，包含 Web Crypto + recipe 候选预演 4→5 与基线不变。
- pnpm test:consumer：严格声明检查、独立来源工厂/完整调用迁移、候选 recipe、实际 Player 保存恢复通过。

覆盖 T21/T24：choice/task.join/delay/控制流循环不被猜成成功；超预算拒绝；未授权或产生 wait/jump 的扩展拒绝；后续坏资源导致先前 profile action 一并回滚；只对候选开放，不改活动状态；可在 ended 基线上执行而不制造下一 PC。纯扩展仍走同一生产分派，已完成且无引用的临时调用不遗留伪恢复地址。

M3-01 的输入/输出隔离、原子失败和迁移回归仍通过。所有设备效果保持意图，准备不启动 Host。reducer 中重入执行/分发/捕获/权威更新会失败，约束不被称为安全沙箱。

实施中真实工厂的 broad Instruction 返回类型不能作为合法 RecipeStep 使用，改为 opcode 关联的精确返回；没有强制断言或放宽恢复允许集。新增 candidate 模式只影响恢复入口，旧 Core/Player 回归已重跑。

同机 Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Chromium 156.0.8078.4，软件 WebGL。日志/JSON 同目录。实际持久导入、独立 profile、每次 load 的事务恰好一次与崩溃接管仍属于 M3-04；本报告不将候选预演计为已持久激活。
