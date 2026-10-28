# G4-01：按已知发行版自动加载迁移

2026-10-29。ADR0051工厂与Player.load路径已落地：至多32个精确源版本，按需旧Program先链接/验证旧快照，完整迁移后以目标Core验证，当前profile只合并已声明且当前已读的别名。原槽及previous不改写，正常保存才写新版本；未知版本、旧recipe和模块路径仍明确拒绝。

单元涵盖原输入隔离、别名、重复/错误目标、仅retag拒绝、源身份漂移和忽略取消的迟到结果；9项加载/迁移单元通过。真实浏览器验证加载新版本、当前已读/解锁保留、原槽修订不变、回调失败保留head与工作剧情；与原loading回归共14项通过，最后强化的迁移/预取2项复验通过。实际作品32/93页映射尚在独立工程验证，不能把这些合成接口测试称为旧游戏存档已完成迁移。

raw在ignored artifacts/door-migration、door-base及对应log。

后续实际验收：b6c9d43修复完整Snapshot数值域验证（舞台含浮点，不用i32-only JsonValue验证整个迁移结果），包含失败反例。最终6ec5791 CI301单元/184浏览器/实包通过；实例8×2真实旧Program及活动fade共17测试、旧32页实际IndexedDB菜单读档在本地/公网通过，原槽仍是旧release与旧revision。已发布93页Program本轮未变；未来第一门目标的旧93页迁移尚未验，不能扩大声明。细节在独立实例docs/evidence/READING_LOADING.md。
