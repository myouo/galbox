# G4-01：作者声明的自动存档点与字体继承

2026-10-28，代码提交da7a077c63527cc67b94ffd5739f16ff4bb27dc4，分支feat/chapter-runtime。ADR0049声明SavePolicy.autoAt：最多256个唯一text/choice地址；缺失/非提示点拒绝，省略保持旧行为、空数组不匹配。模块程序仍显式不支持该过滤器。旧protobuf可读，旧字段号码不变。

选择提示自动存档仍经过正式冻结/合法切点/同切点截图/原子提交/activation head流程，读档不再次覆盖。text window根节点在无正文和结束时仍继承已准备主题字体，供历史等系统UI使用；不改变正文/Core权威。

实际验证：pnpm check通过；pnpm test为46文件289用例；autosave-points、text-font-root及保存相关浏览器10项通过（artifacts/prologue-font/browser-results.json，2026-10-28T13:39:51Z）；pnpm test:consumer通过strict独立tarball播放、保存、恢复和备份。包SHA256=fc5c2315f4ce7073daba0e5287065c74eb9e0fedd844045e4917be42354ea441，公开exports消费，无游戏/日志载荷。

该代码的GitHub CI run40700039576已完成，check及五个browser分片全部success。没有仅凭局部测试宣称主线已合入；主SDK工作区的并行修改不在此分支。原始记录保持ignored，报告只提交短Markdown。

独立作品用此策略映射其实际声明的选择存档点；来源无指令的语言保留差异。作品完整章、原回放、原档兼容另验，不以此SDK策略完成代替。
