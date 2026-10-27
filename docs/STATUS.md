# galbox-sdk 当前状态

2026-10-27。W1-02有限支持集及收尾CG固定引用修复验收完成，feat/loading-strategies，基线fe86769，本轮本地提交以git log为准；无推送/发布/部署。四种设计及限制见LOADING，原计划目标核验见WEB_READINESS。下一任务W1-03。

已实现：eager（默认串行兼容）、demand、balanced、chapter；其余默认并发3、可选1–8；非eager需正式release。按切点准备、固定当前/候选/预览引用、驻留估算/LRU、取消/迟到、批次首错停止。资源等待保持旧图文、拒绝保存/flush，失败重试同一轮，隔离准备器效果DTO；候选资源准备先于head提交。默认经典/皮肤/回放UI提供加载重试且清理旧错误，策略不写入剧情快照，可换策略读旧档。

最终受控18图/60ms延迟/150ms阅读/显式并发3：旧创建约1.2s，新demand/balanced约22–23ms、2/18请求；demand推进仍约68–75ms，balanced约4–11ms，chapter把约97ms集中到start。SDK已加载后计时，单次观测非P95；纹理估算不等于浏览器总内存。原目录预算/字体等启动常驻保持，不把局部支持扩大为大作完成。

验证：最终check/生成/headless/边界、225单元；完整逻辑/设备141浏览器通过，随后UI收尾28专项、最后CG固定引用21专项通过（当前143用例，未声称最后版本又全跑143）。独立tarball/native ESM/四模式、65 CLI、4 synthetic、13入口API无删除/两包dry-run、标准3周期性能通过。原生禁WebGL的390×844触控模拟已断言demand→balanced真实模式，图文表单、刷新/两皮肤、设置/当前profile恢复，1 Canvas/0 pageerror。所有日志/失败修复/源码和包SHA见evidence/w1-02/REPORT。

下一W1-03：先定义Program模块身份/稳定地址/跨模块闭包与延迟加载屏障，再评估IndexedDB整份命名空间/4M JSON字符预算、回执/激活留存与记录粒度；不得只提高上限，保留head/回执原子性、迁移和备份闭包。W1-04继续持久字节缓存、先下载再按需解码、离线安装、发布缓存/冷启动/目标设备。G7及N/F/M6真实作品认证仍未完成，资料不足不造假。

运行：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。当前http://127.0.0.1:4173/?demo=interface&loading=balanced，可改loading=demand/eager/chapter或renderer=canvas；pnpm build输出静态目录。完整test:browser前停止当前dev释放4173/4174；consumer/CLI/perf依次运行。完整状态仅以tasks.json为准。
