# ADR0025：图文保存切点、槽位系统和回执

状态：已实施并完成有限集验收，证据 evidence/g4-01/REPORT.md。G4-01 的有限支持集；不改变 Core opcode/等待 ABI。

1. 旧 `save(slot?, expectedRevision?)` 保留无图快照接口。新 `saveGame` 默认要求图文 capture，默认 UI/快捷键使用它。Core 是唯一保存许可来源。Player 与激活共用串行屏障，在稳定边界 freeze → Core.capture → 重绘/同步复制舞台和正文 → 栅格化。整个 capture 不混入后来正文、参数、主题或字体；随后 thaw，存储异步。捕获中取消/错误不提交；合法旧切点在后续禁存时仍可提交。自定义 TextRenderer 必须实现同步 capture，缺失明确拒绝，可显式选择无图。
2. PNG 固定 320×180、至多256 KiB；只合成图像舞台与正文，不含菜单/诊断。DOM 正文拷贝已计算样式、Ruby、揭示/效果、多窗口与可见滚动区域，字体内嵌。冻结时复制原生媒体当前采样帧；不承诺媒体采样点精确恢复。宿主自定义 HTML/外部 CSS 效果、伪元素/外部图像不在默认正文截图支持集内；不能把仅有舞台的图当完整截图。
3. 可选 SlotMetadata.capture 绑定 commitId/序号/逻辑时间/墙钟/正文摘要与缩略图；Snapshot 本身不含图片/偏好。当前和上一修订的图/元数据随各自快照同事务保存、备份和恢复。无图旧槽仍可读取。原子元数据操作支持 expectedRevision 的重命名/删除；上一修订可单独加载，不改槽或回写旧 profile。
4. 新 Store.commitSave/saveReceipt 为可选能力端口；图文系统缺端口明确 unsupported。提交 ID 与完整规范 payload 的 SHA-256（@noble/hashes 2.4.0）绑定、固定大小回执同事务，重试不能换 payload。回执丢失先核验；不可读取则 SAVE_COMMIT_UNKNOWN，保留 ID，retrySave 重试原 payload；不报成功或假称无副作用。保存提交不接管 activation head，也不回写旧 profile。dispose 后已提交仍返回 committed。
5. SavePolicy 有界手动槽1–24、循环自动槽1–8，默认12/3，自动保存默认off；on-prompt只在当前稳定 text/choice 切点捕获，读档不立刻覆盖自动槽。快速槽按 profile 隔离；自动/快速不覆盖别的分支。手动槽支持命名、覆盖确认、删除确认、上一修订及 UI。命名空间4 MB、备份总1 MB旧限制继续适用，超限明确拒绝，不截断图片。

验收：同切点正文/舞台、延迟存储后进剧情、捕获错误/禁存/迟到/失回执/并发修订/取消、真实 IndexedDB 刷新、两后端 PNG 像素/字体/Ruby、多窗口与严格 tarball 消费；旧门槛回归。大规模库/任意网页截图/图片编辑/云存档不在本任务支持集。

回执摘要依赖使用官方 SHA-256 子入口，不引入密码算法自实现；只允许 protocol/digest.ts 的两个确定入口通过 headless 导入约束，Node/浏览器同数据摘要对照。容量检查在写入前，避免写出下一次 parseDatabase 无法读取的超过4 MB命名空间。默认 quick 的独立导入进度标签保留，历史导入/刷新用例仍须通过。
