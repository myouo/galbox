# ADR0042：文本目录与语言隔离（I1有限第一步）

按用户新要求，资产bytes与剧情/界面字符串分开发布，选中语言只请求该语言目录及共享资源。本轮有限Program文本目录支持title、text.page、text.rich、choice标签；模板保留地址/TextId/Revision/跳转/资源目录，文字载荷独立。text.template/脚本UI等未纳入此拆分支持集时明确unsupported，不静默残留字符串。

Program新增可选textCatalogBinding；有绑定的模板不能直接link/createCore，必须经bindProgramText验证catalog schema、game/release/locale、完整槽位/类型/文本身份与摘要后还原标准Program。split/bind实际工厂使用同一Schema/Protobuf，输入输出隔离，失败不改调用者。Core执行的仍是已求值/链接的正式Program，资源/文本读取留在Web/实例适配层，禁止第二解释器。还原后的Program必须与原输入逐字段/字节等价，既有快照语义不变。

LocaleCatalog提供有限声明、别名/显式fallback和默认语言，验证重复/不存在引用/环；选择大小写不敏感，不按行zip译本。PlayerPreferences新增可选locale，旧记录在Player端使用作品默认值补齐；偏好与剧情/profile分离。此设置不伪装为任意运行中换语言/旧TextId继承，DefaultUI完整翻译仍属I1剩余。实例换语言明确回标题并保持各语言存档命名空间。

当前目录上限有界，按已准备Program/章节拆分，不宣称整作文本流式模块加载已完成。字面正文/控制run/版本由选中目录绑定；缺失/混入其他语言不隐式补别的语言，fallback只按显式声明选择目录。原PNG内固有文字作为本地化图片，不能把它当作可随意翻译的正文。

本轮另以独立R2桶/受保护test.morgana.love验证真实网络。只上传当前发布闭包，禁止复制旧public孤儿/原资料/证据；R2为资产库，文本/程序/界面目录走独立不可变路径。真实慢网/错误重试/取消/恢复/跨刷新/语言请求归属和实际字节验证，未完成项保持in_progress。
