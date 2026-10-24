# galbox-sdk 当前状态

最后更新：2026-10-25。

本轮 M0–M2 初始引擎检查点已完成：TypeScript 生产 Core/协调器、有限 Schema/Builder、Pixi/DOM/Web Audio、IndexedDB/profile/head、Player/React 与可玩的原创《灯塔来信》。完整任务状态仅以 [tasks.json](tasks.json) 为准。

工作区初始只有任务包，没有 Git 元数据；新增正式主库、应用、原创发布数据、锁文件、CI 和测试。未创建提交或外部发布。代码依据为 [source-manifest.json](evidence/source-manifest.json)。

最近验证：frozen 安装与 check 通过；26 个单元测试、13 个真实 Chromium 测试通过；tarball 在仓库外隔离安装，skipLibCheck=false 类型检查、播放/保存/恢复通过。实际命令、范围和失败修复在 [本轮证据](evidence/2026-10-25-m0-m2.md)。本地包在 `artifacts/galbox-sdk-0.1.0.tgz`，静态目录为 `apps/playground/dist`。开发服务已在本轮启动于 `http://127.0.0.1:4173/`。

运行：`pnpm install --frozen-lockfile`、`pnpm exec playwright install chromium`、`pnpm dev`。完整命令见 README。本机 `/tmp` 配额满，测试/consumer 使用 `export TMPDIR=/dev/shm`；该限制已避开，没有阻塞本轮验收。

当前限制：整包资源预加载、短 WAV 的 replay/stop 恢复、基本 ADV 和绝对线性动画。M3–M5 尚未实施；移动真机/其他浏览器、性能预算、人耳体验和商业作品兼容未验证。N-01/F-01 的真实输入缺失继续保留为 blocked，详见 INPUTS_REQUIRED.md。

下一项可执行任务：M3-01。先读 C09、T05/T23/T24 与 M3 支持集，在现有 OperationSpec/Schema/显式帧上实现冻结的有状态操作登记、每 invocation 状态、初始化/恢复隔离和完整 SavedInvocation 迁移；使用实际公共工厂与失败原子性测试。随后接 M3-02 的 fixture-save@1，不能将其称作真实作品兼容。
