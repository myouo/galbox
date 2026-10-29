# H3-03 / W1-06 活动验证

真实实例旧版 SDK 5c965e5/实包4ab3e922857c，Canvas真实存档 page1/page1500/rain/petals各10秒基线已记录于独立实例ignored artifacts/door3。正常CPU P95分别17.3/17.2/20.1/28.2ms；没有据此声称复现所有用户卡顿。真实dance存档（循环motion，非手改）4倍CPU/60秒复现P95 192.9ms，drawImage采样占36.8秒；游玩堆GC后37.1→38.7MB。运行时其他回归也在同机执行，最终需低干扰复测。

旧序章balanced2、180ms/750000Bps、阅读停留100ms，95次推进P95 561.8ms、11次AudioContext暂停、1次media waiting；这是旧实包实际运行结果。

ADR0068已实现静态Player视图、Core冻结子树和Pixi层级复用、舞台候选封存历史复用、预取滚动接续、resourceAudio策略；Canvas back buffer取消不必要的频繁读回。未知输入和完整wire预算仍保留，作品/存档ABI未改变。

已通过：pnpm check；348单元；26项定向真实浏览器（接续、音频、Canvas/WebGL运动与组转场、读档、缓存淘汰、图文顺序）。后续又修改了stageCandidate/投影分配和Canvas back buffer，因此这份26项证据只能覆盖对应先前版本；最新单元/全浏览器/实包/真实对照仍在运行。最终结果完成前不标done。
