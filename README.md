# Bucket List & Time System 專案說明文件

本專案為人生願望清單與餘生時間管理系統（Bucket List & Life Clock System），採用 Feature-First / Clean Architecture 進行架構設計。

## 📐 架構設計與規範

專案嚴格遵守以下開發規範（請參閱 `.cursorrules`、`.windsurfrules` 或 `AGENTS.md`）：

1. **單檔 200 行限制**：任何 TypeScript / JavaScript / CSS 檔案程式碼行數嚴格限制在 200 行以內。
2. **強型別檢查**：全面使用 TypeScript 嚴格型別定義。
3. **職責分離目錄結構**：
   - `/models`: 定義資料 Models、Interfaces 與 Types。
   - `/services`: 處理商業邏輯、計算與 LocalStorage 存取。
   - `/components`: 拆分介面元件（Header, Modals, Cards 等）。
   - `/views`: 獨立分頁視圖（Daily Log, Monthly Plan, Bucket List, Achievement）。
   - `/styles`: 模組化 CSS 樣式檔。

## 🚀 開始使用

安裝依賴後執行 `npm run dev`，用終端機顯示的網址開啟網站。執行 `npm run build` 可檢查型別並產生靜態網站。

## GitHub Pages

專案包含 `.github/workflows/deploy.yml`。將專案發布到 GitHub 的 `main` 分支後，在儲存庫的 Settings → Pages 將 Source 設為 GitHub Actions；之後每次推送都會自動更新網站。請使用一般專案儲存庫名稱，不要使用 `<使用者名稱>.github.io` 作為儲存庫名稱。

網站資料儲存在各使用者瀏覽器的 localStorage，不會由 GitHub Pages 同步或備份。
