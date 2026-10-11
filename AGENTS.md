# AI Agent Rules & Architecture Guidelines (AGENTS.md)

## 1. 架構規範 (Architecture Standards)
- **模組化架構**：本專案強制採用 Feature-First 與 Clean Architecture 模組化架構，將 UI 呈現、商業邏輯與資料層徹底解耦。
- **單一檔案行數限制**：任何單一檔案（包含 TypeScript, JavaScript, HTML, CSS）**嚴格限制不得超過 200 行**。若檔案接近或超過 200 行，必須拆分為更專一的子模組或子組件。
- **高內聚低耦合**：組件與視圖僅專注於 UI 繪製與使用者互動，商業邏輯與資料存取必須移至 `/services` 與 `/models`。

## 2. 目錄結構與職責 (Directory Structure & Responsibilities)
- `/models`: **資料模型層**。負責定義 TypeScript 介面 (Interfaces)、型別 (Types)、Enum、Schema 驗證與預設常量，不包含 DOM 操作或 API 傳輸。
- `/services`: **服務邏輯層**。負責處理商業邏輯、資料運算（例如壽命進度算式、倒數計時計算）、LocalStorage 本地儲存與事件調度。
- `/components`: **UI 組件層**。獨立且可重複使用的 UI 拆分單元（例如 Header, Navigation Bar, Card, Modal 彈窗, Form Controls）。單一組件檔案必須小於 200 行。
- `/views`: **視圖頁面層**。包含主頁面與分頁視圖（例如 DailyLogView, MonthlyPlanView, BucketListView, AchievementView），負責組合 /components 並調用 /services。
- `/styles`: **樣式系統**。採用模組化 CSS（包含變數設計系統 `variables.css`、全域 `global.css`、組件 `components.css` 與視圖 `views.css`）。

## 3. 程式風格與規範 (Coding Style & Guidelines)
- **強型別檢查 (TypeScript Strict Mode)**：
  - 必須使用 TypeScript 進行嚴格型別檢查。
  - **嚴格禁用 `any` 型別**，不確定型別時請使用明確 interface、union type 或 `unknown`。
  - 所有函式參數、回傳值以及 class 屬性必須宣告明確型別。
- **統一命名規範**：
  - **Class / Component / View / Model 檔名與名稱**：採用 `PascalCase`（例：`UserCenterModal`, `BucketItemModel.ts`）。
  - **變數 / 函式 / 方法**：採用 `camelCase`（例：`calculateProgress`, `handleItemSave`）。
  - **全域常數**：採用 `UPPER_SNAKE_CASE`（例：`DEFAULT_EXPECTED_AGE`, `STORAGE_KEYS`）。
  - **CSS 類別與一般設定檔名**：採用 `kebab-case`（例：`user-center-card`, `theme-toggle-group`）。
- **註解規範 (JSDoc)**：
  - 所有的 Class, Interface, Function 都必須包含 JSDoc 註解。
  - 註解必須明確說明功能描述 (`@description`)、參數描述 (`@param`) 與回傳值 (`@returns`)。
