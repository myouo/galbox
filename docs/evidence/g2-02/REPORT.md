# G2-02：ADV/NVL、多窗口、主题与字体

2026-10-25，分支feat/text-windows-layouts，基线2720eb4。G2-02有限支持集完成，下一项G0-03。正式TS Core/coordinator/DOM/Web Host/Player/React/IndexedDB路径，单剧情流、单Pixi舞台；作品声明布局/主题/资源，不重写窗口或存档内核。

## 可观察行为与接口

Program.textLayout与公开textLayout/textTheme/textWindow/textFont工厂，Schema生成类型/validator/OperationSpec。最多8窗/16主题，逻辑画幅1280×720，安全矩形/层级/颜色/排版参数；select/clear/visible/theme经Core执行。ADV替换，NVL保留已确认段并附当前段，容量满明确TEXT_WINDOW_FULL，不暗丢内容。确认后才写history/ReadUnit/entries；清窗保留全局历史/已读。

Snapshot保存布局/字体签名、active、每窗显隐/主题/确认条目，当前text仍是唯一揭示权威并有window/id/at来源。恢复重验窗口/容量/来源/历史闭包和当前prompt。旧段冻结，换偏好不改已确认continuation；缺状态/变定义不猜迁移，旧槽保留。旧无layout Program保留原路径。

TrueType作为font/ttf资产走provider/摘要/有界编码预加载/发布事实，有限SFNT目录检查后，浏览器必须FontFace.load成功再创建renderer/激活。实例有自己的family/FontFaceSet登记，取消迟到不登记，dispose不删别人的字体。原创新Latin测试字体96glyphs，源码build-font.py用fontTools4.60.1，固定时间戳；普通pnpm fixture只读已提交TTF，没有Python运行依赖。

公开textRenderer工厂在资源/字体就绪后创建，接收独立Program副本、mount、fontFamily查询；render输入与Core/Player缓存隔离，默认createDomTextRenderer可包装。dispose幂等且之后不render；取消后的迟到结果清理，提交后render失败保留pending由新renderer恢复。默认DOM按窗口状态预建/更新，按mount缩放并叠乘玩家字号/背景偏好，窗口层在菜单/选择控件下方。

原创《灯塔来信·双页值班簿》在fixtures/layout-novel与apps/playground/public/layout，/?demo=layout。三窗、ADV/NVL、换主题、清页和真实字体走相同生产实现；没有UI硬编码剧情。

## 最终实际验证

命令均设置export TMPDIR=/dev/shm，仅应对本机/tmp配额，不清理其它项目。

| 命令 | 实际结果/证据 |
| --- | --- |
| pnpm install --frozen-lockfile | install-frozen.log；Node依赖/lockfile未增加 |
| /dev/shm/galbox-font-tools/bin/python fixtures/layout-novel/build-font.py | 原创字体可选重建；font-tools-install.log固定fontTools4.60.1，仅隔离构建工具 |
| pnpm generate；pnpm check | generate.log/check.log；生成一致、strict/headless/导入边界和公开工厂/renderer类型正反例 |
| pnpm fixture | fixture.log；各原创Program/清单同生产工厂生成 |
| pnpm test | unit.log；17文件，114测试 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g2-02 pnpm test:browser | browser.log/browser-results.json；48通过，0 skip/flaky，含build；4新增窗口/renderer/字体场景 |
| pnpm test:consumer（同evidence环境） | consumer.log/consumer-result.json；仓库外tarball，strict/skipLibCheck=false/原生ESM；新工厂/NVL切点、字体事实与真实加载、公共renderer、保存恢复/便携备份恢复 |
| pnpm test:cli | cli.log/result.json/commands.json；54命令，原两个开发者流程+新增font配置/资产build/validate/build/损坏拒绝与旧清单保留 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic；N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；原Core/API/三个活动销毁目标通过 |
| GALBOX_API_BASELINE=2720eb4 pnpm test:release | release.log/release-audit.json；真实前后声明编译，21新增/12声明变化（按入口计），无导出删除，两包pack/publish dry-run |
| pnpm dev；node docs/evidence/g2-02/dev-probe.mjs | dev.log/dev-result.json/dev-probe.log与dev-multi-window.png/dev-restored-choice.png；真实UI保存/刷新恢复NVL和三窗、换主题/清页/结局/再读旧槽，6已读/解锁/当前字号保留，1 loaded字体、1 canvas、0 pageerror |

