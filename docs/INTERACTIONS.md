# 熱點、選擇與活動期限

`galbox-sdk/port-kit` 的 interactionPrompt(at, stringVariable, label, options, timing?) 建立正式 interaction.prompt。每個選項有穩定 id/標籤/目標、可選 BoolExpression enabled 和固定矩形；最多16項。deadlineMs 是1..3600000毫秒 i32 expression，必須和明示 timeout(id,target)成對。Builder自動宣告 interaction.timed/expressions 能力。來源/矩形/目的槽/地址/重複身份在連結時檢查。

矩形使用1280×720的viewport邏輯座標，右/下邊界不包含，從高序號 enabled 熱點開始命中。這不是跟隨移動角色的物件綁定；實例可用既有舞台內容襯底，預設UI畫矩形按鈕與標籤。鍵盤/輔助啟用使用選項id，指標使用Core座標命中。disabled不會被選，無enabled且無timeout明確拒絕。

Core建立 prepared 等待時一次求值 enabled/deadline，保存結果和原指令簽名，不按新profile重算。prepared不扣倒數；Renderer/輸入層就緒後回報readiness，由Player檢查目前epoch/提示/attempt、已playing且未暫停，再把時間結算和activate經coordinator排隊。Core才建立active起點；React不能直接選分支或推PC。

預設React UI自動回報readiness。自訂嵌入者綁定輸入後呼叫 `await player.activateInteraction(prompt, attempt, epoch)`；未回報就保持prepared，不猜輸入已就緒。選擇用 chooseInteraction(option,prompt,attempt,epoch)，點選用 pointInteraction(x,y,prompt,attempt,epoch)。坐標須由實際畫幅轉換，預設UI已處理縮放。輸入先固定受理時間並經同隊列結算，再裁決；t<deadline接受，t>=deadline依作品明示timeout。即使RAF/定時回呼遲到，過期點擊仍不能成功。

菜單/使用者/隱藏/失焦等暫停原因獨立，暫停不補牆鐘。prepared/active均可合法保存。恢復保留已耗時間，但新attempt、回到prepared、清除舊active起點，等待新UIreadiness；舊epoch/attempt/按下後跨提示鬆開不影響新提示。Auto/快進在互動停回manual，不自選。

恢復驗證來源簽名、選項身份/標籤/矩形/目標、靜態enabled/deadline、phase與activeAt+elapsedMs=logicalTime等約束。普通進度/偏好仍與Snapshot分開，舊槽不回寫新profile。限時選擇為活動整數毫秒，不是物理硬體事件或牆鐘的跨設備逐微秒保證。

實例只宣告選項/內容/策略，SDK承擔計時、身份、Core命中、恢復與預設UI；未實作任意GUI編輯器、動態角色跟隨/非矩形命中、多個並發劇情控制流。完整證據見 evidence/g3-03/REPORT.md，決策ADR0023。
