# W1-02 / G4-01 / F-01E：预取、自动旧档迁移与整章前置能力

2026-10-29。SDK源码/测试6ec5791，实包SHA256=c398a36e07822cf6d5c5b6ab9a4eb491c8acc621a216b65653846d62cbca0889，公开exports独立消费。GitHub run40770926373六任务全部success：301单元、184浏览器（22+44+43+35+40）、CLI/consumer/release/package；本地check/build、21相关浏览器、strict consumer通过。SDK包238文件533753字节，无游戏、测试、日志、证据、JSON schema。

## 实际加载修复

源标签编成无条件jump时，旧balanced停止向后扫描；实例原默认demand，换立绘必须等待下载，Player资源屏障同时暂停音乐。ADR0050允许同函数128步/16资源/配置页数内跟随无条件jump，遇分支/调用仍停止。预取按PC变化计算，重叠批次先取得新引用再取消旧批次；预算不超过64MiB驻留上限的半数和当前工作集外余量。实例现默认balanced、lookahead=2；?loading=demand保留按需入口。音乐去除随机lease查询串，以版本URL复用浏览器缓存，租约、取消、HEAD与版本校验继续独立。

真实英文完整序章同一路线，95次advance（含页内确认，不是95个不同段落），阅读600ms，CDP延迟180ms/下载750000 B/s、浏览器缓存关闭。统计Player.input调用完成耗时，不将原脚本转场时长冒充网络卡顿或Web Vitals。

| 最终实包 | demand P95 | balanced P95 | 资源等待引发AudioContext暂停 |
|---|---:|---:|---:|
| 本地实际HTTP | 854ms | 65ms | 12 → 3 |
| testsdk实际R2公网 | 930ms | 59ms | 12 → 3 |

两组都通过tooling/compare-reading.mjs：源段落/确认序列和网络参数相同，P95至少减半、暂停至少减半。它不是固定成功结果。仍有选择前连续冷转场/媒体切换的剩余等待，不能声称所有网络零卡顿；驻留数字是SDK资源估算，不是整个浏览器RSS。受控SDK400ms图片/600ms阅读反例则两次推进零暂停，demand确实暂停。普通预览没有生产限速。

## 自动迁移与验证

SDK defineSavedGameMigration在load内按精确source/target release执行：懒取旧Program，旧Core验证，冻结输入，目标Core完整验证，沿原freeze/dirty交接/资源准备/激活CAS提交；原槽及previous不覆盖，正常保存再写新版。只追加显式已读别名，不导回旧profile。取消、失败、retag-only及错误来源拒绝；模块程序/旧recipe/onLoad本阶段明确unsupported。

实例knownSaveMapper用生产Core重建明确旧32/93页的源切点，只沿已发生的问候选择，不伪造自然媒体完成。八语真实32/93候选和活动淡出共17项通过；实际旧32页IndexedDB→新版菜单读档、揭示/历史与原槽保留在本地/公网通过。当前93页发行版身份未改，正常读取即可；未来第一门入口的93页旧档迁移须等真实整章Program继续验。

实际实例pnpm check/build、3 Python+76 TS通过；最终实包本地4浏览器、公网4浏览器（两种策略完整序章、真实旧档、渐进OP）通过。此前同加载代码的额外网络检查覆盖语言隔离/慢网启动/失败重试/4类恢复历史；SDK CI同时全量184浏览器通过。前一11项公网批次10通过、旧档模拟快进抢先触发真实媒体握手超时；helper现等待实际启动回执后再快进动画，原15秒边界不变，单项复验通过。首次失败保留，不算生产提速。

## 发布与可复现性

公开预览Worker f64d04ca-eb5c-40c7-b06e-95e1db24e35f，回归Worker 529609c2-7d47-4541-bbb6-95bf3f087414。pnpm preview:check匿名核验68个前端文件6424255解码字节与本地dist逐字节相同，媒体Range通过，testsdk仍鉴权。原472个R2媒体身份没有改变，未重复上传或删除。检查曾捕获旧Program胶囊读取路径切换造成title.pb对象字段顺序不同；统一稳定字段顺序后重建、全量检查通过，未忽略差异。

compatibility/editions.toml登记16个历史Program摘要；pnpm compat:fetch实际取回并校验1376109字节，缓存到ignored private/compat-programs。之后pnpm build走离线缓存并复现同一预览字节。历史Program只供解释旧档；当前正文贡献入口仍为locales下PO，原KS/TJS/提取/媒体不进Git。新32页升级浏览器还需private/compat32真实发布媒体快照，缺失明确失败。

原始证据在ignored artifacts/loading-*、continuation-*、artifacts/remote/*、artifacts/ci-6ec5791.log。SDK完整历史审计发现606个既有.log blob/路径引用，全部已存在于此前远端26bc6a4；按用户“SDK保留历史”要求未重写，没有增加新日志/原作载荷。morgana仍单根提交并审计完整可达历史，无原LICENSE、原包/解包/二进制素材/日志/凭据。

## 尚未完成

F-01E继续in_progress。第一门八语PO→完整控制IR/正文续段和SDK ADR0052已实现，英文2478段（含自动结束段）；强制等待不被瞬显吞掉，700页回收/Unicode/IndexedDB页内恢复已验。完整动态角色/前后台组转场、逐轴运动、雨樱粒子、双BGM、章末sf.scenario1及原菜单隔离回放仍未接入，线上正文仍止于第一门之前。精确下一项见DOOR1_IMPLEMENTATION.md，不能把全文提取或前置引擎能力当整章交付。
