# 面向 Web 游玩目标的架构核验

核验日期：2026-10-27。依据最初的CODEX_START、v0.6实施设计及当前生产代码；本次基线c71537b，W1-01/H3-02在本轮继续落实。这里区分已运行、有限支持与未完成，不能用Promise/interface存在代替行为证据。

## 结论

架构方向符合“用户在Web上实际玩GalGame”：唯一确定性TypeScript Core、串行协调器、异步Web Host、Pixi图像/DOM正文/React系统页及IndexedDB分层合理。Core同步是语义选择，不是阻止Web异步的障碍；原计划本就要求先用主线程预算，不默认引入剧情Worker或Rust/WASM。

当前是有真实浏览器闭环的SDK alpha，**尚不是完整大作品的Web交付方案**。优先级应从继续堆展示功能转向：真正让出事件循环、按需资源工作集、模块化程序、存储写放大/容量、发布缓存和目标设备验证。不能只提高预算上限来声称支持大作，也不能把“极致”当成不受设备/画质/内存约束的绝对承诺。

## 对照原计划与实际代码

| 原计划 | 当前事实 | 判断与下一步 |
| --- | --- | --- |
| v0.6 §3.3、§6.1：纯TS Core，平台I/O在Host | protocol/core/runtime有无DOM/Node编译与导入边界；React不改PC | 符合，保留该边界 |
| §6.2：固定预算后让出浏览器 | 原Player使用queueMicrotask续跑及候选循环；长计算阻挡timer/rAF | 本轮W1-01改为任务队列，真实测量；单次校验/插件仍可能阻塞 |
| §6.6–6.7：单剧情流、并行表现、回调入队 | Coordinator.current保持轮次，Host报告只入队，task/attempt/epoch与恢复重绑已验 | 已支持；不是任意多PC脚本线程或Worker并行 |
| §4.4：异步获取、取消和租约隔离 | acquire Promise、AbortSignal/Web adapter、字节私有化与摘要核验、迟到lease归还；真实浏览器反例 | 已支持；自定义provider须遵守身份/释放契约 |
| §4.4、§10.3：长媒体不用整轨ArrayBuffer | buffer、Blob渐进解码、显式versioned-url网络流三条路径；真实HTTP未全传完即播 | 有限支持：WAV/MP3/Vorbis/Opus、VP8 WebM；网络URL等级不冒充完整摘要 |
| §10.4：启动/当前/前看优先级、受控预取/缓存 | Host.init顺序遍历全部目录，非流式图片/字体/音频仍在createPlayer期间完整准备；无按剧情依赖的LRU | 关键差距，W1-02优先实施，不适合直接扩大为整部大作品预加载 |
| §4.3、§4.5：版本化Program模块 | 当前单个Program整体解析/链接和内存驻留，函数不等于网络模块；输入树/字符/资产数有界 | 未完成，W1-03实现模块身份/链接/快照闭包 |
| §11.2–11.3：异步原子保存、候选激活、旧head失权 | 实际IndexedDB、捕获与提交分离、profile批次/幂等回执、准备与激活隔离已有验证 | 核心语义符合；大规模存储结构仍需改进 |
| §11.2/11.6：长期命名空间与容量 | 当前每次事务读取/解析/写回完整命名空间，4M JSON字符预算，旧激活/回执长期保留 | W1-03须按真实负载处理记录粒度、留存与备份，保留head/回执原子性 |
| §11.5：静态发布、不可变清单、离线完整性 | CLI输出静态目录，manifest绑定程序/资源/语义，实际独立包/HTTP验证 | 在线基础成立；版本化CDN缓存、断点离线安装与驱逐恢复未完成，W1-04 |
| Web首屏与发布体积 | 本轮生产playground构建主入口约3.02MB，gzip约401KB；存在构建体积提示 | W1-04纳入冷缓存网络、解析与拆包验证；构建大小不是实际首屏时间 |
| §4.6/§10：能力探测和平台证据 | WebGL2→Canvas后备、音频解锁/失败、图像/字体事实与预算已做 | Chromium/软件GPU/原生Canvas及触控模拟有证据；Safari/Firefox和移动真机未认证 |
| §8：原版存档桥接 | codec/mapping/binding、recipe与fixture-save框架通过 | 两作真实edition/Program/资源/原档/原作参照不足，N/F/M6未认证 |

代码入口：`src/web-host/assets.ts`、`streams.ts`、`media.ts`、`host.ts`；`src/runtime/coordinator.ts`、`ports.ts`；`src/player/index.ts`；`src/storage/indexeddb.ts`、`runtime/durable.ts`。原文在`reference/GalBox-SDK-v0.6-Implementation-Design.md`对应章节。当前阶段支持集以tasks/MILESTONES为准，不能把早期M0–M2 done扩张为原计划全量实现。

## “Web异步”具体指什么

- **I/O异步：已有。** fetch、资源lease、字体/媒体准备、真实网络播放、IndexedDB事务与保存/读档均不是同步阻塞式网络/文件调用。
- **主线程可响应：预算续跑已修复。** async函数/Promise并不保证把CPU时间交还浏览器。原预算续跑存在微任务连续占用的问题，本轮采用MessageChannel任务和setTimeout后备，保持同一逻辑轮次与保存边界。
- **Worker并行：尚无剧情Worker。** 这符合原方案的“有profiling依据才引入”。未来若大型解析、摘要或模块链接确为长任务，可把纯数据工作移到Worker，不能直接把UI/剧情权威分散到多个线程。
- **资源按需/有限预取：尚未实现完整方案。** 真实流式音视频已做，但不能把它等同于所有图片/程序的懒加载。
- **离线与持久缓存：尚未完成。** 普通HTTP缓存不等于SDK管理的可恢复离线安装、版本切换与驱逐策略。

[HTML标准的微任务说明](https://html.spec.whatwg.org/multipage/timers.html#microtask-queuing)明确区分微任务与交还事件循环；[MDN微任务指南](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide)说明微任务队列会在返回事件循环前排空。W1-01修复的是实际调度，不是给同步函数套async。

## 性能与后续路线

本轮先优化指令查找并修复Web任务续跑，保留活动时钟、事件身份与全部历史。H3-02用固定61次实际提交/960ms逻辑轨迹比较WebGL/Canvas、直接释放、finish与readback；图形等待和销毁必须合计，不把前移/后移耗时伪装为提升。[MDN WebGL建议](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)建议结束使用后及时释放上下文，本项目继续按实例清理，不靠泄漏或长期保留上下文获得漂亮数字。

下一优先W1-02（资源工作集），随后W1-03（程序模块/存储规模）与W1-04（发布缓存/浏览器矩阵），再汇总G7综合认证。改进应同时报告首屏/推进/长任务/内存/存取与尾延迟，并保持图文、恢复、取消、旧回调拒绝的行为。质量开关或降级应显式、可测，不能为低延迟悄悄丢效果。

作品工程仍提供已表达的Program、可用资源与作品配置；是否需要原版存档互通再接明确版本的适配器。这个职责划分与最终Web游玩目标一致，缺失的是上述交付能力和验证，不是需要把Core重新换一种语言。
