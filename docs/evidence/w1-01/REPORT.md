# W1-01 Web异步架构核验与执行优化

2026-10-27，基线c71537b，分支perf/web-responsive-runtime。原计划逐项核验见[WEB_READINESS](../../WEB_READINESS.md)，有限规则见ADR0032。本轮W1-01的有限实现与验收完成；任务状态以tasks.json为准。

## 生产变化

Core仅为链接后的私有Program建立函数、指令和后继索引，消除每条执行的线性搜索；外部可变输入仍先校验/私有化，快照地址、帧、call/return和恢复不变。索引需要O(指令数)引用表空间，构造阶段仍有成本。没有截断剧情或历史、放宽JSON预算、替换权威实现。

Player用实例BrowserScheduler承接运行与启动候选的预算续跑，MessageChannel真正进入浏览器任务队列，缺失时timer后备。端口首次调度才创建，dispose取消候选Promise、待执行回调和设备。候选每片检查generation/dispose，未提交取消不修改持久head。Coordinator仍保有同一current轮次，预算不能保存，晚到输入仍只排队消费。Player执行中不额外积压rAF tick；活动时间由下一次受理结算，自动模式不会把前一长轮的多个tick当成新页的预付阅读延迟。

## 可复现比较

`before/web-runtime.json`生产代码为基线c71537b；最终`after/web-runtime.json`为本轮源码。driver SHA、Node/浏览器版本、工作规模、预算、最终snapshot摘要均核对。Node每配置1次warmup+6次记录（有限样本P95等于样本最大值）；浏览器每类型3次、原生--disable-webgl，无context API替换，生产Canvas/Core/Player/MemoryStore。timer/rAF锚定第一个真实yield，必须在Core仍计算期间触发；不能计入计算结束后的I/O让出。

首次改动结果保留；最后调度端口改为懒分配后重跑最终after。原始日志的revision是执行时HEAD（基线），不表示基线提交包含本轮优化，最终源码由source-manifest/本地提交绑定。构造、createPlayer准备、执行、单片耗时分别保存，不只报告最快一段。


最终测量如下（Node单位ms；各预算独立比较）：

| 指令数 | 每片预算 | 优化前执行P95 | 优化后执行P95 |
| --- | --- | ---: | ---: |
| 1000 | 1 | 18.55 | 7.91 |
| 1000 | 8 | 14.01 | 5.04 |
| 1000 | 100 | 8.55 | 3.78 |
| 6000 | 1 | 220.10 | 41.58 |
| 6000 | 8 | 192.79 | 23.48 |
| 6000 | 100 | 214.38 | 21.58 |

浏览器6次（启动/运行各3次）的计时器延迟318.2–540.5ms→0.9–6.9ms；前版timer/rAF在计算期间均未执行，最终版均执行。运行阶段3次约313–357ms→21–35ms，启动执行阶段约410–573ms→140–184ms。启动执行含候选/激活等开销，不能当作纯Core片耗时，也不能忽略createPlayer准备。raw中的maxSliceMs和preparationMs单列；最早after-first结果同样保留，不能挑最快样本替代整体分布。

同步解析/链接/验证、任意同步受信任插件、显式完整capture和持久命名空间仍可能产生长任务。局部执行提速不能保证首屏瞬时完成；未测大作品/实体移动设备/所有GPU，也不承诺绝对“极致”。

## 架构结论与下一步

同步TS Core+异步Host的方向符合最终Web游玩目标；I/O、版本化HTTP流、媒体回调、取消与IndexedDB原子保存已有生产路径。这次补上真正的主线程合作式调度。完整大作品方案仍缺按需资源/有限预取与缓存（W1-02）、Program模块与存储粒度/留存（W1-03）、发布缓存/离线恢复/冷启动与目标平台矩阵（W1-04）。G7依赖这些工作，M0–M2既有完成不扩大为全部计划完成。N/F/M6仍缺真实作品资料，没有以fixture替代认证。

