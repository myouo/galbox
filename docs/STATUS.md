# galbox-sdk 当前状态

2026-10-28，G3-07/E1-05完成，下一W1-03C。唯一TS Core/Host、Pixi WebGL/Canvas、DOM正文、可选React、IndexedDB/protobuf边界保持。

G3-07/ADR0045提供最多8个具名SE、绑定具体media ID的fade/stop、完整源/包络快照闭包、Auto语音停止与初始激活边界。旧ABI和字段号码保持；多BGM槽、延迟包络、基础代码模块新音频仍不支持。check、44文件284单元、20项相关浏览器及最后4项复验、实际tarball消费/便携备份、API/包审计通过。最终包236文件524411字节，SHA256=f5347b568396ad89ba3ac8f569afb18b0f6a99cfa394371baeb2784433eb3cbd；性能3周期228输入API P95 29.4ms、dispose最大209.2ms通过，未宣称所有场景提速。证据evidence/g3-07，raw artifacts/g3-07。

E1-05完成：先后修复Canvas上下文成本、npm dry-run报告包装及stage轮询退避提前结束三处CI缺口。保持原5秒断言/45秒用例及全部断言；固定50ms取样，浏览器分五片，真实集合审计证明176项无遗漏/重复，CI禁止only。最终修正3dfd713的run40642595655六个任务全部success，主check含CLI/consumer/release/package，浏览器22+42+43+34+35全部通过。源码G3-07验证保持，证据evidence/e1-05，raw artifacts/ci-followup。

此前E1-04及有限SDK阶段证据保留。真实作品继续独立工程/实际tarball接入；本轮SDK提交不包含实例迁移、原作载荷或原始日志，整作/原档及真机认证仍独立。

精确下一步：W1-03C先测真实IndexedDB热根写入量及大历史/多槽位负载，定义逐记录布局/留存与容量ADR，再做原子迁移与失败反例。H3-03待量测发布清单投影；I1-01完整UI/动态目录、W1-03B2高级模块、W1-04离线/平台、G7综合验收仍待。运行原创应用pnpm dev；源音频专测tests/browser/audio-sources.spec.ts。
