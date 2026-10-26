# G4-01 图文存档、合成缩略图与槽位管理

2026-10-26，基线6c40d86，分支feat/illustrated-save-system。本轮有限支持集验收通过；源码由source-manifest.json与随后本地提交关联。命令日志中的revision为运行时HEAD，改动当时尚未提交，不表示基线自身已含本轮实现。

## 可观察的生产行为

正式Player.saveGame默认要求同切点Snapshot+舞台/DOM正文PNG+元数据。Core授权，capture与激活共用串行freeze屏障，同步复制重绘的舞台和计算样式/滚动/字体/揭示/效果/Ruby/ADV-NVL窗口后栅格化，再thaw；存储延迟期间允许继续剧情。不能给旧Snapshot配后来画面。自定义TextRenderer可转发默认capture；缺端口默认拒绝，显式image:none才无图。旧save接口和旧无图槽可用。

320×180 PNG最多256 KiB。SlotMetadata.capture含唯一提交ID/实例捕获序号/逻辑时间/墙钟/正文摘要与可选图，摘要/逻辑时间必须绑定Snapshot；Snapshot不含图片/设备/偏好。当前/上一快照和相应图/元数据同事务，重命名/删除有expectedRevision，上一修订单独加载，当前profile/偏好继续权威。原始caption可比可观察正文长，实际图片严格保留已揭示位置，不先显完再截图。

SDK提供默认12手动槽（1–24）、3循环自动槽（1–8）、profile隔离快速槽和默认管理UI。自动默认off，on-prompt有限稳定text/choice切点，最多一项自动工作在途，落后提示舍弃并继续最新切点；tick/reveal不另存，普通/带recipe读档均不立即覆盖。SaveLibrary命名、新建、覆盖/删除确认、重命名、上一修订和刷新真实调用Player。实例只给策略/内容/主题，React不操作PC。

生产IndexedDB与MemoryStore均使用正式durable事务候选。规范payload用固定@noble/hashes2.4.0 SHA-256绑定固定大小回执，回执不复制整个PNG/快照；原生Node/浏览器同算法与Node crypto对照。commitSave/saveReceipt为可选中立端口，缺少新端口明确unsupported。回复丢失先读回执，已提交返回committed/reconciled；无法读取抛带ID的SAVE_COMMIT_UNKNOWN，当前实例保留原payload用retrySave，刷新后inspectSave可查询历史回执。不能把失败或未知说成已保存，dispose也不撤回已经完成的事务。普通进度先按原机制flush，捕获profileBasis不重标或回写旧profile，保存不改变activation head。

## 实际命令与结果

以下均export TMPDIR=/dev/shm，未执行外部发布、推送、部署或远程CI。

| 命令 | 结果 / 证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install/generate/fixture.log，固定依赖与全部原创数据/manifest生成通过 |
| pnpm check | check.log；生成一致、strict、无DOM/Node headless与导入边界、公共真实保存parser/工厂正反类型通过 |
| pnpm test | unit.log，25文件/177项通过，新增6项正式存储/回执/修订/摘要/备份/失败反例 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g4-01 pnpm test:browser | browser.log/browser-results.json，92项，0 skip/flaky/unexpected；包含原有84项和8项新保存行为 |
| 同evidence环境 pnpm test:consumer | consumer.log/consumer-result.json，仓库外tarball隔离安装、skipLibCheck=false/strict/native ESM，真实图文/上一图文备份/命名/重新打开/分支quick/删除通过 |
| pnpm test:cli | cli.log/result.json/commands.json，65真实命令与旧模板/资源/实际HTTP/dev/浏览器保存恢复通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json，4 synthetic通过，N/F needs-input未伪造 |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json，既定Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=6c40d86 pnpm test:release | release.log/release-audit.json，strict声明/原生exports、28新增/13声明变化（按入口计）、0删除、两包pack/publish dry-run通过，actualPublish=false |
| pnpm dev；node docs/evidence/g4-01/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-save-library.png/dev-thumbnail.png；原生--disable-webgl，0 pageerror、单Canvas、图文/自动槽/跨刷新旧档保进度通过 |

