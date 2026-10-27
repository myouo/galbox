# galbox-sdk 当前状态

2026-10-27。用户最新要求优先性能。H3-01运行时/历史优化已验收，下一H3-02图形提交与释放尾延迟；G7综合验收仍未完成。唯一任务状态见tasks.json。本轮分支perf/runtime-history、基线ce29850，源码/证据随本地提交保存，无外部推送/发布/部署。

ADR0031/PERFORMANCE：Core.view深冻结并按变更失效，封存历史共享但仍精确计入原字符/节点/深度预算；capture/恢复保持完整校验和独立DTO。默认DOM与脚本UI不再重复复制整个历史，用户自定义renderer仍隔离。历史父Schema只私有化一次，子语义/authority/修订/回执/原子存储不变；索引/容量与完全相同CSS声明去重减少重复工作。

同场景：10000历史Node空闲tick P95 92.06→0.084ms；1000历史/IndexedDB/回溯推进111.2→47.9ms，flush232.1→62.0ms。Node trace与12组PNG逐字节一致。无采样标准小说API P95 22.3→17.3/15.9ms（两次after均保留）。217单元、124完整浏览器、strict独立消费、65 CLI、4 synthetic、性能/API/原生无WebGL移动dev通过。证据 [H3-01报告](evidence/h3-01/REPORT.md) 与source-manifest。

未隐藏的差异：WebGL dispose基线16–25ms，after样本56–115ms更高，仍在500ms门槛内；诊断主耗时是原生loseContext，但尚不能据此证明因果。H3-02需固定剧情/帧提交计数，分离gl.finish/上下文释放/SDK清理并比较Canvas；不能延后清理或只移出计时区伪装优化。

SDK SHA256 6346048d1b126ad743f0f5c6c750af0873661db793b0c9580de57f101ad13c17；CLI 1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da；仍本地0.1.0 alpha。公开声明零变化，view的运行时只读冻结已明确，capture仍可作独立迁移草稿。

开发服务运行：http://127.0.0.1:4173/?demo=interface，可加skin=paper或renderer=canvas。重启TMPDIR=/dev/shm pnpm dev；构建pnpm build。profile:runtime与test:performance:comparison复跑说明见PERFORMANCE。全量browser前停dev释放4173/4174。

后续先H3-02，再G7综合/规模和剩余性能归因。较大IndexedDB命名空间事务、显式全量捕获仍随数据量增长；不承诺无限历史/60FPS/全设备。真实N/F/M6仍缺edition/Program/资源/原档附件/原作继续对照。
