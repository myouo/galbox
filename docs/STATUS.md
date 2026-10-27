# galbox-sdk 当前状态

2026-10-27。本轮W1-01与H3-02验收完成，本地分支perf/web-responsive-runtime，基线c71537b；本轮提交以git log为准，无推送/外部发布/部署。架构逐项核验见[WEB_READINESS](WEB_READINESS.md)：TS Core+异步Host方向符合Web游玩，当前SDK alpha尚未完成大型作品的全部Web交付能力。

W1-01：私有函数/指令/后继索引、实例MessageChannel任务续跑与timer后备、候选取消、端口懒分配/清理、执行中不积压rAF tick。相同6000指令Node执行P95约193–220→22–42ms；浏览器计算期间timer延迟318–541→1–7ms，timer/rAF均可执行，预算1/8/100快照摘要一致。同步校验/构造/插件仍可能长，未以此承诺零卡顿或所有指标最优。

H3-02：固定61提交/960ms发现SwiftShader等待主要落在context loss，readback只前移成本；关闭MSAA没有稳定总收益，未改生产画质或延迟清理。平台限制见evidence/h3-02/REPORT。标准小说228操作API P95=16.3ms，三次dispose最大67ms，既定门槛通过。

验证：frozen install/check/build、220单元（加强反例另复跑3项）、130浏览器（0 skipped/flaky/unexpected）、独立包/native ESM/长计算/保存恢复、65 CLI命令、4 synthetic、API 13入口无删除（testing.Coordinator新增executing getter）、两包dry-run全部通过。原生--disable-webgl/未替换API、390×844触控模拟完成图文保存/刷新/两皮肤恢复，单Canvas/0 pageerror。证据、包SHA、源码绑定见evidence/w1-01/REPORT及source-manifest。

当前下一W1-02（todo）：先写有限资源支持集ADR和阻塞下载基线，再让Host按启动/当前剧情依赖准备、有限前看、并发/解码/纹理预算与淘汰；旧画面在新资源成功前保持，取消/迟到/读档/跨实例必须验证。随后W1-03模块与存储粒度/留存、W1-04发布缓存/可恢复离线/冷启动拆包和浏览器真机矩阵，最后G7综合。N/F/M6真实资料仍缺，不用fixture代替认证。

运行：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。当前开发页http://127.0.0.1:4173/?demo=interface，可加skin=paper或renderer=canvas；build用pnpm build。全量test:browser前停当前dev，释放4173/4174；consumer/CLI/perf分别执行，避免共享构建/设备竞争。任务表是完整状态唯一来源。
