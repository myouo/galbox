# galbox-sdk 当前状态

2026-10-25。G0-03已完成有限支持集，完整常用GalGame G0–G7仍在建设。分支feat/numeric-collection-values，基线f981ecc，本轮本地提交见git log。未外部publish/push/部署/远程CI；tasks.json为完整状态唯一来源。下一项G3-01，其G0-02/G0-03依赖已满足。

新增i64/f64/null/list/dict：i64规范十进制和checked运算，f64以大端16hex保留±0/∞并规范NaN，集合有序/有界/值语义，显式查找kind/转换/比较与profile.expression。原生unknown入口在自有副本规范化，不改插件opaque args/state JSON；候选profile完整复制，批次嵌套值深冻结。规则见ADR0018、DATA_VALUES.md。

旧kind不暗转；完整内容迁移验证current/previous/profile闭包，真实集合经过调用帧/返回/恢复，operation args/resume ABI改变仍强制完整invocation迁移。失败赋值/扩展/候选不提交半个值、profile、RNG或已发布效果，旧档/旧会话保留。stored void/undefined、heap/ref、回绕与未列算子未启用，函数void不混作null。

递归AST多族使原allErrors错误聚合在失败kind分支指数重复，现strict=true/allErrors=false短路错误聚合，不改变Schema接受集合或完整语义链接；字典键使用既有正则形状加语义范围，生成物无CommonJS helper。readonly容器/品牌/元组与kind关联保持，未用双重断言或any绕过。

最终通过frozen install/check、127单元、51 Chromium（0 skip/flaky）、仓库外tarball strict/skipLibCheck=false/原生ESM与新数据/批次/备份恢复、54 CLI命令、4 synthetic、三个活动性能、API/pack/publish dry-run。证据evidence/g0-03/REPORT.md、日志/JSON/截图/source-manifest.json；早期中断/失败不算通过，最终以顶层结果为准。

SDK0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA=7f3cc79d1fb0e4fd998c7a02a39db9a568fbaa5621fda68838a83428c69a0a1c；CLI SHA=3034e05a62f3c1dbada1d0a0ba56e6596081716a6cc22988c6f3567b874fc35e，consumer/CLI/audit一致。相对f981ecc按入口计18新增/16声明变化，无导出删除；Snapshot wire version=1，values.extended限定新族，旧二进制不承诺前向读新值，不宣称稳定API。

参考性能：228次语义API P95 4.9ms、两帧观察P95 46.2ms、最重Core批次P95 1.531ms，三个活动销毁157.4/183.8/161.5ms，原500ms局部门槛通过。仅Linux/Chromium/SwiftShader/Web Audio，无视觉延迟/60 FPS、物理GPU/VRAM/真机/其它浏览器/音质/大作品保证，预加载/chunk/规模限制保留。

原创《灯塔来信·补给簿》在/?demo=data，同一Builder/Core/Player/IndexedDB真实执行12.5→10.25、9007199254740993→9007199254740994与物资/账本。当前dev已启动http://127.0.0.1:4173/?demo=data，UI保存/旧档/刷新验证保留最新账本、列表、3已读/解锁、1 canvas/实际音频/0 pageerror，见dev-result.json。重启export TMPDIR=/dev/shm、pnpm install --frozen-lockfile、pnpm dev；browser前停dev释放4173/4174。

下一项G3-01：完整二维舞台变换/转场/滤镜/并行任务，先定有限支持/冲突/恢复ADR，复用新数据基础，设备效果仍在Host，不按新变量重算旧任务。G3媒体/视频、G4图文存档/回溯、G5流程图/鉴赏、G6剧本UI和G7全面验收仍未完成。N/F缺edition/Program/资源/真实原档附件与原作继续参照，blocked独立保留；M6未完成，不以原创/synthetic冒充真实兼容。
