# ADR-0006：独立导入 profile 与恢复接管

状态：M3-04 采纳并实现，2026-10-25。重启接续时补齐本阶段支持集记录；已有局部改动仍未计为完成。

- import 事务原子创建新槽位、独立 profile 和幂等回执；不覆盖网页 profile/槽位、不改变 activation head。准备、提交和载入分别报告。
- 槽位 metadata 指向 profile 分支。原导入槽位保存 reconstruction recipe；内部 SDK 快照仅延续 onLoad hook，避免再次强制重建旧场景。默认快速保存隔离导入分支，跨分支覆盖拒绝。
- 最终激活先冻结旧协调器，处理 dirty，再从最新持久 profile 建立初始或 recipe 候选。profile 批次、候选和 head 一次提交；旧 Core 随后失权。
- 语义 activation id 在 pending 恢复中保持。每次接管另有 owner token 和递增 head sequence；claim/confirm/progress 核验 owner，迟到旧 owner 不能复活。已经 activated 的记录须显式新 load，不自动重新消费钩子。
- pending 恢复使用已提交候选，不重跑 recipe。持久提交回包丢失时先核验 head；无法判定时明确 commit-unknown，旧 Core 不恢复写入。import 结果未知可用同一计划/ID 重试，不假装无副作用取消。
- 旧 IndexedDB 行按 main profile 补齐可选 metadata；保留原数据。新增 DTO/validator 同源生成；存储 key 和 profile 绑定执行校验。
- 文件读取和 Web Crypto 留在 Web adapter。默认 React UI 只提交公开 Player 动作，展示来源/等级/独立进度及显式载入；fixture-save@1 始终标合成，未声明 N/F 真实兼容。
