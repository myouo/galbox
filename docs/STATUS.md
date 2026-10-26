# galbox-sdk 当前状态

2026-10-26。G6-01有限支持集验收完成，下一G6-02；任务唯一状态见tasks.json。本轮分支feat/script-ui-state、基线7d71fb0，源码/任务/证据随本地提交保存；无外部推送/发布/部署。

ADR0029/SCRIPT_UI：版本化屏幕与label/image/button/toggle/range/input六种控件，纯表达式更新、UIWait准备/活动身份、Core统一字段提交和完整Snapshot恢复。生产DOM绘制、IME/过期节点/按键隔离、同切点图文捕获和原创《灯塔来信·值班面板》已可用。绘制失败明确暂停、拒绝不完整缩略图，逻辑保存可在新Player恢复。

最终check/206单元、116完整浏览器及最后4项UI复验（均0 skip/flaky/unexpected）、strict仓库外consumer、65 CLI、4 synthetic、性能/API和原生无WebGL dev通过。原生实测Canvas/六控件/单舞台，保存深度2表单，刷新恢复字段而保最新Profile。输入框→按钮焦点缺陷已修复并重验；最后UIAction身份前置检查保证旧回调不关闭后续Auto。证据 [G6-01报告](evidence/g6-01/REPORT.md)；before-focus-fix/带序号日志只为过程，source-manifest关联最后源码。

SDK SHA256 c71262d22a8936f3f7f46c0618c301e4b7b71dc0a2ce7104bcf8f28b274f3621，CLI c420c4df4801237f2ad53c27bb3230d77953275972cab0c356b1575049119c7e，仍本地0.1.0 alpha。标准无UI基准API P95 25.8ms、Core最重P95 1.515ms；不能推及64控件/大作品/移动真机，G7继续规模和既有性能增幅归因。

开发服务已运行：http://127.0.0.1:4173/?demo=ui，可加&renderer=canvas。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build，完整browser前停dev释放4173/4174。

下一G6-02：版本化作品皮肤/默认屏幕配置与系统动作边界，完成标题、菜单、设置、存读档、历史、流程图与鉴赏组件，实例仅给内容/皮肤；用原创皮肤和移动触控/键盘、焦点/滚动/跨控件松手及独立消费验证。G6-02/G7仍未完成；N/F/M6缺edition/Program/资源/真实原档附件/原作继续参照，不以fixture代替认证。
