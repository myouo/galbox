# 当前计划

current_task=E1-05。G3-07已完成。3e31187全CI通过后，810a3a5文档重跑发现stage二次读档的默认poll退避在4.2秒CDP读取后提前耗尽取样机会。固定50ms采样，仍为5秒等待/45秒用例；TS与stage文件三次9项复验通过。

CI剩余浏览器再分四片，真实check:browser-shards验证22+42+43+34+35=176项无遗漏/重复，CI forbidOnly。现在提交并回收最新准确SHA六个CI任务。未回收前E1-05保持in_progress；原失败/trace在ignored artifacts/ci-followup。

完成后下一W1-03C热记录/留存/容量。其他SDK与并行实例任务状态保留，不混用不同分支的CI结论。
