# G2-01：结构化正文、Ruby 与文字效果

2026-10-25，分支 feat/structured-text-effects，基线108566e。G2-01 的有限支持集完成；下一项 G2-02。使用同一正式 TS Core/coordinator/DOM/Web Host/Player/React/IndexedDB，作品仅声明 Program/资源，不另建解释器或 UI 剧情。

## 实际行为与公开接口

公开 `richText.text/ruby/br/pause/speed` 和 `richPage` 工厂、text.rich Schema/生成物/OperationSpec。文字/speaker/Ruby reading 可为字符串或 typed string expression，链接全部来源，运行求值后保存，不在恢复时按新变量/profile 重算。安全颜色/粗斜体/下划线/缩放和有限 fade/wave/shake，不执行来源 HTML/CSS/JS。

固定字素分割身份 uax29-17.0.0@1，锁定 unicode-segmenter0.17.3/完整性，不使用设备 Intl.Segmenter；headless 边界仅放行 protocol/text.ts 的此入口。新文字不拆组合符/肤色/ZWJ/旗帜，跨 run 切簇拒绝；Ruby base 逐字素揭示，reading 不计进度。旧 page/template/codepoint 档不改解释。

Snapshot 保存源签名/at、分割版本、求值后 runs、cursor、活动 elapsed、字符余量、revealedAt、剩余停顿和上次间隔依据。可见页与历史均验证来源/结构/静态串/样式/cursor/时间，删标记或改源拒绝，原槽位保留。相同偏好重应用保留余量，当前偏好仍独立持久；没有回写旧偏好。

DOM 预建完整节点，更新可见性/效果而保留行布局，未来字素不进入 aria-label。fade 用显现活动时刻，周期效果用 elapsed/单位相位，菜单/后台冻结，新 DOM 直接重建保存相位。Core/Auto/快进共用 isTextComplete：pause/fade 未完不前进，周期效果不阻塞；第一次手动 reveal/step 显完并跳过停顿/淡入，另一次才记录已读/翻页。

原创《灯塔来信·信纸上的光》位于 fixtures/text-novel 和 apps/playground/public/text，公开工厂产生 Program/发布清单，复用原创素材，/?demo=text 实际可玩两路线。完整规则见 TEXT.md、ADR0016。

## 最终实际执行

全部命令设置 export TMPDIR=/dev/shm，仅处理本机/tmp配额限制，没有清理其他项目。

| 命令 | 结果/证据 |
| --- | --- |
| pnpm --dir packages/galbox-sdk add unicode-segmenter@0.17.3 --save-exact；pnpm install --frozen-lockfile | install.log/install-frozen.log、package.json/lockfile；唯一新增中立算法依赖 |
| pnpm generate；pnpm check | generate.log/check.log；生成漂移、strict 类型/真实工厂正反例、headless/导入边界 |
| pnpm fixture | fixture.log；基础/合成/值班簿/信纸章节同一路径生成 |
| pnpm test | unit.log；16文件，105测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g2-01 pnpm test:browser | browser.log/browser-results.json；44通过，0 skip/flaky，含生产build；3新增场景 |
| pnpm test:consumer（同 evidence 环境） | consumer.log/consumer-result.json；仓库外 tarball、strict/skipLibCheck=false/原生ESM，真实工厂、字素、pause/fade 精确恢复、新DOM/Ruby/保存恢复 |
| pnpm test:cli | cli.log/result.json/commands.json；50命令及两个独立开发工作流，浏览器保存/恢复/导入 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic，N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；Core/API/三个完整活动销毁目标通过 |
| GALBOX_API_BASELINE=108566e pnpm test:release | release.log/release-audit.json；真实前后声明编译、12新增/4声明变化（按入口计），无导出删除，两个包pack/publish dry-run |
| pnpm dev；node docs/evidence/g2-01/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json；真实 UI 保存剩余606ms停顿，刷新恢复/自动继续到结局/再读旧档；3已读/解锁/当前字号保留、manual、1 canvas、实际音频、0 pageerror |

10个新增单元覆盖：类型化求值/Unicode/Ruby与已读粒度；显完跳停顿/fade与另次翻页、快照所有权；预算1/8/100、split tick和多个余量/停顿切点恢复一致；interval0仍遵守停顿/同偏好保余量；Auto同完成判定与同次选项停止；拆簇/越界/坏样式/Unicode/缺slot拒绝；动态失败不提交半页/提示；候选改变量不重算旧页；来源/历史/continuation篡改拒绝并保旧槽；旧码点档/来源格式隔离。类型测试真实调用工厂，不靠双重断言、any、删断言或skip。

3个新增浏览器场景：原创两路线/Ruby样式/保存刷新/Auto；实际完整DOM的Unicode单位和布局稳定、菜单冻结、真实IndexedDB到新Player/新DOM的pause/opacity/transform同相位恢复；标签只显示文字、改源load拒绝并保旧运行/槽位。截图rich-playable.png，开发服务dev-rich.png/dev-restored.png。browser-new.log仅为同实现的定向验证，最终门槛为全量browser.log。

consumer-first-failure.log保存首轮夹具累计575ms却断言淡入已完的失败；实际完成点578ms。保留原比较，增加575ms未完、补3ms后刚好完成与两Core快照相等的断言，重新打包/独立安装/执行通过，没有缩短生产淡入或放宽断言。

## 包、性能与限制

SDK本地0.1.0 SHA=f459960fd8a1c35f108b5800b73bcb4ca247d6f9bca9d82238d10cb7871e494a；CLI SHA=f54b07401339a13be6c28d1e1993f47565a51acc368c1c785fa7e183244d7bf1。consumer/CLI/audit/实际包SHA交叉相等。没有外部发布、push、部署或远程CI。Snapshot wire version=1 为可选rich扩展；旧SDK不承诺读新 Program/存档，旧codepoint语义保留，不承诺稳定API。

参考性能：228次语义API P95 3.2ms，两帧观察P95 37.8ms，最重Core批次P95 1.339ms，三个活动销毁85.8, 72.3, 77.5ms，原500ms局部门槛通过。仅当前Linux/Chromium 156.0.8078.4/SwiftShader/Web Audio；不保证视觉延迟/60 FPS、物理GPU/VRAM/真机/其他浏览器/音质/大作品。chunk>500kB、整包预加载和回执规模仍为既有限制。

有限集：每页128runs、4096 UTF-16正文、256/reading、65536签名；safe style和三类效果，正文不加入Pixi合成，默认历史仅纯文本摘要但快照保留完整结构。没有声称支持NVL、多窗口、主题布局、字体准备/竖排/禁则/自动分页，继续G2-02等任务。

## 接续

下一项G2-02：先写ADV/NVL、多文本框/主题布局/必要字体与renderer端口的有限支持集和恢复ADR，再同步Schema/工厂/Core/DOM/Player/默认UI/独立消费，验证切换、历史、窗口与恢复。G0-03及G3–G7其余能力未完成；N/F缺edition/Program/资源/真实原档附件和原作参照，blocked独立保留，M6未完成，原创/synthetic不冒充真实兼容。

当前dev已运行 http://127.0.0.1:4173/?demo=text 。重启export TMPDIR=/dev/shm、pnpm dev；browser前停止dev释放4173/4174。任务唯一状态tasks.json，当前摘要STATUS.md，源码指纹source-manifest.json；历史证据只证明当时源码。
