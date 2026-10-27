# galbox-sdk 当前状态

2026-10-28，基线43af5b5，本轮G3-06介面音效完成；F-01A继续，下一G3-07。固定TS Core/Web Host、Pixi/WebGL与Canvas后备、DOM正文、可选React、IndexedDB与protobuf；真实作品独立工程，游戏内无实验UI，不逆向exe。

G3-06/ADR0040：uiSound音讯种类工厂、单一Schema/Protobuf请求、Player.playUISound/stopUISound与诊断落实。单cue、buffer≤30秒、准备≤10秒、master×sfx、独立惰性context，暂停菜单可响且不抢剧情SFX/BGM。加载/隐藏/blur/用户暂停/dispose取消旧cue与迟到租约；不改PC/profile、不进存档。错误Promise拒绝且与剧情错误隔离。

验证：check/生成/边界通过；40文件254单元；17浏览器（新5+媒体/历史12），最终异步拒绝及通知回调重入守卫后新6另复验；实包consumer通过。232文件507752字节、14入口，仅package.json为npm JSON元数据，无游戏/日志/证据/maps/JSON Schema。SHA256=753b4f63e8c56f8265aeacc1faacb5bc32d115c1a4e2746525282b9c0860f718。证据evidence/g3-06/REPORT.md，raw在ignored artifacts/interface-audio。

独立/home/myo/Desktop/galbox-fata-morgana冻结该包；3 Python+18 TS、严格类型/边界、8语言真实Core序列与两恢复切点通过。已接原进入音1.78秒/雷声15.16秒、标题4秒规则离场+3秒淡出/5秒音乐包络、44次静态前导与原等待、358.4秒循环原曲、22页旁白及其后4秒淡出。balanced预取/64MiB逻辑resident；新档源音量100%，不覆盖旧偏好。最后完整6浏览器通过（含原曲恢复身份/新attempt与producer像素），此前针对性2项亦通过，原生增益后波形非零、雷声自然尾音、原曲实际时钟/loop/音量复位均验。完整前导用受控活动时钟加速另有约24秒原生时间验证，不认证完整墙钟AV/原作像素对照。

源淡出目前bus归零，旧element到下一曲替换才清理；playbgm用最小1ms包络复位。因此G3-07接按源绑定的淡出停止及多剧情SE buffers，不能以UI cue冒充可保存的剧情SFX。下一正常对话/炉火/宏注册CFG，原click-skip、quick/context/其他菜单、glyph/textfade、日中.tft/完整i18n、原档/整作仍未完成。701份KS raw IR/3337宏候选只是分析输入；原槽/global/原作继续参照缺失。I1/W1剩余规模/离线/G7独立验收。

只本地提交，不推送发布。原槽保留，Program/release更新无隐式旧档迁移。SDK pnpm dev为原创验证应用；独立工程pnpm dev于4180默认Canvas，?lang=zh/en/fr/it/jp/ko/pt-br/ru。接续先读tasks的G3-07/ADR有限集，再编写真实实现与反例。
