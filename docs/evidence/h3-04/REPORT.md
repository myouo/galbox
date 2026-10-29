# H3-04 / G1-05：回收与滚轮

2026-10-30。生产提交 95823ec/c69d144，实包 SHA256 57f43cd113cfd401d148c87307ad7fee1d3c643dd2a78d9dfbc02aaa5d79debc。ADR0070 定义边界，不改变 Snapshot/operation invocation ABI；InputPreferences/patch 新增可选 wheelMode tag8，旧字段缺失用作品默认，未声称旧 SDK 降级读取新偏好兼容。

AssetCache 仅回收 refs=0 的 ready 资源，保护当前静态前看集合；旧帧释放后延迟 2 秒，每批 2 项，让出事件循环。准备/加载/当前画面/活动音频/鉴赏/捕获租约不失效，eager/chapter 依引用保留；dispose 清理定时器。不清全局 Pixi 或历史、存档、profile。隐藏时只释放本实例 Canvas 合成池/临时数组，保留输出/back buffer，恢复先校验原预算再重建。未使用滤镜销毁本实例对象。HTTP provider 全量校验 Program 后只捕获资源目录/身份，不保留无用函数树。

真实实例三固定切点（同 browser/driver/backup SHA）静置后驻留估算：38353290→20512435、39359998→21519143、39679283→21838428 bytes；GC 后 heap：38203424→35006744、38821868→35897756、38886140→35823632。滤镜切点前台/后台/恢复工作面 14745600/7372800/14745600，旧版不降。正文/调用栈未推进，BGM 时间前进，真实图文保存恢复通过，无设备错误。不是浏览器总 RAM/OS 立即回收/数小时认证。

合成 10000 指令，独立 provider GC 保留量 2272180→476 bytes。新 HTTP 工厂的完整未知输入拒绝、目录隔离、版本漂移、断网、共享取消与释放反例通过。复现：node tests/tooling/profile-provider.mjs <旧 harness bundle>；原始数据在 SDK ignored artifacts/provider-retention。实例的固定真实存档/配对结果在其 ignored artifacts/wheel-memory，不随 SDK 分发。

352 单元、213 完整浏览器、check、consumer、compatibility、package 审计通过。wheel/cache 第一阶段另有 CLI69/release；provider 缩减后重验32定向、213全量及consumer/package。包括空闲回收后的像素/旧档重载、前看保护、后台 Canvas 恢复/缩略图、逐次滚轮/在途不排队、手势惯性和菜单/读档尾部、输入隔离、URI身份与原版校验。

实例18界面、最终11 provider实包浏览器、90 Node+3提取器、9公网通过；快速序章95次，默认4页、180ms/750000Bps、阅读100ms，P95约440ms，资源暂停/媒体waiting均0、最大66692315<67108864。公开预览/Worker/R2不加限速。程序/910媒体不变。

G1-05仍进行中：本作已消费step默认与gesture偏好，历史到底/150ms返回、存读档循环翻页、顶层右键取消及历史正文40源像素起点；原config已读字速/nonstop、历史富样式/姓名与阅读隐藏仍未完整消费。F-01F八语前置间章79–80、第二门含尾间章3672–3682段IR保留全部控制/标签及后续跳转，不是已编译可玩。先补有限源控制/演出和W1-03B2，不抬预算/不引入旧VM。原生tft和真机仍未认证。
