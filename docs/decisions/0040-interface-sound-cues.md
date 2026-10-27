# ADR0040：短介面音效與劇情音軌隔離

G3-06有限v1：port-kit.uiSound(audioRef, gain=1)產生單一Schema的UISoundRequest，Player.playUISound(request)回傳started/blocked/cancelled。外部unknown經validator及作品目錄核對；只支援已驗證buffer音訊、最長30秒、gain0..1，未知/錯誤kind/element/超限明確拒絕。正式wire仍為protobuf。

介面hover/click是裝置回饋，沒有PC、已讀、profile或存檔權威，故不建立劇情Task。一次最多一個cue，新cue替換舊cue；短buffer沿現有AssetCache租約與摘要/解碼預算，準備/播放期間固定資源，結束/取消歸還。遲到準備、ended與失敗不得復活舊cue。獨立且惰性建立的AudioContext使暫停劇情的選單仍能響應；套用master×sfx偏好，不覆寫劇情SFX/BGM/voice或bus包絡。

無使用者啟用時明確blocked且不抓資源；真實手勢解鎖後可重試，不自動重放過期hover。開始載入/重新啟用、隱藏/裝置故障與dispose停止cue；不保存或讀檔重放介面音效。UI錯誤只反映於獨立診斷，不讓可選提示音停止劇情。所有等待有界且可取消，最多一個context/source/gain/lease，dispose釋放自有資源。

驗收：真實工廠/validator/protobuf與錯誤資源；真實瀏覽器buffer開始/自然結束、替換與遲到取消、master/sfx/靜音、選單暫停不影響劇情/槽/head、失敗隔離與清理；實包獨立消費原按鈕enterse/clickse。劇情playbgm/fadeoutbgm仍由既有Core音軌/包絡/等待控制，不用此API代替劇情時鐘或假造媒體完成。完整音軌與原作逐段核對另由F-01A記錄。

通知訂閱者前先保留本次請求身份，通知後重檢身份/處置狀態。訂閱者同步dispose或發起更新cue時，舊呼叫必須在建context/抓資源前取消，不得採用較新呼叫的generation繼續；以真實Player訂閱回調與原生context計數驗證。
