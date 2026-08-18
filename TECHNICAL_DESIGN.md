# 練吓聲：第一階段技術設計

## 實作取向

行動端以 Expo Router、React Native、TypeScript 與 React Context + `useReducer` 管理短暫的練習選擇及本機完成狀態。伺服器資料則透過 TanStack Query 與 tRPC 讀寫，避免把可重新取得的帳戶、進度與 session 資料放入全域 UI state。這個分工讓 App 維持簡潔，同時為第二階段的朋友邀請及每週排行榜保留穩定資料來源。

## 即時音訊

音準畫面在 iOS 與 Android 原生開發建置使用 `react-native-pitchy` 的 YIN 演算法取得頻率、信心值與音量；頻率在裝置上轉換成 MIDI 座標後顯示為音高線。原始麥克風訊號不會被上傳或保存。網頁預覽不執行原生音高 bridge，僅用於驗證介面及導覽；實際音高功能須以 Android／iOS 開發建置或 TestFlight 測試。

鋼琴引導聲使用本機單音樣本，以 `expo-audio` 播放。練習開始時設定可錄音的音訊模式，並要求麥克風權限；聽完鋼琴一次後，畫面只保留目標線與用戶聲線，沒有「高少少／低少少」的彈出式提示。

## 後端與資料

| 資料表 | 用途 | 第二階段預留 |
| --- | --- | --- |
| `user_profiles` | 舒服音域、節拍基準、難度與時區。 | 可加入顯示名稱與朋友可見設定。 |
| `practice_sessions` | 每次完成的不可變練習事件及 idempotency key。 | 可作週榜的日期與習慣統計來源。 |
| `session_metrics` | 音準穩定度、拍子跟隨、完成次數與下一步。 | 可按個人進步幅度建立比較。 |
| `notification_preferences` | 溫和提醒的開關及最後提醒時間。 | 可擴充各類提醒渠道。 |

每次完成練習均先以 UUID 作為冪等鍵；若網絡暫時失敗，完成事件會寫入 AsyncStorage outbox，登入後再次回到首頁時重試同步。後端收到同一冪等鍵時只保留一筆 session，避免離線重試重複計數。

## 私隱與帳戶

第一階段只同步練習紀錄、分項數據、舒服音域與通知偏好，不保存原始錄音。設定頁已提供受保護的「刪除帳戶及資料」程序，按使用者 ID 移除 profile、session、metrics 及提醒偏好後登出。測試階段使用模板提供的安全 OAuth 流程；Apple／Google 原生身份供應商會在用戶建立對應開發者帳戶與完成 provider 設定後接入。

## 提醒

溫和提醒採本機一次性排程，在一次練習完成後安排三日後的提示；再次完成練習或在設定中關閉後，舊提示會取消。這個第一階段做法毋須保存或傳送裝置推送 token。正式遠端推送及背景傳遞可在發佈帳戶配置完成後加入。

## 驗證範圍

單元測試會驗證九個練習目錄、預設分類、完成 state 轉換與 Hz-to-MIDI 計算。TypeScript 檢查用於驗證所有路由、tRPC 及原生 bridge 邊界。真正麥克風、耳機路由、通知權限及原生 YIN bridge 必須以實體 iPhone 及 Android 測試建置驗證，不能由網頁預覽取代。

## 參考資料

[1] [Expo：Real-time audio processing with Expo and native code](https://expo.dev/blog/real-time-audio-processing-with-expo-and-native-code)

[2] [rnheroes/react-native-pitchy](https://github.com/rnheroes/react-native-pitchy)

