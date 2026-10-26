# G3-03：影片、熱點與限時互動

2026-10-26，分支feat/video-and-timed-interactions，基線9eeb10207d6d6e295bc224a5f66475860e7fa5b4。G3-03有限支持集完成，完整通用GalGame/G7及N/F/M6尚未完成。維持唯一TS Core/Host、單Pixi舞台（WebGL2/Canvas）、DOM正文、React/IndexedDB；沒有作品特判、第二解釋器或Rust/WASM。

## 正式實作

ADR0023、單源Schema/生成型別與validator、真實interactionPrompt/videoPlay工廠、Core/Host/Player/預設UI/資源與CLI閉環一起落地。AssetRef<'video'>與影片工廠關聯，字串目的槽、bool enabled、i32期限和timeout成對型別由實際工廠驗證。外部資料先schema/規範化/連結，沒有公開any或雙重斷言。

影片為單opaque WebM/VP8軌、可選單Opus/Vorbis mono/stereo；EBML邊界/Info/Tracks/codec/尺寸/時長有界檢查，完整bytes經provider摘要與預算，實際瀏覽器canPlayType/metadata/解碼另驗，150ms時長容差。不宣稱Node容器檢查已解碼所有壓縮幀。alpha/stereo變體/其他媒體軌拒絕；無AAC/MP4/VP9、seek、循環或多片並發。maxVideoMs可選，省略600000ms，仍受編碼/估計紋理/尺寸上限。它是已驗證Blob播放，不是網路流。

影片在同一Pixi canvas的獨立平面，鏡頭/舞台濾鏡之外、DOM正文之下；播放期間預設正文隱藏。VideoSource停用autoload/autoplay/autoupdate/global ticker，幀更新由本Player控制。音訊走script×sfx偏好×sfx bus×master，不隱式停其他音軌、不常駐整軌AudioBuffer。

Task.kind=video嚴格分pending/playing/自然ended/明示skipped/blocked/failed。startup ack不完成影片等待，skip不冒充completed/all-success；主流程等待自然end或合法skip。replay以新epoch/attempt從0重建，ended不重播；forbid活動普通存檔/恢復拒絕。初始activation有受控initial候選重播路徑，不能把forbid普通槽位變合法。初始永久失敗留durable pending、新Host接管不重做profile；已激活會話中的設備失敗明確暫停/報錯。

Host暫停element與AudioContext；stop/skip/end/epoch/dispose清source/listeners/texture/audio nodes，URL不入檔，遲到Promise/end/error無權作用新來源。自然end先移除舊平面再入隊，避免新提示啟用時殘留舊影片。blocked必須經正式新attempt重試，解鎖不暗中重播舊來源。未決play取消及disposed生命週期有真瀏覽器驗證。

interaction.prompt含穩定prompt/attempt、一次求值的enabled/deadline、viewport矩形/鍵盤與明示timeout，最多16項。Core從高序號enabled矩形命中，右下邊界排除；disabled/域外/舊身份不選分支。沒有enabled且無timeout先拒絕，不分配提示。矩形不跟隨移動角色、不擴張成GUI編輯器。

prepared/active是不同保存階段。舞台/正文與輸入目標就緒、Player已playing且未暫停後，預設UI或自訂嵌入者回報readiness，由Player固定受理時間、結算準備期時間，再經coordinator排隊activate；Core才建立active起點。選擇同樣先固定受理時間並結算，t<deadline接受、t>=deadline走作者明示timeout，RAF/定時回呼遲到不讓點擊成功。暫停不補牆鐘，恢復增加attempt、保留已耗時間、重新prepared等待readiness。Auto/快進停回manual。UI只回報/提交事件，不改PC或猜真人選擇。

快照恢復重驗來源簽名、靜態參數/選項/矩形/目標、已解析值、phase/activeAt+elapsedMs=logicalTime與影片等待閉包。舊profile/偏好不由舊槽回寫，未變更有狀態擴展invocation ABI。

## 原創與最終實跑

fixtures/interactive-novel與apps/playground/public/interactive為原創《燈塔來信·光中的選擇》；自行宣告的抽象燈塔色塊/漸亮與正弦音，三段VP8分別配Opus/Vorbis/無音軌。非真人/原作資料。正常fixture命令使用提交的編碼，只有可選build-video.mjs再生成需ffmpeg。

所有命令export TMPDIR=/dev/shm，無新增依賴/鎖文件變更。命令在基線HEAD的修改工作樹執行；日誌revision是當時HEAD，最終原始碼以source-manifest.json及本地提交對應，不表示基線本身已有改動。

| 命令 | 最終結果/證據 |
| --- | --- |
| pnpm install --frozen-lockfile；pnpm generate；pnpm fixture | install.log/generate.log/fixture.log；真實生成物/全部原創資料、摘要與manifest重建成功 |
| pnpm check | check.log；生成一致、strict/headless/邊界、真工廠正反型別通過 |
| pnpm test | unit.log；22文件、164測試通過；最後補禁止skip的Core權限斷言後再跑unit，正式碼未變 |
| GALBOX_EVIDENCE_DIR=docs/evidence/g3-03 pnpm test:browser | browser.log/browser-results.json；build+harness+79通過，0 skip/flaky/unexpected |
| 同evidence環境pnpm test:consumer | consumer.log/consumer-result.json；倉庫外tarball、strict/skipLibCheck=false、原生Node ESM、Canvas影片自然結束/重播/禁存、prepared與期限恢復/所有分支類型/便攜備份/當前profile/銷毀通過 |
| pnpm test:cli | cli.log/result.json/commands.json；62真命令，含WebM/videoPlay/實際容器事實/manifest/build與壞素材保留舊manifest，既有開發/遷移/字體/壓縮音訊/實際瀏覽器和dev HTTP通過 |
| pnpm test:compatibility | compatibility.log/synthetic-results.json；4 synthetic通過，N/F needs-input保留 |
| GALBOX_PERF_ACTIVE_CYCLES=3 GALBOX_PERF_DISPOSE_LIMIT_MS=500 pnpm test:performance | performance.log/performance.json；原Core/API/三次活動銷毀門檻通過 |
| GALBOX_API_BASELINE=9eeb102 pnpm test:release | release.log/release-audit.json；strict宣告、13新增/16宣告變化（按入口計）、0刪除，兩包pack/publish dry-run通過，無外部發布 |
| pnpm dev；node docs/evidence/g3-03/dev-probe.mjs | dev.log/dev-probe.log/dev-result.json/dev-interactive.png；Chromium --disable-webgl與原生API真實影片/保存/重播/熱點/期限/禁存/結局後讀舊槽，單canvas/0 pageerror |

