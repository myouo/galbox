# G1-02：通用播放模式、输入和显示辅助

2026-10-25，分支 feat/playback-modes-input，基线 935f8e8。G1-02 的有限支持集完成；当前下一项 G2-01。正式 TypeScript Core/coordinator/Web Host/DOM/React/IndexedDB 路径，未增加作品特判或另一套解释器。

Auto 在正文完全揭示、当前 voice 自然结束及 active-time delay 后才发普通 advance；已读快进发普通 step，默认停在未读，显式许可才跨未读，不替玩家选项或跳真实等待。每 tick 最多一动作，预算续跑不重发。选项/结束在同次稳定结果停止模式；暂停/后台/失焦不补墙钟。手动输入取消模式，load/新 epoch/pending 接管重新 manual。

Web Audio 启动 ack 与自然 onended 分开；epoch/task/attempt 匹配，停止/替换/迟到/重复/loop 不能提前释放门控。恢复 replay 新建媒体请求并等新 onended，stop 无播放源，不假定旧播放位置。Snapshot 音频 completed 含义未变，模式/设备完成不进剧情快照。

设置 v2 新增 playback/input/display。完整 v1 读取/导入保留 audio/text/revision，再补新默认；CAS 不重置。持久成功后应用，旧剧情存档不能回写旧偏好。键盘只绑定本实例舞台/默认 UI/明确 attachInput 的根，编辑控件保留输入，按钮保留可访问激活，keydown/keyup 重验 epoch/prompt；repeat、失焦、菜单、load、重映射清理 held。字号/背景透明度不改正文身份和进度。默认 UI 可配置、导入导出 JSON、恢复作品 defaults。

## 最终实际验证

所有命令使用 export TMPDIR=/dev/shm，解决本环境 /tmp 配额限制；未清理其他项目或放宽检查。

| 命令 | 结果和证据 |
| --- | --- |
| pnpm install --frozen-lockfile | install.log；无依赖/锁文件变更 |
| pnpm check | check.log；生成一致、strict 类型、独立 headless、导入边界，含真实工厂/新增公开 API 的类型正反例 |
| pnpm test | unit.log；15 文件、95 测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g1-02 pnpm test:browser | browser.log/browser-results.json；41 通过，0 skip/flaky，含实际生产 build |
| pnpm test:consumer（同 evidence 环境） | consumer.log/consumer-result.json；仓库外安装 tarball，strict/skipLibCheck=false，原生 ESM 和真实浏览器；v1/v2、坏键/冲突、公开 import/export/reset/Auto、保存恢复与其余原门槛 |
| pnpm test:cli | cli.log/result.json/commands.json；50 真实命令、两个独立开发者工作流，浏览器保存恢复/导入 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic，通过框架流程；N/F 仍 needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；Core/API/三次活动销毁目标通过 |
| GALBOX_API_BASELINE=935f8e8 pnpm test:release | release.log/release-audit.json；旧/新声明真实编译、16 新增/10 声明变化（按入口计）、无导出删除、两包 pack/publish dry-run |
| pnpm dev；node docs/evidence/g1-02/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-playable.png；真实 UI Auto 到分支、海岸结局、保存/刷新/读旧槽，保留 9 条已读/解锁/偏好，manual、1 canvas、真实音频、0 pageerror |

7 个新增单元语义/失败测试覆盖启动≠结束、旧 epoch/attempt、预算 1/8/100 一次输入和同次选项停止、预算续跑期间排队 manual/pause 立即抑制旧自动决策、暂停剩余延迟、未读和真实 delay、loop 伪回调、完整 v1 迁移/键冲突。没有删除断言、永久 skip、放宽 strict 或用 any/双重断言替代工厂。

4 个新增真实浏览器场景覆盖原生两秒 WAV/replay/旧回调/menu 暂停、两个实例键盘隔离/编辑/repeat/load 松键/失焦、默认 UI 显示辅助/JSON 导入导出/坏设置/恢复默认/刷新、真实旧 IndexedDB 设置迁移保持 revision=7。显示辅助断言正文保持不透明、实际字体放大且设置面板无横向溢出；截图 playback-settings.png。

## 排错记录与证据范围

browser-initial-failures.log 是新增测试首轮夹具错误：revision 写成非合法 ID、旧 DB 夹具缺基础字段；未放宽生产校验，修正夹具后运行。before-choice-settle 保存首轮全量 40/41：到 choice 后 mode 曾要下一帧才变 manual；生产协调器已在稳定发布前 settle，预算测试和浏览器断言保留并通过。before-settings-layout 保存布局修正前的通过结果：截图发现错误长串撑宽字段导致按钮裁切；现约束网格宽度并提供简短设置错误，新溢出断言通过。归档不冒充最终代码，最终为顶层日志/JSON及 source-manifest.json。

性能参考：228 次语义 API P95 3.4 ms、两帧观察 P95 38.0 ms、最重 Core 批次 P95 1.398 ms、三个完整活动销毁 77.5, 79.5, 135.2 ms，保持 500 ms 局部门槛。仅当前 Linux/Chromium 156.0.8078.4/SwiftShader/Web Audio；无视觉延迟或 60 FPS、物理 GPU/VRAM/真机/其他浏览器/人耳音质/大作品保证。原预加载、chunk >500 kB 等限制保留。

SDK 本地 0.1.0 SHA=7a2d1efd32c5337d85644010c9621e7c7aac323917b58a27973d412681b149be；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。consumer/CLI/audit/实际包 SHA 已交叉相等。偏好 v2 不由旧 SDK 二进制前向读取；故事 Snapshot ABI/version=1 未变；本地 alpha 不承诺稳定 API。没有实际发布、Git push、部署或远程 CI。

## 下一步与未完成

G2-01 先定义结构化 runs/Ruby/有限文字效果及恢复 ADR，再实现 Schema/生成物/真实 port-kit 工厂/Core/DOM/来源验证和原创样例；Auto 共用正式正文揭示状态。G0-03 浮点/集合、G2–G7 后续正文/NVL/多文本框/演出/图文存档/回溯/流程图/鉴赏/剧本 UI/全面验收仍未完成。N/F 缺指定 edition、可用 Program/资源、真实原档附件及原作加载继续参照；保持 blocked，不以 synthetic 或原创素材声称真实作品已兼容，M6 仍未完成。

当前 pnpm dev 服务在 http://127.0.0.1:4173/，表达式章节 /?demo=expressions。浏览器套件前应停 dev 释放 4173/4174。设置与播放 API/边界见 SETTINGS.md、PLAYBACK.md、ADR0015；任务状态唯一来源 tasks.json。
