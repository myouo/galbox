# 验证证据规范

本轮：[E1-01 工程边界/protobuf](e1-01/REPORT.md)、[W1-03B 基础程序模块](w1-03b/REPORT.md)。任务完成状态以 tasks.json 为准。

这里只版本控制简短Markdown报告。原始日志、浏览器JSON、截图、trace、CPU数据、打包产物和源码散列清单都在本地生成并被.gitignore忽略；CI通过artifact保留。它们不属于引擎源码，也不进入SDK包。

历史报告保留实际命令、结论与限制。报告引用的原始文件在本地仍保留，新的clone需重跑相应命令或获取CI artifact。历史Git对象未重写；当前版本不再跟踪这些生成载荷。

新实现的done仍需实际验收，结果写入简短REPORT.md；不要为每次运行再提交一整份JSON/日志副本。

早期验收结论保存在[ARCHIVE](ARCHIVE.md)，原始材料只归档，不改写为本轮结果。
