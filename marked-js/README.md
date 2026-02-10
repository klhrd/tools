# Markdown Pro Editor v4.3

**Markdown Pro** 是一款輕量、高效且極具隱私保護的 Markdown 線上編輯器。它最大的特色是 **「網址即檔案」**：所有的編輯內容都會經過壓縮並存儲在瀏覽器的 URL Hash 中，無需資料庫，只要分享網址，對方就能看到完全相同的內容。

## ✨ 核心特色

- **無伺服器存儲**：採用 `LZ-String` 壓縮演算法，將內容編碼於 URL 中。
- **即時預覽**：基於 `Marked.js` 提供毫秒級的渲染速度。
- **數學公式支援**：完全整合 `KaTeX`，支援高品質的 $LaTeX$ 數學表達式。
- **代碼高亮**：內建 `Highlight.js`，自動識別並美化程式碼區塊。
- **縮網址整合**：整合 `is.gd` 與 `TinyURL` API（透過 AllOrigins 代理），解決長網址分享問題。
- **跨平台適應**：支援行動端切換模式（編輯/預覽）以及系統層級的深色模式自動切換。
- **檔案操作**：支援 `.md` 或 `.txt` 檔案的匯入與匯出。

## 🚀 快速開始

1.  **直接編輯**：在左側（或移動端的編輯模式）輸入 Markdown 內容。
2.  **即時分享**：點擊右上角的 **分享 (Share)** 圖示，複製長連結或產生縮網址。
3.  **離線使用**：這是一個純 HTML 檔案，您可以將其下載到本地，隨時隨地開啟瀏覽器即可編輯。

## 🛠 使用技術

- **解析器**: [Marked.js](https://marked.js.org/)
- **安全性**: [DOMPurify](https://github.com/cure53/dompurify) (防止 XSS 攻擊)
- **壓縮**: [LZ-String](https://pieroxy.net/blog/pages/lz-string/index.html)
- **樣式**: [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css)
- **字體**: Google Material Symbols

## 📋 版本更新 (v4.3)

- **穩定性優化**：優化了在 GitHub Pages 等環境下縮網址功能的穩定性。
- **跨網域支援**：採用 AllOrigins 代理機制，解決了縮網址服務常見的 CORS 跨網域限制。
- **容量監控**：新增網址字元數計算器與狀態燈（綠/黃/紅），提醒使用者當前 URL 的長度健康狀態。

<!-- {"tags":["code","nailed",".md"]} -->