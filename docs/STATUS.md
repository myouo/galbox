# galbox-sdk 当前状态

2026-10-27。W1-03A有限验收完成，perf/segmented-storage，基线92d3e18，本轮提交见git log。父任务W1-03仍进行中，程序按需加载/更大容量尚未实现，下一W1-03B；没有外部推送、发布或部署。

A将槽位/历史大载荷拆为IndexedDB冷记录，热目录/目标载荷/摘要/回执同事务提交；读取必要冷记录时检查缺失/大小/Schema，热设置不再被无关损坏槽位阻塞。DB版本2关闭旧连接并拒绝旧版SDK双写，首次写事务迁移旧行，abort保留旧数据。写入输入在异步排队前私有化。旧激活保留superseded/retired ID标记，移除其完整快照；当前head/live entry完整一致，旧ID不能复活。

相同真实Core快照48槽位：设置写入P95 44.7→2.0ms，进度45.6→2.7ms；写入逻辑JSON约180万→7.5–7.8万字符，snapshot SHA及最终状态一致。含探针序列化开销，不是物理磁盘字节或所有玩家延迟。4M逻辑JSON命名空间和1M备份上限保持；热head/profile/回执仍有规模成本。

验证：frozen install/check、227单元/34文件、完整146浏览器（0 skipped/flaky/unexpected）、独立包/native ESM/真实DB2、65 CLI命令、4 synthetic、13入口无删除/两包dry-run、标准性能均通过。原生禁WebGL的移动布局、冷槽位图文/刷新/两皮肤、demand→balanced、当前进度与设置恢复已验；DB/layout=2，1 Canvas/0 pageerror。证据/包SHA/source-manifest见evidence/w1-03a/REPORT。

下一B先写有限模块manifest/函数接口/摘要/稳定地址及快照闭包ADR，建立大Program构造/链接基线，再做真正按执行依赖加载、取消和恢复，不能先下载全部合并冒充懒加载。C继续热记录细分、留存与更大容量，不只提高上限。W1-04持久字节缓存/离线/平台、G7及N/F/M6真实认证仍未完成，缺资料不造假。

运行：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。当前http://127.0.0.1:4173/?demo=interface&loading=balanced，可改loading或renderer=canvas。pnpm build输出静态目录；完整browser前停实际Vite子进程释放4173/4174，consumer/CLI/perf依次执行。完整状态以tasks.json为准。
