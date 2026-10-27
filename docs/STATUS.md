# galbox-sdk 当前状态

2026-10-28，SDK基线5e9e17a，本轮G2-04有限页内确认完成，F-01/F-01A继续进行，原档F-02未开始。用户要求真实实例在SDK外独立依赖、尽可能还原原作表现、无额外实验/诊断/SDK工具栏，以KAG/TJS/资源组织分析为主，不逆向exe。保持唯一TypeScript Core/Web Host路线。

G2-04/ADR0038：richText.confirm、可保存确认游标、新prompt隔离、同页PC/历史ID与页尾已读/历史提交、段落显完/Auto/Skip和默认UI已实现。on-prompt自动槽按输入阶段触发并保持有界；prompt溢出先拒绝，不留半份文字/时钟/profile变化。新源签名无隐式旧档迁移，旧无confirm内容保持兼容。代码与验收见evidence/g2-04/REPORT.md。

实际验证：check-accepted通过；38文件246单元；17聚焦浏览器及最后7针对最终显完效果的复验通过，包含两后端/图文保存/真实IndexedDB/刷新/过期输入/NVL/单次历史/默认UI/自动槽。没有冒称重跑旧完整151。实包226文件497984字节、14入口0删除/API与pack/dry-run通过；SDK SHA=d0b01e30c1ccc19a15357a0ced51958b6e9419a47b5ff41c1bdeaa007e93c071。无游戏/证据/日志/Schema JSON/maps，无实际发布。

独立工程/home/myo/Desktop/galbox-fata-morgana已安装精确新tar并冻结/类型/3 Python+13 TS/实际转换/3浏览器复验。新字面文本流[l]→confirm、r→换行，8语言真实含[l]源段的同页/页尾历史/protobuf恢复通过；当前开场转换器复用该路径，没有往原22页中添加不存在的控制。

源码前端核实了KAG反引号、裸true、&/%/继承、重复参数源顺序覆盖和原生重复标签别名；全部701份KS保留为raw控制IR，3337宏定义候选和依赖表只在独立ignored artifacts/ast。宏模板可以只打开if，跳转/返回还会影响条件上下文，不能硬凑全文件结构化括号。raw IR不是已执行注册/完整CFG或整作兼容。技能kag-krkr2-porting补充了这些第一方源码规则并校验。

游戏GUI仍是4:3原图标题（仅开始接通）和8语言各22页旁白。原OP44转场/音轨、其他菜单、中日.tft、正常对话宏/变量/人物上下文、完整i18n和整作未完成；独立界面无额外实验内容。Steam app303310/build21523397的9包/6284文件资料已只读提取并校验，原版槽位/global/继续参照仍缺，不认证原档。独立dev4180默认Canvas；原资料/日志/vendor拒绝HTTP访问，watch/依赖扫描有界。原始载荷均ignore，SDK内没有真实游戏。

下一F-01A：用已保留的宏模板和raw控制IR建立注册顺序/参数/调用/变量CFG，优先G3-05规则图转场、原OP音轨与正常对话接入。I1、模块B2/存储C/离线W1-04、G7总体仍未完成。只本地提交，不推送/发布/历史重写。
