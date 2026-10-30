# G1-05：原作设置、取消与消息隐藏

2026-10-30，生产1210638/8d19155，ADR0067/0071/0072。独立实例消费实包7936d45c910b7a7f5a595ddde2553a0f4bd35197950a2acaf43d481b4db2294d；不复制SDK引擎。G1-05在以下有限支持集完成，F-01F继续。

新增readIntervalMs（-1继承）及普通/已读可忽略确认开关；当前持久profile决定已读策略，旧设置补默认，旧快照不回写偏好。普通开关同样作用于已读；required confirm、已采样字符等待和页末真人输入保持。HistoryText公开静态富文本展示，不驱动Core。

独立PresentationAssetCatalog最多128张图片与一一对应事实；禁止覆盖Program资产。隐藏替代和原剧情共用ResourceLoader/AssetCache与原预算、摘要/尺寸/事实、取消及租约保护。字节provider识别附加图像，stream身份仍只取原Program；不改变Core/profile/解锁/存档签名。eager原剧情租约保留，释放的临时图允许闲时回收。回放继承已拥有目录；首次step仅恢复；捕获仍正常图。

实际命令（SDK子模块目录）：

- `pnpm check`生成一致、主/headless严格类型与导入/提交边界通过。
- `pnpm test`：362单元。新读速/确认/富历史/目录正反例、旧快照游标、prompt计数溢出前置拒绝。
- `pnpm build && pnpm build:harness`，`GALBOX_EVIDENCE_DIR=artifacts/interface-completion/full pnpm exec playwright test --output artifacts/interface-completion/full-results`：217全浏览器通过，12.4分钟；无skip。含真实IDB读速/旧图文档/刷新、变体像素、音乐/动画继续、取消迟到租约恰好归还、坏摘要/事实/驻留不足保留切点、临时图闲时释放。
- `pnpm test:package`：268文件590928压缩字节，白名单无游戏/日志/证据/Schema源码。
- `GALBOX_EVIDENCE_DIR=artifacts/interface-completion/consumer pnpm test:consumer`：真实独立包安装、skipLibCheck=false、headless及浏览器播放/保存恢复/备份通过。合成compatibility通过，原档未认证。
- `GALBOX_EVIDENCE_DIR=artifacts/interface-completion/provider node tests/tooling/profile-provider.mjs`：Chromium156万指令provider额外持有496B，延续仅保留目录的有限结果，不是OS/GPU总内存保证。

独立实例本轮八语完整第一门/解锁/切点重验及24个Program/release/文本目录字节不变检查通过。Node首次91/92，旧菜单断言未认识新增布局；补实际布局/PNG/摘要覆盖后两项定向通过，92个唯一用例与3个Python取得通过结果。21个唯一浏览器用例通过，包括原设置/读档/历史/滚轮、双语旧整章槽和真实源回放隐藏且主进度不变。日/韩并行首轮标题准备超时，保持原断言及时限单独通过；回放驱动先误用禁存标题capture、未走完OP，后改只读PlayerView和原任务剩余时间，未降低产品断言。实例详细证据及公网版本见仓库外docs/evidence/INTERFACE_COMPLETION.md。

F-01F已有八语完整IR，新增有限源条件→标准SDK分支编译及32种profile/预算一致性；动作仍为计数标记，不算第二门演出已经可玩。memory1支线、新演出和高级模块组合待续。原生tft/像素、真机长期/多浏览器/两作原档认证独立，均未借此标完成。原始日志/截图/trace仅ignored artifacts，不入包/Git。
