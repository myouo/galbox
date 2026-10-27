# KAG / KRKR2 skill 检索与整理

2026-10-27。使用find-skills检索skills.sh及网络，并直接读取GitHub源文件。查到了fenghengzhi/kirikiroid2-web的krkr2-xp3-tool、ksdec、krkr2-build、krkr2-debug等；检索时GitHub约40 stars，CLI相关skill约1 install。它们覆盖该工程的解包/文本解码/WASM构建与调试，不覆盖当前要求的完整源项目组织与忠实移植；并非“网上完全没有相关技能”。

已在用户默认skill目录创建/home/myo/.codex/skills/kag-krkr2-porting，包含45行SKILL.md、agents/openai.yaml、四份按需参考和一个标准库静态清点助手。定位为KAG/TJS/XP3源码分析、宏/依赖/变量/调用语义、表现和恢复闭包，再降低到用户指定SDK。包含当前galbox-sdk边界参考，保留TypeScript路线和独立实际包消费；不自动引入exe逆向或WASM Core。

参考包括KAG官方概览/标签/TJS指南、KAGParser、KRKR源码及XP3/TextStream实现；已有skill链接与适用限制保留在sources.md，没有把第三方skill未经审查整包安装。技能没有商业游戏脚本、资源、字库或存档。

实际quick_validate通过；助手合成UTF16、静态/动态目标、重复标签、字节码/FEFE识别、符号链接不跟随、源文件不改写和输出目录边界检查通过。对真实提取源码运行只读清点：1021文件可读，输出336406条结构线索至独立工程ignored artifacts/skill-inventory。它是静态候选清点，不是全KAG解析器或完整调用图，不据此宣称整作兼容。原始检索与验证日志均在ignored artifacts/skill-search。

全局skill可用$kag-krkr2-porting显式调用，默认自动发现策略保留。当前迁移工程继续F-01A；技能完成不代表游戏移植、i18n或原档兼容完成。
