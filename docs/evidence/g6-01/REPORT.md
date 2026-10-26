# G6-01 剧本控件、事件与状态恢复

2026-10-26，基线7d71fb0，分支feat/script-ui-state。ADR0029有限支持集完成，G6-01 done；任务唯一状态见tasks.json。测试运行修改工作树，日志revision为当时HEAD，最终source-manifest与随后本地提交绑定实际源码。

## 可观察行为

Program.ui为版本目录，有限label/image/button/toggle/range/input六种控件、逻辑1280×720、一活动屏幕。真实控件/屏幕/字段工厂保留不透明引用，uiField关联bool/i32/string目的槽；ProgramBuilder.ui和链接器检查控件kind、屏幕成员/重复身份、资源种类、分支作用域、字段类型、范围格点及有界布局。协议由单一Schema生成，未使用readonly/品牌替代运行时校验。

ui.show初始化并产生generation，ui.hide取消当前屏，ui.text/visible/enabled/toggle/range/input只更新已声明有限属性。ui.wait声明按钮分支与字段提交，编辑只修改Snapshot.ui；按钮提交先核验全部目的槽，再复制值和按钮ID后改变PC。可见/启用和准备状态由Core裁决，未绑定按钮、旧身份/重复事件不生效；非法字段值失败无部分提交，条件/表达式失败不改当前控件、profile或待提交效果。

Snapshot.ui绑定目录、相关图片和UI指令，保存show来源、generation与全部当前控件；UIWait保存目标/字段/签名/准备阶段。恢复更新attempt并重新prepared，保留值和嵌套帧，不执行show复位。UI不拥有第二剧情流，不读取DOM或React state作为剧情权威，不自行写玩家偏好；Auto/Skip与RestoreRecipe不猜用户选项。恢复/备份迁移必须覆盖当前、上一修订及其它可达快照，更新摘要不能替代字段/等待ABI迁移。

Player装配生产DOM ScriptUIRenderer，沿同一Coordinator/Core接收事件，默认React继续提供系统菜单。控件的布局和文字来自Program，样例没有硬编码UI剧情。无需React的嵌入同样可以编辑和提交。输入身份包括epoch/prompt/attempt/generation/inputId；按住按钮保留原身份，等待/读档/暂停替换旧控件节点，迟到旧DOM事件不能被重标为新会话。IME组合是设备草稿，compositionend才进入Core；保存与截图使用已确认值。焦点/光标/按住键/未提交组合不入档。

图片由Host已经私有化并校验的资源生成有界PNG；临时URL/节点不入档。图文保存沿原捕获屏障同步复制正文、Pixi与UI，原生输入value/checked和PNG嵌入SVG，合成320×180截图。UI图像设备失败清理本实例UI并暂停，图文保存明确拒绝SAVE_CAPTURE_UI，不遗漏一层后报成功；逻辑保存仍可供新Player恢复。dispose释放DOM、ResizeObserver与输入引用，其它实例不受影响。

原创《灯塔来信·值班面板》使用全部六种控件。form函数局部draft接受署名，开关/强度写入相应全局槽；正文只在确认后读取提交值。锁定按钮和隐藏控件保持不可操作，封存数据不会被浏览器交互覆盖。原有Core/Host/Store驱动全部行为，没有独立演示解释器。

## 最终实际验证

所有命令export TMPDIR=/dev/shm，无新依赖。除install/generate/fixture/check/unit/dev外，默认GALBOX_EVIDENCE_DIR=docs/evidence/g6-01。

| 命令 | 实际结果与证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install.log、generate-second.log、fixture.log；锁文件/原生ESM生成物和全部原创fixture/manifest通过 |
| pnpm check | check.log；严格生成/类型、真实工厂正反类型/headless/导入边界通过 |
| pnpm test | unit.log，29文件206项（原199+新增7）通过 |
| pnpm test:browser | browser.log/browser-results.json，完整116项（原112+新增4），0 skipped/flaky/unexpected |
| ui-recheck目录，pnpm test:browser（4项UI定向复验） | 最终4项通过，包含Enter/Space、编辑后首次直接点击、跨load旧按键和过期UI回调不能关闭后续Auto；完整browser后只增加了Player.uiAction的当前等待身份前置检查，此处覆盖最终代码 |
| pnpm test:consumer | consumer.log/consumer-result.json；仓库外tarball、strict/skipLibCheck=false/native ESM工厂及实际DOM控件、类型化提交/图文保存/备份/重新打开通过；cleanup完整exit0 |
| pnpm test:cli | cli.log/result.json/commands.json；65真实命令/独立模板/实际dev HTTP与浏览器保存恢复通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic通过，N/F仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；既定Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=7d71fb0 pnpm test:release | release.log/release-audit.json；42新增/10声明变化（按入口计）、0删除，strict/native exports/两个pack与publish dry-run通过，actualPublish=false |
| pnpm dev；node docs/evidence/g6-01/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-script-ui.png；原生--disable-webgl、未替换context API，六种控件/单Canvas、图文保存/刷新恢复通过，0 pageerror |


