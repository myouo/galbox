# galbox-sdk 当前状态

2026-10-28，代码基线4cfa54f，前轮文档收尾83f1576。本轮E1-04完成，下一任务G3-07。唯一TS Core/Host、Pixi WebGL/Canvas、DOM正文、可选React、IndexedDB/protobuf边界保持。

E1-04已验收：修复外部JSON隐藏toJSON执行、稀疏数组伪装及protobuf重复单值覆盖，支持集见ADR0044。Schema/公开类型/合法存档ABI不变。check与默认42文件267单元通过；单元并发限4，原10秒超时不变。完整172浏览器首次169通过，修复后台策略/截图时序/异步IME测试后相关24项及IME连续3次通过；无删断言或skip。实际tarball消费者、包边界和3周期228输入性能通过：API P95 34.1ms，dispose最大256.3ms。新包234文件518202字节，SHA256=85bd9d599bc969485e89230cd95dd3fc50dc7339d65ca4456a29ad53393cfc0f。原始证据artifacts/sdk-audit，短报告evidence/e1-04/REPORT.md。新发现的H3-03（Player发布清单/资源投影重复校验复制）仅列待量测优化，不宣称提速。

现有I1-01A/B、W1-05、E1-03已完成。独立实例位于/home/myo/Desktop/galbox-fata-morgana，通过精确实包依赖SDK；上一验收包SHA256=7873ffcbf4c082a75c2b2655ba27cfd22800080d6c72d90247b79c2df18f7355。本轮SDK改动尚未替换实例依赖。实例8语言PO/TOML、R2专桶304对象/64355598字节、最终20线上回归证据保留；目前仍只有44静态前导+22页。test.morgana.love保持本地build预览，testsdk.morgana.love负责自动化网络回归，限速仅CDP模拟；原曲仍完整摘要Blob。

前轮E1-03已核对SDK保留历史的实际推送与实例单根发布，证据在evidence/e1-03；开始检查时实例head为ccdaf3758ac27bd3faab1f1a452f81a1090c95bc。

精确下一步：G3-07先声明绑定具体音源的淡出停止/多SE有限支持集与ADR。大作品优化优先W1-03C热记录粒度/容量；随后I1-01完整DefaultUI翻译、W1-03B2高级模块闭包、W1-04持久缓存/离线/真实浏览器与移动设备、G7-01综合验收。N/F/M6真实原档和整作认证仍未完成，不以SDK通用测试替代。运行原创验证应用用pnpm dev。

本独立分支G2-05按ADR0046完成字符单位等待，check/270单元/真实DOM与IndexedDB刷新/实包consumer通过。用于独立实例接续zero2，不覆盖主工作区另一会话G3-07；当前分支基线d282bd9。源变更与采样数据缺失明确拒绝，原固定等待/合法旧快照保持。

本分支后续接续：F-01D章节批量PO工具完成，F-01E整章与回放in_progress。实例首两章20959条、全主线暂存274289条，当前可玩仍32页；实际线上5项及本地26+1通过。长音乐现用正式versioned-url流，完整性等级明确。下一合入另一工作区已提交G3-07，再做完整第一门角色宏/表现/原章节菜单和隔离回放。证据evidence/f-01d；不覆盖主SDK并行存储工作。