图形尾延迟固定工作负载结论另见[H3-02](../h3-02/REPORT.md)，未采用提前等待/延后清理或降画质实验。本轮没有外部推送、发布或部署。

## 已执行的门槛

- `pnpm install --frozen-lockfile`、`pnpm check`：锁定依赖、生成一致性、严格TS/headless编译与设备导入边界通过。
- `pnpm test`：32文件、220项通过。随后加强索引所有权反例（修改最后一条真正决定结果的外部指令）并单独复跑该文件3项通过，见unit-index-final.log。
- `GALBOX_EVIDENCE_DIR=docs/evidence/w1-01 pnpm test:browser`：完整130项通过，0 skipped/flaky/unexpected，build和harness一起重建。新增6项覆盖长轮响应/保存拒绝/旧输入、启动取消/替换、后备与隔离、自动延迟、失败构造端口；原媒体/互动/图文/刷新/皮肤/两后端仍通过。
- `pnpm test:consumer`（相同evidence变量）：仓库外安装tarball、严格声明编译、native ESM和实际浏览器通过；6000指令预算一致、3000指令任务响应/保存拒绝/最终保存恢复均由公共API验证。浏览器与HTTP服务器清理完成，exit0，不借workspace源码。
- `GALBOX_EVIDENCE_DIR=docs/evidence/w1-01/after node scripts/profile-web-runtime.mjs`及`pnpm test:web-performance`：使用全量browser已构建的生产harness，最终对照通过。初始错误日志/早期结果保留；check-second的可选字段访问错误已修正并通过后续check。
- `GALBOX_EVIDENCE_DIR=docs/evidence/w1-01/performance GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance`：标准小说3活动周期/228输入，API P95=16.3ms，两帧P95=44.2ms，dispose最大67ms；原Core/API/500ms活动释放门槛通过，拥有设备归零。API与前轮15.9ms相近，不把噪声范围内变化宣称为普遍提速；整页GC后heap包括模块/缓存，不宣称全部内存回到初始值。

以上所有命令使用TMPDIR=/dev/shm；标准性能与固定61帧图形压力负载分别解释，不混用门槛。CLI/兼容/API与原生dev结果如下。

- CLI：65真实命令、仓库外模板/扩展/迁移/导入、实际HTTP/流、浏览器保存恢复通过（cli.log/result.json/commands.json）。
- compatibility：4 synthetic通过；N/F仍needs-input，缺edition、可用Program/资源、真实原档及原作继续参照。
- release：基线c71537b，13公开入口/0删除；唯一公开声明变化为testing.Coordinator的只读executing getter，Snapshot/wire版本未改。严格声明/native ESM及两包pack/publish dry-run成功，actualPublish=false。
- dev：实际pnpm dev，原生--disable-webgl而非替换API，390×844触控模拟。图文表单存档、刷新、profile与设置、两皮肤读取、单Canvas和0 pageerror全部通过（dev-probe.mjs/log/json及PNG）。这不认证实体手机或Safari/Firefox。

SDK 0.1.0 SHA256=`247f81d49a63ba4404aab7cc308759c7c4a25fa58a38b6b6289f311e850322b2`；CLI 0.1.0 SHA256=`1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da`。consumer/CLI/release与artifacts实际字节一致，仍为本地UNLICENSED alpha。

运行：`export TMPDIR=/dev/shm`；`pnpm install --frozen-lockfile`；`pnpm dev`，访问`http://127.0.0.1:4173/?demo=interface`。当前dev保留运行，复跑完整browser前须停止4173服务。`pnpm build`产出静态目录。对照脚本必须先用基线生产代码生成before，再用候选生成after；不能同版本冒充前后优化。

原player.spec中固定路径截图本轮移至此目录playable.png，旧公共证据恢复基线字节。早期check错误与初始profile均保留；最终代码由source-manifest.json绑定，不能把历史验证无条件套到后续W1-02变更。
