# ADR0039：有界灰度規則圖轉場

G3-05有限v1：stage.rule / stageRuleTransition使用一個既有物件的單張from圖、to圖與同尺寸不透明灰度rule圖，vague整數1..256，duration/easing沿用舞台時鐘。規則相位floor(progress*(255+vague))；分段門檻和8bit權重依公開KRKR實作核實，兩端精確取原圖。RGBA用明確的預乘混合；不聲稱所有KRKR layer type均像素一致，先驗證opaque背景。

新opcode、StageTaskState.rule和StageObject.ruleTransition分開新增，原stage.transition ABI保持。任務的from/to/rule/vague/簽名、渲染狀態與進度均持久；完成清除rule狀態，cancel凍結當前畫面，finish到終點。為避免不可持久的遞迴合成，v1不從分層/未結束規則圖再起轉場，也不替換活動asset寫者；活動效果可先finish；已cancelled或分層的畫面需stage.image明確建立新基底。

圖形Host驗證尺寸、灰度/alpha及預算。規則圖不是普通to圖，必須列入當前/恢復/預取資源依賴，凍結畫面也保留from與rule。讀取、取消和錯誤不能安裝半份效果，活動資產不能被LRU驅逐。

兩後端共用有界CPU合成，重用像素陣列、256項查表與私有Canvas texture；同相位不重新合成。每像素21 bytes為保守邏輯估算，含來源/目標、灰度、輸出、Canvas與上傳texture，並非實測實體記憶體。GraphicsOptions.maxRuleBytes預設64MiB；Canvas另要求與既有composition合計不超maxCanvasBytes。資源與表面按實例清理，不用全域清理Pixi pool。

原作標題驗證暴露初始啟用限制：save.policy=false是玩家保存權限，不禁止在initial mode安裝完整的候選執行狀態。Player.start允許SAVE_POLICY這一理由的初始切點；普通capture/save/load規則不放寬，仍拒絕禁存切點。持久pending候選沿既有initial mode接續，不把初始啟用冒充普通存檔。

驗收：原生門檻/查表oracle與RGBA；真實工廠/資產種類/連結；並行pose與asset寫鎖、失敗原子、cancel/finish、快照/來源/進度損壞；Protobuf與IndexedDB中途恢復；兩後端像素/無WebGL、尺寸與讀回故障/預算拒絕/清理；實包與獨立作品按源rule與時序消費。不轉向exe逆向、第二解釋器或預錄動畫掩蓋未實作語義。

依據：[TransIntf](https://github.com/krkrz/krkrz/blob/master/visual/TransIntf.cpp)、[univtrans查表/內核](https://github.com/krkrz/krkrz/blob/master/visual/gl/univtrans_sse2.cpp)。原作圖層聚合、children、特殊alpha型別與完整OP仍由獨立適配逐項驗證。
