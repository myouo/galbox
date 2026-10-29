# galbox-sdk 当前接续

2026-10-29，feat/chapter-runtime。M0–M2已有交付沿同一TypeScript Core/Web Host继续使用。ADR0053–0066已补齐第一门所需运动/复制、镜像粒子、实时组转场、双BGM与延迟包络、标题隔离回放、图文分层保存、字效阴影、持久0..8页预取、静态调用预取及resident资源预算。SDK不含游戏或旧脚本VM。

已验check、346单元、consumer、兼容性工具、独立CLI 69命令、release/package；SDK浏览器204项按CI分片执行，发现旧偏好导入未清除预取覆盖，修复后设置/预取5项和最后分片43项通过，其余分片通过。包审计256文件/578684压缩字节；仅npm元数据package.json，未带游戏、日志、证据或JSON Schema。最终包需由独立实例重新消费。

F-01E仍in_progress：独立morgana已编译八语完整序章/第一门，八语主线Core与七个保存切点全通过，实际旧32/93→新整章迁移17项通过。八语原章节菜单/隔离回放及五种真实演出保存、500段刷新历史共14浏览器通过。正常主线浏览器已完整到章末，但最后统计漏计原自动结束段，修正测试以核对其实际history后正在复跑；不降低剧情断言。

真实载荷910资产/216860148字节已同步R2并经HTTPS全文摘要/Range校验。公开预览仍是旧序章，本轮新前端尚未发布/推送。中文原包缺失的一条SE按经指纹确认的原SE.tjs停槽后继续，并明确报告；不补造声音。原版tft/原作继续对照、第二门后、结局鉴赏与高级代码模块组合另验。

精确下一步：完成独立实例完整浏览器主线/最终包回归、testsdk公网检查，再按已有授权发布本地build到test.morgana.love并推SDK到myouo/galbox、实例单根到myouo/morgana。SDK保留历史；主SDK目录用户已有修改未覆盖。任务唯一来源tasks.json；细节evidence/chapter-runtime/REPORT.md及独立实例docs/DOOR1_ACTIVE.md。