9新增单元覆盖ADV替换/NVL确认条目与全局历史分离、预算1/8/100/恢复同态、容量满失败无半页、旧段偏好冻结、清active窗、工厂身份/资源种类/矩形/所有权、缺状态/改源/伪造条目/隐藏prompt拒绝并保旧槽、plain/template/rich来源和旧档、实际原创TTF目录/预算与坏字节。类型正反例实际使用Builder/字体/窗口opcode与renderer readonly输入，没有双重断言、any、永久skip或删必要断言。

4新增浏览器场景：原创新章节两路线/跨刷新/多窗口/主题/清页/profile；公共renderer字体准备后创建、Program/快照隔离、逻辑缩放/偏好叠乘/一次dispose；实际FontFace失败/取消/双实例释放；renderer工厂迟到取消与提交后失败pending由新renderer接管。multi-window.png/开发截图可观察版式，不能单独替代语义断言。

## 排错记录和边界

unit-first-failure.log保留两处夹具问题：篡改rich条目先触发RESTORE_RICH_TEXT，测试已逐项写精确错误码；旧无布局夹具换代码时未更新entry，已修复入口。没有放宽生产恢复验证。

browser-first-failure.log/browser-first-results.json为首轮全量47/48：测试在首个prompt尚未就绪时读取undefined，把显完误判翻页。改为等待真实text等待再读取prompt，保留原路线/窗口断言，最终48/48且0 flaky。

cli-first-failure.log/commands-first-failure.json保留测试定位错误：完整开发者工作流把story.mjs包装并把原Builder放在story-base.mjs，新font夹具最初改错文件；现按真实模块修改原Builder，追加import避免移动已有SourceMap行号，重新执行54命令通过。不是修改生产语义来迁就测试。

静态边界检查此前按标识符拼写将window数据属性误判为DOM全局；现按AST区分显式属性/类型字段和变量访问，并执行正反例，window/globalThis.window/全局简写仍拒绝。strict/headless/外部导入限制未放宽，新的布局模块无设备依赖。原始工具日志保留原格式。

SDK本地0.1.0 SHA=6591a423544a250dc47a99f4252b64984f8407dc47c988b3e2d9b7ccf461d636；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e。consumer/CLI/audit/实际tarball SHA交叉相等。未实际publish/push/部署/远程CI。Snapshot wire version=1可选扩展，新窗口Program缺状态需迁移；旧二进制不承诺前向读新能力，不宣称稳定API。

参考性能：228次语义API P95 6.5ms，两帧观察P95 58.0ms，最重Core批次P95 1.300ms，三个活动销毁190.7, 313.9, 247.3ms，原500ms局部门槛通过。仅Linux/Chromium 156.0.8078.4/SwiftShader/Web Audio；没有视觉延迟/60 FPS、物理GPU/VRAM/真机/其它浏览器/完整字形/音质或大作品保证。编码整包预加载/chunk体积/历史规模等限制保留。

字体仅TrueType glyf/loca；不声称WOFF/WOFF2/可变字体、竖排/禁则/自动分页。字体加载不等于全部字形覆盖，fallback明确。字体编码字节计入预算，不把解码内存当成实测。NVL物理scroll不进Snapshot；默认历史仍是正文摘要，G4另做回溯等系统。renderer是受信任TS端口，不是同realm沙箱。

## 接续

下一项G0-03：有限浮点/集合值族、类型化数据表达式、数值/大小规范与完整内容迁移ADR，再同步Schema/真实工厂/Core/恢复与失败原子性，补G3完整舞台变换的既定依赖。G3–G7其余演出/视频/图文存档/流程图/鉴赏/剧本UI/全面验收仍未完成。N/F缺edition/Program/资源/真实原档附件与原作继续参照，blocked独立保留，M6未完成；原创/synthetic不冒充真实兼容。

当前dev运行http://127.0.0.1:4173/?demo=layout，重启export TMPDIR=/dev/shm、pnpm dev；browser前释放4173/4174。任务唯一状态tasks.json、当前摘要STATUS.md、源码指纹source-manifest.json。
