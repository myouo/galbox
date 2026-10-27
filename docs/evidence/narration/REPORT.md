# G2-03 无署名旁白与生成接续修复

2026-10-27，基线e20366a。真实独立KRKR2消费者在richPage speaker=""处遇到TEMPLATE_EMPTY；本修复不包含游戏内容或作品分支。

ADR0037限定三类正文speaker可以为空，正文/读音保持非空；YAML单一源两个约束、Core模板/富文及DOM隐藏姓名一起落实。protobuf字段号/结构、Snapshot版本保持，新SDK接纳旧档；旧SDK对含空姓名的新档仍可能拒绝，未声称旧二进制前向兼容。

实际pnpm check通过；37文件238单元通过。新测试使用真实instruction/templatePage/richPage工厂，预算1/8/100、逐字中途捕获、protobuf/MemoryStore恢复、历史与下一具名页一致；空正文、null/NUL/超长姓名反例拒绝。最后独立tsc也包含新增浏览器文件通过。

聚焦浏览器7项通过（expressions/text/narration），新用例在WebGL/Canvas分别跑三种正文、DOM姓名隐藏/再显示、实际图文保存及读取。没有重跑原先完整151项，不把旧完整结果计为本次新验收。独立真实作品的8语言/保存/刷新证据另见fata-steam报告。

实际tarball审计226文件，SDK SHA256=0a2f8f25929e0663d878bdb5cdbaea7be5d3d183d61d9dbb57d085b27047fe7c；无游戏/证据/日志/Schema JSON/maps。对e20366a实际API/pack/dry-run通过，14入口/0删除，未实际发布。

这次基线验收暴露e203生成目录已ignore但generate未mkdir，干净检出会ENOENT。generate已创建自身输出目录，--check仍只读；release-audit先在隔离基线准备目录并重建生成物再比较声明。实际空目录复制两个YAML与生成脚本、共用已安装工具依赖，生成与只读mtime比对通过；没有依赖旧未跟踪生成文件获得通过。原失败日志保留。

原始结果均ignored：artifacts/narration/{check.log,unit.log,type-final.log,browser.log,browser,clean-generation.log,package.log,package,release.log,release}。两作真实原档/i18n/页内点击与完整表现未因旁白修复完成。
