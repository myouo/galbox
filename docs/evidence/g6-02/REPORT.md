# G6-02 默认游戏界面、作品皮肤与移动布局

2026-10-26—27，基线6a22ca1，分支feat/game-interface-skins。ADR0030有限支持集完成，G6-02 done；任务唯一状态见tasks.json。测试运行修改工作树；日志revision为当时HEAD，最终source-manifest和随后本地提交绑定实际实现。

## 实现与行为

Program.presentation由Schema生成类型/validator，gamePresentation真实工厂关联image/font引用，链接器核验资源kind。限定六色调色板、字体/字号/圆角、标题图像/logo/文本、按钮标签和有限工具栏动作；menu不可删除、重复动作与未知wire字段拒绝。配置私有化并冻结，只有声明新配置的DefaultUI选择GameUI，原无配置作品保留经典布局；新CLI模板采用声明式默认皮肤。没有新增剧情解释器、Core语言或图像舞台。

完整页面覆盖标题、继续/确认新开始、系统菜单、保存、读取、历史、设置、流程图、鉴赏和数据管理。正式SaveLibrary支持6卡分页/种类筛选及覆盖/删除确认；历史回溯、章首进入、CG/音乐/场景回放、备份和独立进度都调用既有Player/Store路径。成功激活才返回故事；新界面不依赖开发诊断元素。

Player持有不持久化的systemScreen及导航代次，返回标题只暂停当前运行，继续恢复同一PC；没有重建一个“标题Core”。切页先关闭自身鉴赏/历史声音，未知head保持原页面冻结并允许重试，旧showSystemScreen或兼容setMenu的关闭回调不能覆盖新导航。已提交激活切回故事，过期UI闭包不再替新页面执行关闭。GameUI的组件状态按Player实例重新建立，旧设置提交只能落原Store；新实例/其他Player不被污染或一起暂停。

皮肤不进入Snapshot/Profile。两份原创配置沿同一执行定义/资源目录读取同一存档，当前皮肤和用户偏好不会被旧档覆盖。增删资源或修改剧情/UI定义仍受既有迁移规则约束；不能以“只是换皮肤”绕过定义身份检查。标题图像使用Host验证后的像素生成有界PNG，不能复用已释放的Blob地址；字体来自已准备资源和明确fallback，装饰图像失败有可见提示。

SystemDialog提供固定视口面板、安全区间距、独立内容滚动、移动横向导航、Tab循环/Escape取消和有效焦点恢复；确认框至少在视口内，不通过全局focus监听器争抢其他实例。设置写入串行但不禁用正在编辑的滑条。PressGesture真实用于正文、选项、互动、回放和脚本按钮，绑定主指针ID/按下语义身份/12px移动阈值/释放命中；重复键、拖动/滚动、取消和旧节点不能生成新选择。

窄视口下的主表单按作者控件顺序重排并展开到视口，按钮保留44px以上目标；容器内回放/嵌入仍在自己的区域滚动。Snapshot保留作者逻辑矩形和值，Web重排不改变剧情状态。纵向可见界面按比例放入320×180图文存档，两侧留黑；未裁掉表单后假报完整。正文/舞台捕获维持原规则，系统菜单/工具栏不成为剧情快照。小视口推进按钮放在可触达区域，矮横屏阅读舞台限制在可用高度。

原创《灯塔来信·远航》提供harbor-night/letter-paper两皮肤，复用同一剧情、资源、收藏室、路线入口和值班表单。App仅选择JSON和manifest，所有页面来自SDK。标签、颜色、图像和字体由作品配置，示例没有硬编码系统页面逻辑。

## 当前验证

命令使用export TMPDIR=/dev/shm。根测试现在显式声明仓库已使用的react/react-dom 19.3.1，pnpm lock和frozen install已验证；未新增SDK运行依赖或改动已锁版本。测试harness明确production NODE_ENV，生产App和独立consumer使用正常Vite应用构建。

最终check/211单元、122完整浏览器（0 skipped/flaky/unexpected）和8项最终UI复验通过。完整套件构建后的小改包括GameUI配置前置检查、经典激活systemScreen同步、系统页菜单快捷键及已有恢复API入口；最后8项和重新打包覆盖这些变化。原生--disable-webgl移动dev通过，最终包其余门槛按以下文件记录。

| 命令 | 结果与证据 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install.log/generate-second.log/fixture.log；锁定依赖、原生ESM生成物和全部原创Program/manifest通过 |
| pnpm check | check.log；生成一致/严格类型/真实工厂正反类型/headless/导入边界通过 |
| pnpm test | unit.log，30文件/211项通过 |
| pnpm test:browser | browser.log/browser-results.json，完整122项通过，0 skip/flaky/unexpected |
| ui-recheck目录，pnpm test:browser（8项定向UI） | 最后代码的两个绘图设备/移动与横屏、按键/焦点/隔离/无配置拒绝/恢复入口通过；生产代码此后冻结 |
| pnpm test:consumer | consumer.log/consumer-result.json；仓库外tarball、strict/skipLibCheck=false/native ESM、实际React完整页面/图片/换实例/旧档换皮肤及偏好通过，cleanup完整exit0 |
| pnpm test:cli | cli.log/result.json/commands.json；最后新包的65命令、模板/扩展/迁移/导入、dev HTTP/真实流式媒体与浏览器保存恢复通过 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic通过，N/F真实认证仍needs-input |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；既定Core/API/三次活动销毁门槛通过 |
| GALBOX_API_BASELINE=6a22ca1 pnpm test:release | release.log/release-audit.json；strict/native exports、13新增/11声明变化/0删除，两包pack/publish dry-run通过，actualPublish=false |
| pnpm dev；node docs/evidence/g6-02/dev-probe.mjs | dev-probe/dev-result和截图：原生禁用WebGL、触控视口、保存/刷新/跨皮肤恢复通过，最终代码服务重启后再次通过，含实际纵向PNG文件dev-save-thumbnail.png |


