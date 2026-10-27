# galbox-sdk 当前状态

2026-10-27，基线e20366a。本轮完成G2-03无署名旁白、E1-02干净生成与S1-01源码迁移skill；F-01/F-01A进行中，F-02真实原档未开始。当前主线F-01A：以KAG/TJS项目组织、宏和资源分析推进，尽可能还原原作表现；用户明确不要游戏内的实验/说明/诊断/SDK工具栏，不走exe逆向路线。

独立作品工程/home/myo/Desktop/galbox-fata-morgana，通过实际SDK tarball和公开exports开发，不借workspace/private源码。SDK仓库未放游戏载荷。原安装目录只读：Steam app303310/build21523397，9个XP3/6284文件/804311540字节提取后长度与Adler32通过，源包SHA复验不变。8语言共享/覆盖目录分开。原版槽位/global/附件及继续参照仍缺，不能认证原档。

源码链startup→Initialize(KAG3.26/语言包/搜索路径)→first(宏/插件)→title→scenario已梳理。标题按钮定位需加Config消息边距，例如535+70=605；空姓名宏仍有布局/历史副作用，字体与行距各语言不同。整作有重复与独有标签、动态宏/TJS，不能按行zip或简单文本替换。详细独立工程docs/ARCHITECTURE.md。

当前实例仅原图标题静态状态（开始按钮已接通）及8语言各22页旁白，176页由正式Core逐页及两次protobuf恢复通过，22个GUID在此切片一致。游戏内已移除全部额外说明/诊断/语言下拉/默认工具栏/自造结束提示，4:3与源参数布局。最后3真实浏览器通过：8语言/原图标题/无额外UI/4:3/正文位置、Canvas禁用WebGL、图文保存/刷新/双语言隔离、22页。正文position:absolute缺失曾导致跑到顶部，已修正并补位置断言，截图目视复验。原OP44转场/音轨、其余菜单动作、中日.tft字形、后续页内[l]与整作仍未还原，F-01A不done。

SDK ADR0037通用旁白修复：三类文本允许空speaker并隐藏姓名，正文仍非空；Schema/工厂/Core/DOM/快照/protobuf同路径。pnpm check、37文件238单元、7聚焦浏览器及最后tsc通过，未冒称重跑旧完整151。干净目录生成与--check只读mtime验证通过；generate补自身mkdir，release-audit重建基线生成物。实际API/pack/dry-run对e203通过14入口/0删除，未发布。SDK最终SHA=0a2f8f25929e0663d878bdb5cdbaea7be5d3d183d61d9dbb57d085b27047fe7c，独立工程已按带散列文件名更新依赖、冻结安装/类型/转换/3浏览器重验。详见evidence/narration与fata-steam；raw在artifacts/narration及独立artifacts。

新skill /home/myo/.codex/skills/kag-krkr2-porting：先检索并阅读现有XP3/ksdec/WASM构建调试skills，再补源码组织/宏语义/忠实移植方法；不是声称无相关技能。校验及助手合成边界/真实1021脚本清点通过。详见evidence/kag-skill，检索/验证raw在artifacts/skill-search。skill不含原作载荷，$kag-krkr2-porting可显式调用。

曾仅运行隔离exe副本作参照，未反汇编/修改exe，未得可用画面；按用户要求已停止并结束独立prefix服务，后续仅脚本/资源分析，不把黑屏或素材合成当原作运行证据。无推送/发布。

运行独立项目pnpm dev，127.0.0.1:4180，?lang=zh/en/fr/it/jp/ko/pt-br/ru，默认Canvas。SDK自身pnpm dev仍是tests/player-app验证应用。精确下一步：用新skill继续KAG AST/宏注册/参数与调用作用域、资源覆盖图，逐项恢复完整开场演出；页内确认G2-04、规则图转场G3-05、I1国际化、模块B2/容量C/离线W1-04及G7仍未完成。按语言分包且存档隔离不等于SDK完整i18n。
