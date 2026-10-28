# 强类型、数据传输与国际化核验

核验基线9e0b41f，本轮W1-03B代码与实际命令结果见evidence/w1-03b。这里区分编译期类型、运行时校验和尚未实现的能力。

| 问题 | 当前事实 |
| --- | --- |
| 是否强类型 | 生产TS启用strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes；Schema生成wire类型与validator，真实opcode工厂保留参数分支，变量/值、表达式、资源kind和扩展注册有类型约束。工程扫描拒绝显式any/双重断言；独立tarball消费者另以skipLibCheck=false检查公共声明。 |
| 类型的边界 | createPlayer接收unknown是外部数据入口，之后必须Schema和链接。函数ID、地址及部分低层Operand为动态字符串/联合DTO，TS不能证明所有跨ID关联；例如不存在的callee在真实linker拒绝。不能把strict说成所有错误都在编译期发现。根工程skipLibCheck=true，不应宣称逐项检查所有第三方声明。 |
| Core/Coordinator/Host | 同一JS进程中的强类型方法、事件联合与效果DTO；Core同步执行，Host回调入串行队列。没有每条opcode JSON编解码、WASM FFI、Worker消息或共享内存。浏览器任务队列用于让出主线程。 |
| 网络程序数据 | 正式Program/模块/快照等支持protobuf，以Uint8Array lease传输并校验身份、长度、SHA、Schema、函数接口/锚点和链接。新默认传输由galbox-sdk/wire实际protobuf编解码，旧JSON仅显式兼容。 |
| 图像/声音/影片 | 资源provider的字节lease、Blob/object URL或显式版本URL媒体流；完整摘要与versioned-url等级分别报告。设备句柄不进入Core快照。 |
| 保存与持久化 | Snapshot/可携带备份为强类型DTO，正式导出为protobuf；IndexedDB使用原生structured clone对象与同事务记录，JSON仅保留在旧格式兼容、语义摘要和字符预算中。 |
| i18n设置 | Preferences v2新增可选locale；LocaleCatalog声明默认/别名/显式回退。ADR0042提供有限title/page/rich/choice文本拆分和强身份绑定，正文/界面目录均可protobuf传输。默认UI完整翻译、运行中换语言与章节文本流尚未完成。 |
| 哪些模块按依赖加载 | 新增的基础剧情代码模块按实际跨函数call加载，快照记录本Core用过的模块。图像等资源沿四种独立策略加载。SDK/Pixi/React的JS功能包仍主要由Vite打包，不能把代码分块或文件分目录都称为按执行依赖加载。 |

实际类型反例在program-modules.test中通过真实instruction/set/ProgramBuilder工厂验证：错误opcode参数和变量值编译失败；动态callee不存在则链接失败。模块版createModulePlayer要求真实ModuleProgram对象，其运行时身份由工厂登记；字节provider伪造moduleId的负例在浏览器中验证失败并归还lease。只读投影、输入副本和效果副本保持所有权隔离。

按需加载证据是浏览器真实请求，而非仅查看缓存字段：启动root.pb，选择海岸才取sea.pb，后续嵌套调用取logic.pb；interior.pb即使被拦截为不可用，也没有请求。刷新读取较早海岸存档时只取root+sea。模块文件内部是整体下载，单个大函数内部的分支也不会自动拆成子块；作者分组决定粒度。

初版模块支持基础ADV/control、简单值、基础stage/audio/tasks/profile与静态presentation。高级媒体、富文、剧本UI、流程图/鉴赏、扩展及模块版recipe/备份恢复明确unsupported，单体路径继续支持原能力，W1-03B2跟踪补齐。总输入/内存边界没有因分包取消。

I1-01有限第一步已实现locale偏好/目录/显式回退与原TextId/Revision保留的split/bind；真实Player/IndexedDB验证旧偏好继承和旧剧情读档不回滚语言。独立实例换语言返回标题并分语言存档，不猜测跨语言已读继承。DefaultUI完整翻译、语音目录选择/运行中正文重绑定和大章节文本流仍待，父任务保持in_progress。
