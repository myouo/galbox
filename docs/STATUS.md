# galbox-sdk 当前状态

2026-10-27。G6-02有限支持集验收完成，下一G7-01；唯一任务状态见tasks.json。本轮分支feat/game-interface-skins、基线6a22ca1，源码/任务/证据随本地提交保存；无外部推送、实际发布或部署。

ADR0030/INTERFACE：Program.presentation版本化安全皮肤/字体/标题图像/标签/工具栏，真实工厂与只读投影；Player系统页面/导航代次、完整GameUI和旧作品兼容布局、共享按压规则、分页/焦点、移动表单与比例缩略图。新CLI模板使用默认配置，原创《灯塔来信·远航》的两皮肤共用执行定义/资源/存档。返回标题保留当前运行，切页清理预览，迟到导航不能覆盖新页面；未提交进度恢复/无图保存入口保留。

最终check/211单元、122完整浏览器+8项最终UI复验（0 skip/flaky/unexpected）、strict仓库外consumer、65 CLI、4 synthetic、性能/API与原生无WebGL移动dev通过。后补的GameUI配置前置、菜单快捷键和恢复入口有最后UI/新包验证；CLI诊断迁移到测试夹具的公开PlayerView读取，原有断言保留。实际证据 [G6-02报告](evidence/g6-02/REPORT.md)，source-manifest关联最后源码，before-final-menu/带序号日志是过程。

SDK SHA256 0f6d8158fb4e2885ee7b06ae5f7d3210ee688215bc54841d49b2eab2b7954bad；CLI 1cddf7c26ee098dc7e954da685b740c473d787768bbf45c009787262715fc5da；仍本地0.1.0 alpha。标准无皮肤基准API P95 23.9ms、Core最重P95 1.751ms，不代表新UI/移动/大作品性能。测试根显式依赖已有同版本React/ReactDOM19.3.1，lock与frozen install已验。

开发服务已运行：http://127.0.0.1:4173/?demo=interface；加&skin=paper切皮肤，加&renderer=canvas强制兼容绘图。重启export TMPDIR=/dev/shm；pnpm install --frozen-lockfile；pnpm dev。构建pnpm build；完整browser前停dev释放4173/4174。触控证据是Chromium模拟和原生Canvas路径，不是移动真机认证。

下一G7-01：先定义综合原创切片与可测规模矩阵，组合所有通用有限支持集，覆盖真正网络流、WebGL/无WebGL、自动/快进/输入与UI交错及独立安装；分组测量历史投影/捕获/持久事务/UI成本，验证10000历史条目/4MB等边界并跟进G4以来性能增幅。N/F/M6仍缺明确edition/Program/资源/真实存档附件/原作继续对照，不能以fixture替代认证。
