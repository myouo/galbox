# ADR0035：函数级程序模块与执行依赖准备

2026-10-27，W1-03B，基线9e0b41f。有限v1仅支持基础ADV、call/return/branch、i32/bool/string、基础stage/audio/tasks/profile及静态presentation；高级UI/流程/鉴赏/富文/扩展等模块明确unsupported，单体Program继续支持既有全集，B2跟踪扩展。

1. Schema生成模块清单、函数声明、代码载荷与快照绑定。真实compiler先链接完整Program，再按作者分组输出protobuf及实际字节数/SHA256（按后续ADR0036确定）；清单仅含header、函数接口/全局唯一锚点和模块摘要，不含未加载函数体。
2. partial linker以明确外部函数声明检查call参数/返回类型，仅检查实际给出的函数体，不伪造stub/opcode。Core接收经真实工厂登记的ModuleProgram对象，初始必须准备entry模块。执行到未加载call之前返回原预算yield并声明需求，不改变PC/变量；Coordinator通过中立端口异步准备，再续跑同一轮，保存/flush禁止，旧呈现视图保持。
3. 代码使用与资源使用分开。默认仅按实际call取模块，未选分支不请求；每个Core只记录自己用过的模块集合，不把其他候选/缓存加载过的代码当成自己执行过。初版已用模块不淘汰、总内存/输入预算保持；不宣称无限大程序。
4. 快照绑定完整清单摘要及本Core模块集合。恢复先按该闭包加载并校验所有模块，再用同一Core恢复函数帧/返回点/任务；改变清单或缺失绑定明确拒绝，旧档保留。跨格式迁移、模块版portable backup/SaveBridge/recipe初版不启用，必须显式unsupported，不能静默漏闭包。
5. Web代码provider返回身份关联的字节lease；取消race、迟到归还、私有字节、UTF-8/长度/SHA/Schema/接口/锚点与链接逐层验证。失败不安装半份代码，不重跑输入或猜选择。代码缓存安装不是剧情提交，实际执行由Core决定。
6. 模块release沿用资源事实/registry/完整Program producer摘要，并额外以模块清单摘要绑定运行。消费者不把尚未下载的整体Program摘要冒充已重新计算；每个已取函数体按独立摘要和声明验证。UI显式标记module-manifest来源。

验收：实际浏览器HTTP请求在entry/choice/call/restore阶段逐项记录；未选分支不下载；嵌套调用返回、运行模块取消/错误/重试/字节与ABI不符、旧输入单次消费、跨刷新/跨模块保存、原生Canvas和独立包。强类型/传输/i18n审计报告另记事实，未实现i18n不得称支持。
