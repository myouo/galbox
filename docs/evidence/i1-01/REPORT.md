# I1-01A：有限文本目录与locale偏好

2026-10-28，基线149c2d6；ADR0042。父I1-01仍in_progress，未把有限支持集写成完整国际化。

Schema单源生成ProgramTextBinding/Entry/Catalog、LocaleCatalog、InterfaceTextCatalog及protobuf。公共split/bind支持title、普通/富文页和choice文本，保留地址/TextId/Revision/控制run；模板直执行、错locale/release/digest/槽位拒绝。bind还原原Program及protobuf字节，失败/返回值不共享调用者可变状态。声明别名/默认/显式fallback验证重复/缺失/环，缺消息明确失败。

Player创建可接textCatalog，先绑定再创建设备；偏好locale与剧情分离。旧偏好缺locale时使用作品默认，reload同规则；读旧剧情档不会把locale回滚。Core仍执行标准Program，无翻译I/O或第二VM。

实际验证：`pnpm check`通过生成一致性、strict、纯Core、导入/仓库边界；`pnpm test`41文件258单元通过。`pnpm build`/`build:harness`通过；首次localization/preferences/loading共17浏览器通过，最后补reload规则后localization/preferences 4项复验通过。真实Canvas、IndexedDB、save→改locale→load→dispose重建、目录错身份设备前拒绝均有断言。

`pnpm test:consumer`最终复验通过独立安装/公开exports/类型、实际播放/保存/恢复/备份；`pnpm test:package`通过白名单。独立真实实例安装234文件518051字节SDK包，SHA256=7873ffcbf4c082a75c2b2655ba27cfd22800080d6c72d90247b79c2df18f7355，无游戏/日志/证据/maps/schema。它用公共工厂为8语言拆分文本并校验绑定前后完整Program字节一致，详见W1-05。

raw位于ignored `artifacts/i18n/`。当前上限4096目录项，只支持声明的有限文本位置；脚本UI/template等未覆盖时明确unsupported。DefaultUI完整翻译、运行中正文/语音切换、大章节文本流和跨语言已读继承尚未完成。实例切换语言明确回标题，分语言存档；保留旧槽，无隐式release迁移。

## I1-01B / ADR0043：贡献者PO文本源

用户追加要求文本应能审查纠错，采用gettext PO而非YAML正文，语言/控制配置用TOML。实例locales目录含8语言各story.po/ui.po（22页/26标签）；源由已有标准文本目录整理，仅ID/原文/译文/控制元数据，无KS/TJS、归档或二进制素材。用户明确允许这些i18n文本进入GitHub。

固定gettext-parser 10.0.0与smol-toml 1.9.1，unknown输入再验语言/UTF-8/上下文闭包/英文来源/空/fuzzy/控制标记，支持literal/break/confirm有限集。Converter在字体子集前使用PO，修正页Revision派生自文本/控制摘要。build必须重新发布并拒绝新PO/旧Program；PB仍经正式Schema、split/bind和release验证。

实际3 Python+24 TS通过，新增编辑PO→生产Builder→protobuf→Core显示与保存恢复、输入隔离、Revision、原作换行/点击保护及格式/身份失败反例。16个PO均GNU msgfmt --check通过。8语言正式转换/字体覆盖/两恢复切点/全部资源闭包、strict/build、本地3网络浏览器通过。重复publication全目录摘要8907282bc3390896c94f70dd6a6520e187b4daaef3693d49f646feb189ecd9e2一致。PO版本线上20项最后复验全部通过（8.6分钟，零失败/skip/flaky）。

保留已声明边界：26个实例UI标签不等于DefaultUI完整翻译；本轮不支持gettext复数、任意富文风格、原档迁移或运行中正文重绑定。贡献者指南在独立工程locales/README.md；原始日志在ignored artifacts/po-*。

最终PO部署冷网测量：CDP编码响应3647247字节/23请求，180ms与750000B/s条件下11.2秒到标题；驻留估算16877703、峰值18309982字节。最新预览52文件3964825解码字节逐文件等于本地dist。源文件与发布产物可追踪，raw为外部artifacts/po-remote-browser.log、remote/po-final-results.json、po-preview-identity.log。
