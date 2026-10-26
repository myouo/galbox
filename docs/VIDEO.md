# 影片片段

`videoPlay(at, taskName, videoAssetRef, {restore, skippable?, gain?, rect?})` 建立正式 video.play，Builder/工廠關聯 AssetRef<'video'>，連結檢查 video.webm/MIME/矩形。矩形預設1280×720，可宣告viewport內的x/y/width/height；影片平面在同一Pixi canvas、鏡頭/圖像濾鏡之外、DOM正文之下。播放期間預設正文renderer隱藏正文。

有限來源為opaque WebM/VP8、可選單Opus/Vorbis mono/stereo音軌；拒絕alpha/stereo變體、其他/多影片軌與字幕軌，未提供AAC/MP4/VP9、循環、多片並發或精確seek。容器檢查EBML邊界/Info/Tracks/尺寸/時長/codec，完整bytes仍經目錄摘要和預算；瀏覽器實際canPlayType/metadata/解碼另驗，150ms時長容差。這不是編寫codec，也不是網路邊下邊播；真正版本化網路流仍為G3-04。

Task.kind=video 的 pending→playing 是startup ack；自然end才completed。允許skip時明示skipped/cancelled，不能冒充自然end或all-success成員成功。主流程等待影片，Auto/快進不自行跳過。其他音軌不隱式停止，作品可用既有audio.stop等指令安排。影片音訊經Web Audio script gain×sfx偏好×sfx bus×master混音；不佔整軌AudioBuffer。

restore=replay 可在活動切點保存，恢復新epoch/attempt並從0重播，不猜物理採樣位置；已結束結果不重播。restore=forbid 在活動期間禁存/普通恢復拒絕。初始持久接管有受控initial候選路徑，可重播尚未成功接管的forbid意圖；這不使普通槽位變合法。預設UI顯示skip權限/重試，快速保存按Core許可禁用。

HTMLVideoElement來源只屬本Host，URL不入檔。Pixi VideoSource停用autoLoad/autoPlay/autoUpdate/global ticker，由本Player的活動幀更新texture，WebGL和Canvas共用。暫停立即停element和AudioContext。stop/skip/自然end/epoch/dispose清理source/listeners/texture/audio nodes；遲到Promise/end/error無權作用新來源。natural end先清舊平面再入coordinator，避免新互動啟用時仍殘留舊影片。

暫時play拒絕blocked，可用 retryVideo() 同邏輯任務新attempt重試；解鎖不暗中重播blocked舊source。prepare失敗不激活；初始接管的永久失敗留durable pending由新Host接管且不重做profile提交，已激活會話中的設備失敗明確暫停/報錯。未決play的dispose及遲到結果有實際瀏覽器驗證。

資源仍受每檔/總編碼、尺寸/估計紋理限制；可選ResourceBudget.maxVideoMs，省略為600000ms（最大7200000ms）。估算不代表decoder內部RAM/VRAM。實測來源是原創抽象燈塔圖案與正弦音，不是真人或原作資料。正常pnpm fixture用提交的編碼，不要求ffmpeg；重新產生素材才需要可選工具。

決策ADR0023，影片/互動證據 evidence/g3-03/REPORT.md；原生無WebGL/Canvas與WebGL影片像素、自然事件、保存刷新和獨立tarball皆須實跑。平台範圍以報告為準。
