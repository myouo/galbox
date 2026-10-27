# E1-01：仓库边界与正式 protobuf

2026-10-27，基线 9e0b41f，feat/program-modules。本报告对应工程治理与正式二进制传输；没有重写 Git 历史、推送或实际发布。

## 工程事实

按 Git 文件逐个统计换行：基线有 641 个 JSON、331,390 行，其中 docs/evidence 为 297,493 行。清理后为 19 个 JSON、约 2,800 行，主要是 package/tsconfig、任务表和少量旧格式测试输入。当前被跟踪日志为 0，docs/evidence 非 Markdown 文件为 0。标准 tokei 也只统计这 19 个 JSON。统计包括新迁入测试的旧 CLI 输入，没有靠排除手写源码获得减量。

原始证据停止跟踪，保存在本地 ignored artifacts/legacy-evidence（约 105 MB）；历史短报告保留，历史 Git 对象没有删除。新日志、结果 JSON、截图、trace、CPU 数据和散列清单只在 artifacts 或 CI artifact 中保存。新 clone 需要重跑命令或获取 CI artifact，不能把旧报告当成本轮重验。

全部游戏与验证应用位于 tests：player-app、fixtures/game-data、fixtures/cli-template、tooling。CLI 正式模板仅有空 Program 骨架、YAML 配置及资源目录，不含游戏；测试显式注入旧游戏 fixture。根仓库和 CLI 新项目均忽略日志。check:repository 同时检查跟踪文件及真实 ignore 匹配，纳入 pnpm check。

协议单一源改为 protocol.yaml，稳定字段/union tag 显式保存；生成 TS、validator、protobuf IDL 与紧凑映射。可重建 TS/validator 不再入 Git，prepare/build 生成，check:generated 仍作真实只读比对。正式构建先清理自己的 dist，关闭 source/declaration map 并压缩 JS。

## 正式传输和包边界

galbox-sdk/wire 提供强类型 encodeWire/decodeWire。实际 protobuf message/oneof/presence 保留精确数值、空容器及缺失差异；没有把 JSON 字符串包进 bytes。模块文件/清单、CLI 默认 Program/release、默认备份/设置下载使用 .pb，旧 JSON 只作兼容输入。标准 protobuf 工具从发布 IDL 解码再编码的互通测试通过；坏 UTF-8、重复 envelope、错误类型/版本、截断及预算反例均拒绝。

Core/Coordinator/Host 同进程用强类型 DTO 和串行事件，IndexedDB 用 structured clone。没有每条指令二进制往返，也没有新增 Worker/FFI。引擎逻辑字符预算和语义摘要仍可用 JSON 计量，不代表正式网络传输使用 JSON。

SDK 通过 14 个精确 exports 提供入口，含 player/core/port-kit/react/wire；禁止私有通配路径。实际 tarball 审计为 226 文件、495,530 字节压缩，3,460,026 字节解包。包中没有游戏、测试、证据、日志、source map 或 JSON Schema，仅 package.json 是 npm 元数据。基线解包约 19.64 MB；其历史证据和游戏本来也没有进入 SDK 包，但当时确实发布了大型 Schema 和 maps。本轮移除这些内容。

## 验证位置与范围

- artifacts/hygiene/frozen-install.log：frozen lock 安装与 prepare 生成通过。
- check-final.log / unit-final.log：类型、生成、headless/设备/仓库边界；36 文件 236 单元通过。
- final-browser/run.log / browser-results.json：最终完整浏览器 151 项通过，无 skip/flaky/unexpected。
- accepted：独立 tarball 消费、CLI 空骨架及兼容 fixture（最终 69 命令）、包审计、严格声明/API 对照和发布 dry-run。包散列以该目录最终机器结果为准；actualPublish=false。
- native：原生 --disable-webgl、390×844 触控模拟，实际分支/图文保存/刷新恢复、protobuf 设置下载及未选模块不请求，0 pageerror。
- accepted/performance.json：软件 WebGL，3 活动周期/228 输入，API P95 21.5 ms，Core 批次最大 P95 约 1.207 ms，dispose 最大约 186.2 ms；原 50/4/500 ms 门槛通过，0 pageerror。CLI init 的后续忽略规则修复不改变这条 SDK 执行路径。

曾有 protobuf 备份下载后临时重传文件名无法识别的问题，已改为按内容选 codec；相关 17 项及最终完整 151 项均通过，失败过程仍在 ignored artifact 中。

实包检查另外发现 CLI 的 .gitignore 被包工具排除：已改为普通 gitignore 文件随包发布、init 时改名，并创建 public 目录。新增已安装 CLI 生成第二个空项目的验收与 tarball 忽略规则检查；源码模板检查不能替代它们。

这些结果不代表 i18n、高级模块闭包、离线/目标平台和真实两作认证完成。test-only 验证应用主 JS 约 3.246 MB、gzip 468 KB，较先前约 406 KB gzip 增长；SDK tarball 缩小不能被说成首屏网络性能已经改善，W1-04继续处理冷启动与拆包。

复跑：pnpm install --frozen-lockfile；pnpm check；pnpm test；pnpm test:browser；pnpm test:consumer；pnpm test:cli；pnpm test:package；GALBOX_API_BASELINE=9e0b41f pnpm test:release。原始结果默认进入 ignored artifacts。状态唯一来源为 tasks.json。

最终独立 consumer、69 CLI、release dry-run 与实际包审计的散列一致，consistency.json 已核对：SDK 46795746316cb7a8e66a0f10912e928b0bd278f3332ce0add20e315aff163ba5；CLI 3b5cc5d1448fc1b53825e5570fa06b464954944f33c359536e3047f6a8208a7a。源码及证据索引只保存在 ignored artifacts/hygiene/handoff.json，不重复提交整份生成清单。
