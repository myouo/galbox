# M4-03：独立开发者完整任务

2026-10-25；cwd /home/myo/Desktop/galbox-sdk；基线 91ec213。Node 24.15.0、pnpm 11.28.5、TS 5.9.3、Vite 8.3.5、Chromium 156.0.8078.4；TMPDIR=/dev/shm。源码摘要见 source-manifest.json。

## 实际交付

在仓库外含空格目录，用已打包的 SDK/CLI 初始化并安装标准项目。开发者只通过公开工厂：

- 增加第三条“写一封新的回信”路线与 mailUnlocked。
- 登记 signal v1/v2，args/state/resume 都变化，用完整 invocation 迁移恢复旧等待；没有重跑 v2 initialize。
- 增加自制 developer-synthetic@1 codec/binding 和有限加载 hook，CLI 原档分析/候选验证不写存储。
- 扩展 TSX 信号按钮，在按下时捕获 result/epoch；释放才提交，菜单/暂停取消旧动作。
- 用来源诊断定位坏 args 到 main:signal、story.mjs:9:1；必要 mapping 缺失阻断发布。

## 实际命令与结果

命令使用 GALBOX_EVIDENCE_DIR=docs/evidence/m4-03；全部正向命令退出 0：

- pnpm install --frozen-lockfile。
- pnpm check：SDK/CLI 严格编译、Schema 生成一致性、无 DOM/Node headless 和导入边界。
- pnpm test（JSON reporter）：9 文件/54 测试，无 skip。
- pnpm test:compatibility：4 个 synthetic 组通过，N/F 分开报告 needs-input。
- pnpm test:cli：40 个真实子命令与两个真实浏览器工作流；初始/frozen 安装、严格 checkJs/TSX（skipLibCheck=false）、资源发布、静态构建、dev HTTP；基础项目保存/刷新恢复、扩展项目保存信号等待/刷新恢复、自制来源导入、信号完成、第三路线解锁、真实图像/WAV。
- pnpm test:browser：19 个 Chromium 引擎回归全部通过，无 skip/retry，包含实际 IndexedDB/媒体/导入、dirty 交接与 head owner 故障。
- pnpm test:consumer：独立 SDK tarball 类型/运行/保存/恢复/扩展/完整调用迁移/来源导入/recipe 全部通过。

原始日志与机器结果在本目录。commands.json 保存所有子命令、cwd、真实退出码与输出；result.json 的 developerTask 各项均 passed。测试成功后删除临时安装目录，记录 realpath 证明它在 /dev/shm 而非 workspace。template.png/developer-task.png 是真实页面，不能替代断言。

## 负例与证明范围

错误参数的已发布 JSON 被 runtime CODEC_VALUE 拒绝并准确定位；同一错误写入项目模块时，实际安装声明令 tsc 退出 2；修复后重新通过。删除完整迁移时旧档明确拒绝，原 v1 文件 hash/内容不变。文本 revision 改变同样拒绝，不造 fallback。缺必要行为 mapping 时即使 Program 可链接，也不能 validate/build。

CLI 同时验证非空 init、坏 SHA-256、资源路径逃逸、未知命令/错误选项、internal 缺 profile、无来源/歧义或不支持输入的非零结果。上述失败均被明确断言，而不是 ignored/skipped。

模板测试曾早于自动进度回执刷新，恢复已读缺失；现按 fixture 规则等待 dirty 清零再刷新，保留原已读断言。此前实现问题包括 pnpm 11 overrides 位置和 ESM import-only 解析，已在 M4-01 中修复并由本次完整工作流重验。没有降低 strict、any 或强制断言。

T11/T15/T24 与 packed-consumer-full 仅证明当前标准状态/工具/声明覆盖；originalReference 始终 not-verified，未声称原作继续对照。无远程 CI/npm 推送或发布。软件 WebGL/单 Chromium 并非真机/其他浏览器/人耳/性能预算认证；M5 和 N/F 的义务继续保留。