慢存储实际证据same-cut.json：后续到opening.2且canSave=false，持久Snapshot/正文摘要仍是opening.1，PNG与捕获图完全相同，旧合法切点仍可提交。Canvas实际stage像素对照：上部0个变化，正文区17464个明显变化；避免在异步清空后的WebGL buffer上作假对照。WebGL/Canvas两种实际PNG含Ruby与NVL/内嵌原创字体，分别save-text-*.png/save-layout-*.png，并已实际查看；不是只检查DOM标签或只看Pixi图。

真实IDBObjectStore.put注入QuotaExceededError使整个事务abort，当前/上一图片与快照不变、新回执不存在，再保存修订2成功；不是固定成功store。其它新浏览器反例：捕获错误、缺capture、自定义显式无图、Core禁存、abort及时清canvas、丢回执unknown后原ID幂等重试，以及事务已提交后dispose仍返回committed:true/disposed:true。自动槽循环、普通/recipe恢复不覆盖、主/备份profile quick隔离有实际断言；默认UI覆盖/删除须确认。

开发实测原生WebGL=false/Canvas=true，读取旧手动档后仍保留3条已读，自动槽修订{"auto:1": 2, "auto:2": 1, "auto:3": 1}不变，返回book:welcome，PNG跨刷新不变；媒体/字体/图像走正式SDK，不猴补context API。

## 构建身份、性能与支持限制

SDK0.1.0 SHA256=1ca632cd34d18f28d57a85acc4f4f3e5a41804b87c28eb8771f731249d89dacc。
CLI0.1.0 SHA256=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。
实际artifacts、consumer、CLI和release-audit一致；本地UNLICENSED alpha。Snapshot版本仍1，没有改变opcode/phase/wait ABI。元数据/备份可带新可选字段，旧槽无图可读；不承诺旧二进制前向读新字段或稳定API。

既有标准小说WebGL回归：语义API P95 4.40ms，两帧观察P95 49.80ms，最重Core批次P95 1.521ms，三次活动销毁 88.7, 154.5, 109.1ms（门槛500ms）。不是大存档图库/缩略图吞吐/全平台/Canvas性能/真实RAM或VRAM认证。

截图只包含舞台/正文，不含菜单/诊断/选项控件等默认UI。默认SVG foreignObject捕获不是任意网页截图；外部图片/CSS/伪元素与宿主自定义效果不在此契约，CSP/解码/布局尺寸不满足则拒绝。SVG最多4 MB，命名空间4 MB JSON、备份原1 MB限额继续，超限不能截断图或删旧档。Schema/PNG头/尺寸/编码上限不代替任意不可信PNG完整解码认证；新图由浏览器真实编码。媒体当前设备采样帧不改变replay/stop/forbid或承诺精确采样点恢复。尚无云存档/图片编辑/无限槽或任意规模认证。

## 失败保留与修复

check-first等记录初期字段/类型导入/headless crypto/TextEncoder约束失败，修为唯一纯摘要入口，不放宽strict。unit-first保留maxLength令Ajv standalone原生ESM意外含CommonJS helper的失败，改用有界Schema正则，原生导入检查未删。新依赖固定锁版本，边界只准两个特定纯摘要导入。

browser-second/third保留脚手架错误：备份namespace、关闭菜单details重建、误取备份复制quick、遗漏start；生产拒绝未降低。browser-regression是首个完整回归90过2失败：新quick缺少独立导入标签已恢复原断言；禁存测试不再调用不合法capture，改读合法只读view证明后续禁存。还加入recipe load的slot身份守卫，最终完整92/后续所有门槛重跑通过。最早PNG差异对照误用异步清空的GL buffer，已换真实Canvas参考并断言非正文上部不变。其它*-first/second/third/fourth与早期JSON是过程证据，不能替代最终文件。

## 下一步与运行

任务G4-01 done；下一G4-02历史语音回放/受控回溯：先定义有界可恢复历史切点与语音身份、回放不改PC/已读，回溯用新activation并以当前持久profile为权威，再Core/runtime/默认UI与故障/刷新/独立consumer验证。不能从文本历史猜剧情快照，也不能回写旧普通进度。G4后续/G5–G7/N/F/M6未完成；真实两作缺edition/Program/资源/原档/原作继续参照，独立blocked。

当前dev已启动 http://127.0.0.1:4173/?demo=layout&autoSave=1 。重启：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。可加&renderer=canvas。构建pnpm build。完整browser前停dev释放4173/4174。
