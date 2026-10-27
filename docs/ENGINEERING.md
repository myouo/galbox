# 引擎源码、测试实例与发布边界

用户纠正后的规则：仓库交付引擎，所有实例游戏只归测试。原始运行结果不属于源码。规则由.gitignore、check:repository和实际tarball检查共同约束。

| 位置 | 内容 | 是否进入SDK包 |
| --- | --- | --- |
| packages/galbox-sdk/src | 引擎生产实现 | 编译产物进入 |
| packages/galbox-sdk/schema/protocol.yaml | 单一源定义及稳定protobuf tag、校验约束 | 否 |
| packages/galbox-sdk/protocol/galbox.proto | 生成并检查的正式protobuf IDL | 是 |
| tests/player-app | 浏览器验证应用 | 否 |
| tests/fixtures | 原创游戏、测试素材、CLI游戏fixture | 否 |
| tests/tooling | 验收、消费、性能测试运行器 | 否 |
| scripts | 生成、编译、打包边界检查 | 否 |
| docs/evidence | 简短Markdown结论 | 否 |
| artifacts | 原始JSON/日志/截图/trace/包，全部ignore | 否 |

先前334k量级JSON主要来自重复提交的浏览器结果、API清单、散列清单和历史运行证据。旧原始文件已移动至本地artifacts/legacy-evidence，停止Git跟踪；没有重写历史。旧报告的相对原始路径可在该归档中按目录查找。以后CI上传artifact，源码只保留结论。

游戏Program/发布副本由测试Builder生成，tests/player-app/public与测试生成JSON被ignore。source/generated目录在prepare/build生成，不入Git；check:generated仍执行真实只读比对。正式构建清空自身输出目录，关闭source map/declaration map并压缩JS，防止旧文件残留进入包。

SDK仅白名单发布dist、protobuf IDL和README。npm必须的package.json保留。pnpm test:package会实际打包并拒绝游戏/测试/日志/证据/schema JSON/source map泄漏；不能用源码目录检查代替包内容检查。CLI init只创建空引擎骨架，游戏模板由测试显式注入。

CLI模板的忽略规则以普通文件gitignore随包发布，init时改名为.gitignore。包工具会排除直接命名的.gitignore；实包审计和已安装CLI初始化测试必须同时验证，不能只读源码模板证明交付。

当前JSON文件中仍有package.json、tsconfig、任务表及少量旧格式测试输入，它们分别属于工具元数据、项目状态或兼容测试，不是传输协议或游戏载荷。没有用tokei排除源代码来制造减量；忽略的是可重建产物与原始日志。