单元覆盖真实皮肤工厂/错资源kind/有限字段/无menu/重复/不安全值、私有化与旧无皮肤程序、不同皮肤的Core快照恢复，以及生产PressGesture的拖动/取消/异指针/越界释放/重复键/新身份。

最终八项UI浏览器包括WebGL/Canvas完整页面、实际图像解码、分类存档/刷新、历史/鉴赏/流程图/表单，两个导航API的迟到关闭与未知head、仅换皮肤保存恢复与偏好、手机/矮横屏边界、实际触控滚动且不误提交、完整纵向缩略图像素与字段、7槽分页/确认焦点/便携恢复分支、React Player替换和挂起设置写入不禁用滑条/不污染新实例，以及无配置GameUI明确拒绝/配置菜单键关闭页面但不抢编辑输入。

原生dev使用Chromium --disable-webgl，未替换getContext：390×844、hasTouch，六类表单可用，menu/鉴赏切页清理、保存时帧深度2/ui等待、刷新后署名/开关/强度95保留、Profile最新署名和fontScale1.25仍在，切回另一皮肤可读原槽，单Canvas与0 pageerror。

## 过程失败

生成器拒绝新增uniqueItems引用型条目触发的CommonJS辅助require；改成同一Schema内联有限字符串枚举，保留唯一性与严格校验。初始check保留重复freezeJson import，已清理。

browser-first实际发现标题图像clone了Host prepare后已释放的Blob URL，decode报EncodingError；改为已验证像素的有界PNG缓存，并增加真实decode/naturalWidth断言。原始手机截图促使主表单扩展到视口和contain缩略图，后续实际检查侧边黑像素/中心内容与完整保存字段。

browser-fourth记录新增真实React挂载测试没有根目录React依赖，browser-fifth记录Vite library模式保留process.env.NODE_ENV导致process未定义；补根测试的同版本显式依赖和harness生产define。没有外置掉被测试模块、伪造process设备能力、放宽strict或跳过测试。生产App原已正常使用React应用构建，独立消费者另验。

CLI first/second保留从旧UI诊断DOM取值导致的失败。正式玩家页面不回添开发诊断：模板实测从真实IndexedDB/原生音频启动读取证据；开发者测试夹具使用公开usePlayer/PlayerView的隐藏developer-probe（含视频/完整性状态）。原有控制流、导入钩子、全调用迁移、profile、媒体、保存/刷新断言全部保留，未改SDK为测试返回固定对象。

before-final-menu与consumer-before-shortcuts保存最后菜单/快捷键补齐前的结果，不作为最新包证据；最终consumer/CLI/release与artifacts的SHA已交叉核验一致。

## 构建身份与实际性能

SDK0.1.0 SHA256=0f6d8158fb4e2885ee7b06ae5f7d3210ee688215bc54841d49b2eab2b7954bad。
CLI0.1.0 SHA256=1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da。
两包与consumer/CLI/release结果一致。仍UNLICENSED本地alpha，无实际发布。Program/Snapshot wire仍1，presentation是新可选配置；公开GameUI/皮肤工厂/页面方法与面板props有有限变化，不承诺旧二进制读取新Program或API稳定。

既有无presentation标准小说的软件WebGL基准：语义API P95 23.90ms（门槛50）、两帧P95 65.10ms、最重Core批次P95 1.751ms（门槛4）、三次活动销毁21.7/22.2/15.9ms（门槛500）。它不是完整页面/大表单/历史满额或移动设备认证，G7仍须分组归因，不能把它称为本轮UI性能优化结论。

## 范围与接续

皮肤是有限颜色/排版/标题资源/标签/工具栏，不是任意HTML/CSS/JS或皮肤编辑器。字体/图片仍受资源预算；每Host额外标题图像至多1280×720与480×180，不等同总浏览器内存测量。移动证据为Chromium触控模拟及原生Canvas路径，不代表iOS/Android真机或Firefox/Safari认证。G7仍要组合/规模与G4以来性能归因，N/F/M6仍缺真实edition/Program/资源/原档附件/原作对照。

下一G7-01：组合全部通用有限支持集，保留真正网络流与Canvas路径，分组测量历史/捕获/存储/UI成本，验证声明规模和严格独立消费。无外部推送、实际发布或部署。

最终API边界：直接GameUI要求声明presentation，缺配置明确提示；经典布局仍由DefaultUI兼容。经典初次激活在未打开菜单时同步systemScreen为story。该小改在完整套件构建后补入，最后8项定向复验、check/unit和新consumer/CLI/perf/API包产物已覆盖。

最终运行：export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。当前服务http://127.0.0.1:4173/?demo=interface，信纸皮肤加&skin=paper，强制Canvas加&renderer=canvas；默认已支持自动后备。构建pnpm build，完整browser前停止dev释放4173/4174。任务/source-manifest/本地提交保存接续事实，当前G7仍未完成。