新增12單元：prepared不扣時/不能選、精確deadline與disabled、restore剩餘時間/新attempt/舊事件、已解析enabled不重算、矩形邊界/重疊與disabled、無可用分支/錯矩形的分配前失敗、壞來源/phase/clock/選項保留舊槽、startup與skip/end權限及舊attempt、replay/forbid/ended/initial控制路徑、預算1/8/100同trace、真coordinator的inline Host回呼不重入、三種實際WebM位元組與壞codec/截斷/時長預算。

新增7瀏覽器場景：無WebGL Canvas影片像素/暫停/IndexedDB刷新/矩形熱點/期限恢復/forbid；WebGL影片像素/明示skip/鍵盤熱點/自然timeout；公開自訂嵌入prepared/暫停/舊身份/剩餘時間；blocked重試與舊native end；缺decoder與永久初始forbid影片pending接管/profile一次；pending play dispose/遲到Promise；550ms準備期後的400ms期限仍可接受40ms內輸入，以及停止RAF後450ms輸入仍timeout。沒有刪必要斷言、永久skip或放寬strict。

## 故障修復與過程證據

browser-first.log保留將初始attempt硬編碼為2的測試錯誤；初始安裝本身就更新物理attempt，修正為相對前一attempt+1。browser-second/fourth.log保留1.6秒短片在UI操作/輪詢前已自然結束的失敗；測試只調低原生playbackRate以留下操作窗口，沒有模擬ended或刪自然完成/skip區別斷言。WebGL測試rate=.25，Canvas和dev rate=.5；公開API/consumer/pending/重試等仍使用預設rate。

consumer-first.log保留strict下Pixi AbstractBitmapFont宣告錯誤。根因是公開VideoDiagnostics經裝置實作模組帶入了Pixi宣告；將DTO移至純video-types模組後，consumer-second.log及最終consumer.log在skipLibCheck=false通過，未以型別逃逸/設定放寬遮蓋。

實作另補啟用/選擇入口先固定受理時間與結算準備期，並由停止RAF的真Player測試驗證T22，不把ready回呼延遲算進倒數。初始capture僅對VIDEO_ACTIVE_UNRESTORABLE加入明示受控activation路徑；普通capture/validateRestore仍拒絕。browser-fifth及更早build/harness為過程證據，最後碼以完整check/unit/browser/consumer/CLI/performance/release與dev為準。

## 包與觀測限制

SDK0.1.0 artifacts/galbox-sdk-0.1.0.tgz SHA256=ba41bd16ea1daea0e462ffcb3da937287b89891f5e73cbb0b1aa98e844b3ad67。
CLI0.1.0 artifacts/galbox-cli-0.1.0.tgz SHA256=cbd2e69f36b4139d06fca5091122dd4e8760f73c089948d3675dc21b27fca9b7。
consumer/CLI/audit/實際artifacts一致，本地UNLICENSED alpha，0 push/publish/部署/遠程CI。Snapshot wire=1有新cap限定的wait/task，舊Program/槽位行為保留；不承諾舊二進制前向讀新狀態或穩定API。

原生無WebGL開發實測：renderer=canvas，native WebGL=false/2D=true，影片樣點RGBA=[255, 213, 133, 255]；replay任務attempt遞增、影片時鐘在menu凍結；期限保存耗時47ms，重建並啟用後讀值92ms；forbid=VIDEO_ACTIVE_UNRESTORABLE。結局後再讀舊期限槽，5已讀/interactiveComplete/文字設定仍保留，單canvas/0 pageerror。片段降速僅為測試UI操作窗口，不宣稱SDK已提供playbackRate API或人耳音質驗收。

既有標準小說WebGL性能回歸：228次語義API P95 5.5ms、兩幀觀察P95 57.2ms、最重Core批次P95 1.624ms；活動銷毀 148.7/199.5/267.5ms，原500ms門檻通過。它不代表影片/Canvas吞吐量、真GPU/VRAM/decoder RAM、人耳音質、60FPS、移動設備或其它瀏覽器認證。

下一G3-04：先定平台中立的版本化stream lease/IntegrityEvidence和取消所有權，再以慢速HTTP證明未整檔下載即播放，區分預期摘要/版本化地址/已驗證位元組，補斷網/替換/恢復與獨立consumer。G4–G7/圖文存檔/回溯/流程圖/鑑賞/劇本UI仍未完成。N/F缺真實edition/Program/資源/原檔及原作繼續參照，獨立blocked，M6未完成。

目前dev已啟動 http://127.0.0.1:4173/?demo=interactive 。重啟export TMPDIR=/dev/shm，pnpm install --frozen-lockfile，pnpm dev；建置pnpm build。browser前停dev釋放4173/4174。完整狀態見../../tasks.json。
