# W1-24 当前正文历史展示（2026-11-05）

ADR0123：HistoryPolicy新增可选includeCurrentText（protobuf字段5），默认关闭。
Core只从当前合法正文提示的原指令推导currentHistoryText；recordHistory:false
保持抑制。Player经既有HistoryJournal投影一条未确认记录，仅显示revealed部分，
不追加Snapshot.history、不产生已读、确认、语音回放或持久journal/回溯切点。
该记录计入原显示上限，确认后只保留普通记录；非正文提示不推测行缓冲。

默认UI遵守部分揭示，并隐藏未确认记录的回放/回溯动作。Core/持久Snapshot/
模块来源预算及旧默认行为均不改变。原作500/2000行缓冲、跨段追加及字体
计量属于消费者后续工作，不以此声明完成。

实际命令（SDK根目录）：

- `pnpm test`：100文件/473项单元通过，0失败，包含wire/default/非法值、源抑制、部分字素、只读/冷恢复、确认去重及单条显示上限。
- `pnpm check`：生成一致性、完整与headless严格类型、导入/仓库边界通过。后续浏览器fixture更正后`pnpm exec tsc -p tsconfig.json --noEmit`再次通过。
- `pnpm build`、`pnpm build:harness`：通过。
- `GALBOX_EVIDENCE_DIR=artifacts/evidence/current-backlog pnpm exec playwright test tests/browser/current-backlog.spec.ts tests/browser/history.spec.ts tests/browser/history-only.spec.ts`：既有历史/语音/回溯/历史专用文本7例通过；新fixture起初错误启用模块默认rollback而被正确拒绝。
- `GALBOX_EVIDENCE_DIR=artifacts/evidence/current-backlog/final pnpm exec playwright test tests/browser/current-backlog.spec.ts`：新例最终通过（3.5秒；整命令12.6秒）。首次更正后又纠正了测试的菜单入口：StoryUI使用实际历史按钮，不能把GameUI的systemScreen当作其本地选项卡或在打开的模态层后点击工具栏；未放宽产品验证或强制点击。
- `pnpm test:consumer`：实际tarball隔离安装、严格声明、headless与真实浏览器消费通过；新增current-backlog用公开工厂验证抑制/未读/当前展示、真实保存重开和确认去重。

新浏览器以实际Core的20ms/已揭示2字切点进入真实IndexedDB，再由Player读取，
默认UI显示AB而不暴露CD；保存缩略图真实存在，当前Snapshot/已读不变，journal
仍0条。关闭连接、刷新并重开后相同部分正文可继续，确认后仅一条普通历史。
截图已经实看。原始trace/JSON/截图留ignored artifacts/evidence/current-backlog，
完整命令日志在独立消费者工程ignored artifacts/startup-optimization。

这不是原档互通或整个作品历史缓冲认证。消费者须安装实际新包并验证旧槽，
不得用SDK源码别名消费或在作品中复制投影逻辑。
