# 0023：影片、提示啟用與限時熱點

G3-03有限集：單影片opaque WebM/VP8、可選單Opus/Vorbis mono/stereo音軌，完整編碼bytes/摘要/EBML容器事實/實際瀏覽器解碼與尺寸時長另驗。單Pixi舞台的獨立影片平面（同canvas、正文之外、鏡頭/舞台濾鏡之外），WebGL/Canvas共用VideoSource，禁止全局ticker自動播放/更新。主流程video.play阻塞等待，啟動ack僅playing、自然end才completed；skip權限明示且獨立skipped，不冒充自然end。

影片保存restore=replay從0建立新epoch/attempt；forbid在活動期間明確禁存/普通恢復拒絕。為初始activation/pending接管允許受控initial候選重播forbid意圖，不能因此把普通槽位當合法。無seek/任意影片編碼/循環或多影片並發、網路邊下邊播；G3-04保留真正網路流。

interaction.prompt含穩定prompt/attempt、選項id/標籤/目標、一次求值的enabled、可選矩形熱點，最多16選項，固定1280×720邏輯viewport。矩形不跟隨移動角色；高序號enabled矩形命中優先。鍵盤/輔助啟用按穩定id，指標按座標Core命中，不讓React改PC。無可用選項且無timeout立即拒絕。

可選deadlineMs一次求值為1..3600000活動毫秒，明示timeout id/target。prepared階段不扣時；舞台/正文已提交、當前輸入目標就緒且播放器已激活/非暫停後，UI/嵌入者回報readiness，Player核對epoch/提示/attempt並經coordinator排隊activate。React僅回報已綁定輸入，Core權威建立active計時，不直接裁決分支。CLI/recipe不能猜啟用或真人輸入。

Core活動tick與輸入經同一隊列；Player在受理選擇/指標時先固定並提交活動時間，t<deadline接納、t>=deadline執行作品明示timeout，遲到callback不能成功。暫停不補牆鐘，prepared/active切點分開保存；恢復增加attempt、保留已耗時間但重新prepared，等待新UI啟用。Auto/快進遇互動回manual，不自動選擇。

所有來源/解析參數/矩形/phase/期限數學關係在快照恢復重驗，外部資料schema/規範化/連結，真工廠及預算1/8/100語義測試。影片Host報告只入隊，遲到play/end/error、取消/替換/dispose不得作用新來源。暫時播放拒絕可重試，初始接管的永久失敗保留當前durable pending由新Host接管，已激活會話中的設備失敗則明確暫停/報錯；資源/解碼失敗在準備期不破壞舊會話。

使用原創《燈塔來信》影片/熱點章節及合成音畫；非真作資料。需實測WebGL/無WebGL Canvas、像素/自然事件、IndexedDB保存刷新/禁止切點、獨立tarball與既有門檻。來源 https://www.matroska.org/technical/elements.html 、https://pixijs.download/v8.22.0/docs/rendering.VideoSource.html 、HTML media標準。
