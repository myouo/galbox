# galbox-sdk 当前状态

2026-10-28，当前G3-07/E1-05。唯一TS Core/Host、Pixi WebGL/Canvas、DOM正文、可选React、IndexedDB/protobuf边界保持。代码基线eaa1f38，CI分组提交d282bd9。

G3-07有限实现完成：audio.sources、最多8个具名SE、绑定具体media ID的fade/stop、完整源/包络快照闭包、Auto语音停止与初始激活边界。ADR0045/MEDIA明确支持集；旧ABI和字段号码保持，不支持多BGM槽、延迟包络或基础代码模块。check、44文件284单元、20相关浏览器、精确tarball消费/便携备份、API/包审计通过；最后候选远程全CI尚待。SDK包236文件524411字节，SHA256=f5347b568396ad89ba3ac8f569afb18b0f6a99cfa394371baeb2784433eb3cbd。证据evidence/g3-07，raw artifacts/g3-07。

E1-05已定位并修复CI两处缺口：Canvas与其余测试在独立runner中互补全覆盖，保留45秒/断言；npm dry-run支持单包包装与旧flat结构，继续核验身份、版本、文件清单。d282bd9双浏览器任务通过；它随后暴露的release解析问题已本地实际dry-run验证修复。下一回收G3-07候选准确SHA的全部CI结果，未提前标done。证据evidence/e1-05，raw artifacts/ci-followup。

E1-04及原有限SDK阶段已验收。真实作品独立工程仍通过实包消费；本轮未更新其实例依赖，整作/原档及真机认证不由SDK测试替代。并行实例任务记录继续保留。

精确下一步：先完成G3-07/E1-05远程闭环，再推进W1-03C热记录/容量；H3-03先量测发布清单投影，I1-01完整UI/动态目录、W1-03B2高级模块、W1-04离线/平台、G7综合验收仍待。运行原创应用pnpm dev；音频专测tests/browser/audio-sources.spec.ts。
