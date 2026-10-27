# ADR0037：无署名旁白

真实Steam KRKR2迁移的独立消费者在text.rich执行时遇到TEMPLATE_EMPTY：原作jinobun/draw_name name=""表示无姓名旁白，现有Schema与Core却强制speaker非空。

有限扩展：text.page、text.template、text.rich的speaker允许空字符串，表示不显示姓名；仍必须为字符串，禁止NUL并保持4096上限。正文/富文内容、ruby读音继续非空；不增加页内点击等待、locale或新解释器。DOM姓名元素在空姓名时hidden，同一呈现用于图文捕获。

单一YAML源只放宽两个speaker字符串约束，protobuf tag/消息结构及Snapshot版本不变；实际生成器/工厂/validator/Core/恢复共用。新SDK可读取原有非空档，旧SDK不能读取含空speaker的新档时仍明确拒绝，不冒称旧二进制前向兼容。

验收：真实三种公开指令工厂，预算1/8/100、字素中途快照/protobuf/内存持久与继续行为；空正文/NUL/超限姓名的负例保持拒绝；实际DOM隐藏姓名与可恢复图文保存；独立作品仅通过新tarball消费。游戏脚本/资源与转换器在SDK外，主库没有作品特判。
