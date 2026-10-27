# 真实迁移实验准备核验

2026-10-27，基线4765eb5。用户询问现有缺口及是否应提供游戏实验，本轮核对任务表、模块能力白名单、CLI构建入口、wire预算及Web交付文档。没有接收到新游戏，没有执行原版，也没有新增迁移/兼容完成声明。

现有CLI构建从受信任ESM Builder得到标准Program；实际旧游戏脚本转换器与原版存档codec/行为对照仍缺。N-01/F-01继续资料阻塞。现有模块路径只支持基础ADV/舞台/WAV等有限集，高级能力B2、I1国际化、C存储容量与W1-04离线/平台均未完成。单体高级功能的有限实现保留。

INPUTS_REQUIRED新增任意真实作品的小章节实验清单、分阶段存档输入与源脚本→Program→打包SDK→原作两路线对照流程。作品适配与实例仅在tests；原始资料放ignored tests/private或仓库外，SDK/Core不特判作品。未收到输入前继续I1等通用建设，不建假转换器。

实际验证：pnpm check:repository通过；git check-ignore确认tests/private的脚本和存档匹配；用临时独立Git index模拟强行跟踪private游戏文件，生产检查脚本实际拒绝，当前真实index未改变；git diff --check通过。原始日志在ignored artifacts/migration-readiness。仅更改仓库规则及接入文档，SDK运行实现未变，没有重跑或冒称重跑236单元/151浏览器。
