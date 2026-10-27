# galbox-sdk 当前状态

2026-10-27，基线9e0b41f，分支feat/program-modules。本轮E1-01与W1-03B基础有限集已实现并验收；任务表下一项I1-01。父W1-03、高级模块B2、热记录C、离线/目标平台W1-04及G7总体仍未完成，不把本轮当作完整大作品交付。

工程：所有游戏/验证应用/运行器分别在tests/fixtures、tests/player-app、tests/tooling。CLI正式模板为空Program骨架，YAML配置，默认program.pb。原始日志/JSON/截图/trace与散列只在ignored artifacts，历史原始材料在artifacts/legacy-evidence；docs/evidence只跟踪短Markdown。生成测试public及TS/validator在prepare/build重建并有一致性检查。当前19个受控JSON约2800行，0受控日志，历史Git对象未重写。check:repository实际验证跟踪文件与ignore规则，test:package检查tarball。

协议：protocol.yaml单一源记录稳定protobuf tag，生成TS/validator/IDL/映射；galbox-sdk/wire实际protobuf，代码模块/CLI默认发布/备份/设置为.pb，旧JSON兼容输入。Core/Host内部直接强类型DTO，IndexedDB原生structured clone。SDK有14个精确exports，包226文件/495530字节压缩/3460026字节解包，无游戏/测试/证据/日志/schema JSON/maps。CLI忽略规则以普通gitignore随包发布、init改名为.gitignore，已安装CLI实际验收，避免包工具丢失点文件。

实际验证：frozen install；最后pnpm check；36文件236单元；完整151浏览器（0 skipped/flaky/unexpected）；仓库外tarball/native ESM/strict skipLibCheck=false；69 CLI命令及空骨架/兼容fixture；4 synthetic（N/F仍needs-input）；14入口/0删除的API与pack/publish dry-run（未实际发布）；3活动周期228输入的性能门槛通过（API P95 21.5ms、Core最大P95约1.207ms、dispose最大约186.2ms）。原生禁用WebGL的390×844触控模拟完成分支/图文保存/刷新恢复/设置pb，root,sea,logic,root,sea请求且无interior、0 pageerror。原《灯塔来信》的实际图片/WAV/并行组也经相同模块compiler保存恢复。

短证据：evidence/e1-01/REPORT.md和evidence/w1-03b/REPORT.md；原始结果artifacts/hygiene/{check-final.log,unit-final.log,final-browser,accepted,native,native-default}，源码/证据索引handoff.json。最终consumer/CLI/release/package SDK SHA=46795746316cb7a8e66a0f10912e928b0bd278f3332ce0add20e315aff163ba5，CLI SHA=3b5cc5d1448fc1b53825e5570fa06b464954944f33c359536e3047f6a8208a7a，已交叉核对。曾有备份临时文件名识别和CLI .gitignore打包丢失，均修复并真实复验。旧报告仅保留历史结论。

运行：pnpm install --frozen-lockfile；pnpm dev在127.0.0.1:4173运行tests/player-app，?demo=modules&renderer=canvas为模块测试。pnpm build构建SDK/CLI及测试应用；业务项目从实际tarball的player/core/port-kit/wire/react等入口导入，不复制测试游戏。TMPDIR=/dev/shm用于当前环境临时目录。只做本地提交，未推送/发布/重写历史。

精确下一步I1-01：先记录locale/语言回退/目录及正文TextId/Revision/ReadUnit规则的ADR，再演进偏好Schema与迁移，接默认UI并验证跨刷新/旧档和protobuf；当前Preferences v2没有locale，i18n尚不支持。B2补齐高级模块恢复闭包；C处理热记录留存/容量；W1-04处理持久缓存/离线与冷启动拆包。测试应用主JS gzip约468KB，比此前约406KB增长；包变小不能代替首屏性能验证。Firefox/Safari/移动真机及真实两作资料仍缺证据，不借用Chromium模拟结果认证。

续核验（基线4765eb5）：用户考虑提供真实游戏实验，目前尚未收到。INPUTS_REQUIRED已补最小章节/原作参照清单；tests/private已ignore且门禁拒绝强行跟踪，验证见evidence/migration-readiness/REPORT.md。原游戏脚本→Program转换器与真实原档codec仍缺，接收其他作品可另建测试迁移任务，不替代N/F认证。SDK运行代码未改变；本次只验证仓库边界/ignore正反例及diff，不冒称重跑旧全套测试。I1-01仍是下一通用实施项。
