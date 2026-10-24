# SaveBridge：来源绑定与准备

当前 M3-02 提供来源/codec/mapping 正式工厂和不可变转换计划；M3-03 的候选 recipe 已实现，M3-04 的导入持久化和激活尚未因此完成。

- 使用 `galbox-sdk/port-kit` 的 defineSaveSource、defineSaveCodec、defineSaveMapping、bindOriginalSave。泛型从 codec 一侧锚定，保留 SourceKey、schema ID 和版本；状态还保持不变型，不能用同形来源或同族不同 schema 混接。
- 文件输入是平台中立的 `{name,bytes:Uint8Array}`。准备立即私有化 bytes；codec 通过 FormatContext 的 SHA-256 与严格 UTF-8 端口处理它们。Core 不读取 Blob/File/Node I/O。
- `binding.prepare(files,context,program,operations)` 返回 ready plan 或 needs-input/unsupported。prepare 不写存储、不暂停旧 Core、不播放候选媒体。计划绑定规范 Program 和同一个冻结操作表；替换目标后 materializeImport 会拒绝旧计划。
- plan.report() 只返回报告副本。`materializeImport(plan,program,operations)` 取得另一个数据副本，修改它不能改 plan。这个接口可用于检查候选，不能据此声称已导入或已接管。
- 支持名义数量 16 的文件包、单文件 4 MB、合计 8 MB；具体 codec 可设更小上限。诊断与转换等级不会省略未知格式或自动补齐缺失附件。

原创 fixture-save@1 的实现位于 fixtures/synthetic-saves/binding.ts。它严格处理 GBFX/version/LE 长度、64 KiB payload、SHA-256、必需 global.json、edition/locator/read revision。目标是《灯塔来信》的已登记选择位置，grade 为 semantic：原格式没有历史或精确媒体位置，报告明确说明。

用 `pnpm fixture` 重建公开样本；`pnpm test:compatibility` 运行真实合成格式负例并将 N/F 报为 needs-input。`pnpm test:compatibility --require-real` 在缺少原作证据时返回 2，不能把合成格式当作 NScripter/KAG 或商业作品认证。

独立打包消费者的 tests/consumer/binding.ts 另行登记自己的 synthetic source 与 mapping，证明公共工厂可被第三方使用。真实作品必须另外提供 edition、可用资源/行为、原档附件和原作继续参照。

M3-03：defineRestoreRecipe/prepareRestoreRecipe 在独立候选中执行有限步骤，准备计划保留 baseline/recipe，预演不会把计数提前写回 profile。禁止互动、媒体等待、循环和未授权扩展；任何失败均回滚。实际存储导入与每次激活钩子仍由 M3-04 接续。
