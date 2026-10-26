# galbox-sdk 当前状态

2026-10-26。G3-03有限集完成，分支feat/video-and-timed-interactions，基线9eeb102，本地提交见git log。任务唯一完整状态tasks.json；下一G3-04。无外部推送/发布/部署/远程CI。

ADR0023、Schema/生成validator与类型、真实interactionPrompt/videoPlay工厂、Core/Host/Player/React/资源/CLI已闭环。单opaque VP8 WebM及可选Opus/Vorbis音轨，同Pixi平面/WebGL和Canvas；startup/自然end/skip分开，replay从0、forbid普通禁存，初始接管有明确受控恢复。设备阻止重试、永久初始pending接管、迟到Promise/end/dispose均实测。未知编码/alpha-stereo变体/seek/循环/并发影片未提供，完整bytes Blob不冒充网络流。

interaction.prompt为最多16个viewport矩形/键盘选项，enabled/deadline一次求值，prepared不扣时，UI报告绑定readiness经Player结算准备时间/队列activate，Core才计时；t>=deadline走明示timeout。暂停冻结，恢复新attempt/epoch、保留耗时并重新prepared，Auto/快进不自选。停止RAF后过期点击仍拒绝，旧身份不穿透。见VIDEO.md/INTERACTIONS.md。

最终frozen install/fixture/check、164单元、79浏览器（0 skip/flaky）、strict/skipLibCheck=false仓库外tarball（影片/期限/forbid/备份/当前profile）、62 CLI、4 synthetic、性能/API/pack/publish dry-run通过。初期attempt/短片窗口测试失败与Pixi诊断类型泄漏已修复并保留证据，未放宽strict。证据evidence/g3-03/REPORT.md、日志/JSON/截图/source-manifest。

SDK0.1.0 SHA=ba41bd16ea1daea0e462ffcb3da937287b89891f5e73cbb0b1aa98e844b3ad67；CLI SHA=cbd2e69f36b4139d06fca5091122dd4e8760f73c089948d3675dc21b27fca9b7，consumer/CLI/audit/artifacts一致，本地UNLICENSED alpha，13新增/16声明变化、0删除。Snapshot wire=1新cap限定扩展，旧Program/槽位保留，不承诺旧二进制前向读新状态或稳定API。标准小说WebGL回归API P95 5.5ms、最重Core批次P95 1.624ms，活动销毁148.7/199.5/267.5ms，原500ms目标通过；不当影片/Canvas/全平台/人耳音质或RAM认证。

当前dev已启动http://127.0.0.1:4173/?demo=interactive 。以Chromium --disable-webgl与原生API实测：同canvas影片像素[255, 213, 133, 255]、保存重播、热点、活动期限47ms保存/恢复、forbid拒绝、结局后读旧槽仍保留5已读/解锁/设置，单canvas/0 pageerror。测试用原生playbackRate=.5只延长操作窗口，不是SDK播放速度能力。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

下一G3-04：版本化网络stream lease/IntegrityEvidence/取消所有权先写ADR，再慢速HTTP实际未整档下载即播、断网/身份替换/恢复与独立consumer。G4–G7图文存档/回溯/流程图/鉴赏/剧本UI未完成。N/F仍缺真实edition/Program/资源/原档/原作继续参照，独立blocked，M6未完成。
