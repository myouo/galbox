# ADR0043：贡献者文本源与发布产物

用户要求文本可审查、可纠错，并允许i18n文本进入实例仓库；原包/解包脚本/二进制素材仍禁止提交。实例采用gettext PO保存正文与UI文字，TOML保存语言配置与有限控制契约；protobuf继续作为正式SDK发布数据。

正文以TextId对应的msgctxt关联，msgid为英文来源，msgstr为目标文字，不按行zip译本。有限literal/break/confirm控制以命名标记保存，数量/种类/顺序必须与独立控制元数据及本地原作解析一致；未知能力拒绝。PO语法由固定版本gettext-parser验证，再验证语言、ID闭包、来源、空/fuzzy、控制标记；GNU msgfmt另验。

作品转换器在生成字体子集/正式Builder前应用PO，修正页Revision由文字和控制摘要派生，其余页保持。发布器拒绝旧Program/新PO混合，再通过ADR0042 split/bind与完整资源release核验生成protobuf。Core仍不读取PO/TOML或执行文本里的脚本。

当前覆盖独立实例8语言×22页与26个UI标签；不等同完整DefaultUI国际化、整作翻译目录、任意复数/性别语法、动态换语言或跨release存档迁移。真实来源资料留本地，贡献者可直接检查/修正文本源。预览和回归按用户要求部署到不同域名。
