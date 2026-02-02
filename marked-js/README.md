# **Markdown Pro Editor 專案說明書**

這是一個基於瀏覽器環境開發的高性能、安全且具備現代 UI 的 **Markdown 即時編輯器**。本專案旨在展示如何整合多個開放原始碼庫，構建一個流暢的使用者創作環境。

## **🚀 核心功能**

1. **即時預覽 (Real-time Preview)**：採用高性能解析引擎，輸入後即時呈現 HTML 結果。  
2. **語法高亮 (Syntax Highlighting)**：整合 Highlight.js，自動辨識並著色多種程式語言。  
3. **安全防護 (XSS Protection)**：內建 DOMPurify 過濾器，確保輸出的 HTML 不包含惡意腳本。  
4. **防抖渲染 (Debounce)**：智慧延遲渲染機制，在處理大型文件時依然保持流暢不卡頓。  
5. **同步捲動 (Sync Scroll)**：編輯區與預覽區比例同步，方便快速校對。  
6. **自動儲存 (Persistence)**：使用 localStorage 技術，即使重新整理頁面，您的內容也不會遺失。

## **🛠 技術棧**

* **核心解析**：[Marked.js](https://marked.js.org/)  
* **安全性**：[DOMPurify](https://github.com/cure53/dompurify)  
* **程式碼美化**：[Highlight.js](https://highlightjs.org/)  
* **樣式體系**：[GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css)  
* **前端架構**：原生 JavaScript (Vanilla JS) + CSS3 Flexbox 佈局

## **📖 如何使用**

1. **開始編寫**：在左側的 MARKDOWN EDITOR 區塊直接輸入 Markdown 語法。  
2. **查看結果**：右側會根據您的輸入自動更新對應的 HTML 樣式。  
3. **插入程式碼**：  
   使用標準的 Markdown 程式碼塊語法：  
   ```javascript  
   console.log("Hello World");  
   ```  
4. **狀態檢查**：上方標題欄會顯示「已存檔」時間，標籤區會即時統計字數與渲染耗時。

## **⚠️ 注意事項**

* 本編輯器目前專為桌面端優化，但在行動裝置上也會切換為上下堆疊模式。  
* 為了保護隱私，所有資料僅存儲於您的瀏覽器本地（localStorage），不會上傳至任何伺服器。

*本專案為教學與實作參考用途，適合用於部落格後台或筆記應用的基礎開發。*

<!-- {"tags":["code","tools"]} -->