新增单元验证真实工厂/错误kind/伪造引用/屏幕归属/目的槽/范围/cap；预算1/8/100的生产协调器与嵌套提交；准备、隐藏/禁用、重复/过期事件及错误值原子拒绝；保存后恢复身份/值/帧与静态定义漂移；重新show重置与generation更新；脚本表达式失败不改值/profile/effects；上一修订备份的部分迁移拒绝和完整迁移保留原槽。

新增浏览器包括WebGL/Canvas默认界面、实际checkbox/slider/text输入、编辑中图文保存、嵌套帧及刷新读档、当前profile不回退、UI缩略图真实背景像素[16,41,56,255]。API用例执行未提交IME/完成组合、按下后读档/迟到旧DOM、旧epoch、非法格点、双实例和dispose；设备故障用例实际使UI PNG绘制失败，证明暂停、不写不完整槽、保留原槽、逻辑保存及新Player恢复。

## 过程失败与修复

check-first保留WeakMap类型声明括号错误；check-second保留非空Schema元组map后变普通数组，改为已验证parseUIScreen或显式保留首元素；check-third使用了DOM类型不存在的oncompositionstart/end属性，改用标准addEventListener。check-fourth/fifth/sixth保留fixture误用旧名字，改为正式assignProfile/templatePage；check-ninth保留备份上一修订按错误包装访问snapshot，按正式Snapshot结构修复，未放宽strict或断言绕过。

fixture-first.log保留实际Node ERR_AMBIGUOUS_MODULE_SYNTAX：新增maxLength/minLength导致Ajv standalone生成CommonJS ucs2length require。Schema改为仓库既有有界pattern，生成脚本新增require检查，保证原生ESM且不引入Node辅助依赖；generate-second/fixture和后续check重验。没有手改生成validator或假成功脚本。日志包含生成器单行源码，文件较长；不是新增运行错误在最终路径被忽略。

## 构建身份与性能

SDK0.1.0 SHA256=c71262d22a8936f3f7f46c0618c301e4b7b71dc0a2ce7104bcf8f28b274f3621。
CLI0.1.0 SHA256=c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e。
实际artifacts与最终consumer/CLI/release审计SHA一致。仍UNLICENSED本地alpha，无实际发布。Program/Snapshot wire仍1，新增ui.controls能力和可选UI定义/状态、UIEvent等；旧无UI程序仍走原路径，不承诺旧二进制读取新能力或API稳定。生成器禁止CommonJS辅助require，native ESM消费者实际运行证明没有依赖Node辅助模块。

标准无UI目录小说的软件WebGL基准：语义API P95 25.80ms（门槛50）、两帧P95 67.00ms、最重Core批次P95 1.515ms（门槛4）、三次活动销毁15.5/13.8/15.2ms（门槛500）。它只覆盖既定回归工程目标，不证明64控件/大图库的DOM重绘、移动输入/内存或60FPS；G4-02以来性能增幅及新增UI规模由G7继续归因。

## 范围和接续

16屏、每屏64控件、目录262144 JSON字符、每屏图片16MiB RGBA估计，原Program/资源/存储和截图大小预算继续适用。整数格点与单行输入，不支持任意HTML/CSS/JS、多层屏幕栈、拖放/任意命中、多行编辑器或响应式约束布局。图片预算不是浏览器总RAM；大作品、低配/移动真机、其它浏览器和所有控件组合的规模待G7。受信任适配器和同realm插件不作为安全沙箱。

G6-01完毕，下一G6-02负责完整默认界面、作品皮肤与移动布局；G7仍需组合/规模/独立消费和之前性能增幅归因。N/F/M6仍缺明确edition、可用Program/资源、真实存档附件和原作继续参照，不以本原创样例冒充真实作品认证。没有推送、实际发布或部署。

原生dev-probe-first.log发现输入框直接点击按钮的内部focusout错误清held；修复为只在焦点离开本UI根时清理。Canvas默认UI增加编辑框→按钮第一次点击断言，键盘Enter/Space保留。修复前完整日志已保存在before-focus-fix，仅作过程记录；修复后完整116与最终4项UI复验、check/unit/consumer/CLI/compat/perf/API及原生dev均已重跑通过。

最终输入边界补充：Player.uiAction在切换manual前重验当前active UI等待身份，旧控件回调不能关闭后续正文Auto；新增实际浏览器断言。完整116套件构建在此小改前，其后4项UI、check/unit及最终打包产物已实际重验通过，ui-recheck/script-ui-result.json的staleMode=auto证明旧控件回调没有更改后续播放模式。

原生开发实测：WebGL=false/Canvas=true，六种控件实际显示；保存时form帧深度2，UI缩略图320×180且背景采样[16,41,56,255]。恢复署名“原生兼容署名”、开关false、强度85，attempt 1→2；此前再次提交的最新持久署名“最新持久署名”仍在Profile revision3，旧UI存档不擦除它。未提交输入法组合和过期DOM/键盘另有实际浏览器断言。

开发服务运行在http://127.0.0.1:4173/?demo=ui，可加&renderer=canvas。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build；完整浏览器前停止dev释放4173/4174。
