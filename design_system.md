# Life Compass｜設計系統化

版本：2026-10-29。本文件取代舊規格，記錄目前採用的數值、元件與修改入口。

## 1. 範圍與原則

- 第一階段：共用基礎元件與「今天」頁已整理；其他頁的專屬樣式待逐頁遷移。
- 維持深綠、螢光綠與四個主功能；相同用途使用相同規格。
- 優先調整排列與留白，避免持續縮小文字。
- 使用現有 Vite／TypeScript／CSS，不引入新的 UI 框架。

## 2. 修改入口

| 想調整什麼 | 檔案 | 規則 |
| --- | --- | --- |
| 字級、間距、顏色與尺寸 | src/styles/variables.css | 優先改 token，不逐頁改數字 |
| 基本排版、頁面標題 | src/styles/global.css | 全站共用 |
| 卡片、按鈕、表單 | src/styles/components.css | 相同元件只維護一份 |
| 斷點、內容寬度、底部導覽 | src/styles/responsive.css | 不任意放大所有字級 |
| 今天頁的排列與組合 | src/styles/today.css | 今天頁的唯一排版入口 |
| 今天頁順序 | src/views/TodayView.ts | 組合既有元件 |
| 回顧中的行動線索 | src/styles/action-follow-through.css | 不再放今天頁重複規則 |

src/main.ts 先載入共用樣式，再載入頁面樣式。不要另加覆蓋檔修補同一元件。

## 3. 文字規格

中文採 Noto Sans TC 與系統備援字體；數字採 Outfit 與等寬數字。
字級以 rem 定義，下表 px 以瀏覽器預設根字級 16px 換算。

| 用途 | Token | 預設 | 字重／行高 |
| --- | --- | --- | --- |
| 頁面標題 | --text-page | 16px | 700／1.1 |
| 卡片標題 | --text-title | 16px | 700／1.1 |
| 正文、列表、主要按鈕 | --text-body | 14px | 正文 400，列表／操作 600；行高 1.2 |
| 說明、日期、次要操作 | --text-caption | 12px | 400 或 600／1.2 |
| 輸入框、下拉選單、文字區 | --text-input | 14px | 400／1.2 |
| 重點數字 | --text-metric | 24px | 700／1.1 |
| 長倒數數字 | --text-metric-wide | 16px | 700／1.1；依可用寬度配置，避免溢出 |

字重 token：--weight-regular／--weight-medium／--weight-strong = 400／600／700。
行高 token：--leading-body／--leading-title／--leading-metric = 1.2／1.1／1.1。
每日問題屬於正文；不以 800／900 字重堆疊重點。
同角色標題不因手機與平板任意改字級；長內容自然換行。
今天頁新說明不用 10／11px；其他頁的舊字級仍需逐步遷移。

## 4. 間距與密度

| Token | 值 | 用途 |
| --- | --- | --- |
| --space-1 | 0px | 必須貼齊的排版；不可作為按鈕、tag 或圖示文字的預設間距 |
| --space-2 | 4px | 同組控制項、欄位與按鈕 |
| --space-3 | 8px | 卡片間、標題到內容、列表上下內距 |
| --space-4 | 8px | 卡片內距、心情選擇到每日問題 |
| --space-6 | 12px | 大內容群組分隔 |

語意入口：--gap-icon／--gap-control = 4px；--gap-content／--space-default／--surface-padding = 8px。
按鈕、tag、欄位等同組控制項之間使用 --gap-control；圖示與文字使用 --gap-icon。
容器內距、標題到內容、不同內容群組使用 --gap-content 或 --surface-padding。
未明確定義用途的 padding、margin、gap，一律以 --space-default（引用 --space-4）為起點，不新增 6px、10px 等中間值。
--page-gutter、--card-padding、--section-gap 皆為 8px，分別引用上述語意 token。
1px 邊框與 2px 選取框不屬於內容間距刻度。
表單文字 14px × 1.2 行高，上下內距各 4px；由 min-height 保持 40px 操作高度。

## 5. 顏色與圓角

| 用途 | Token | 深色預設 |
| --- | --- | --- |
| 頁面／輸入背景 | --bg／--bg-elev | #0f1410／#161d17 |
| 卡片／次層背景 | --card／--card-hi | #1b241c／#243026 |
| 分隔線 | --line | #2b3a2d |
| 正文／說明 | --text／--muted | #f1f5ee／#8fa090 |
| 強調／強調底文字 | --accent／--accent-ink | #b7f24a／#14210a |
| 可閱讀的強調文字 | --accent-text | 深色跟隨 accent，淺色 #3f6c0d |
| 柔和選取底 | --accent-soft | 強調色 12% |

淺色由 [data-theme='light'] 切換相同 token，不替單一頁面硬寫黑／白字。
淺色的綠底按鈕採深色字；文字連結採較深的綠，避免白底上使用亮綠小字。
心情與能量保留語意色；選取狀態搭配邊框與 aria-pressed，不能只靠顏色辨識。
所有介面容器與控制項圓角統一為 12px，由 --radius 管理。
--radius-lg 與 --radius-md 為相容別名，皆引用 --radius，不再區分尺寸。
卡片、彈層、按鈕、圖示按鈕、欄位、標籤與提示皆遵守此規則。
日曆心情插畫、裝飾光暈、狀態圓點與一生點陣屬於圖形，保留原有形狀。

## 6. 共用元件

| 元件 | Class | 規格 |
| --- | --- | --- |
| 卡片 | .card | 8px 內距、12px 圓角、1px 外框 |
| 卡片標頭 | .card__head | 標題左、操作右，底距 8px |
| 卡片說明 | .card__sub | 12px，與標題距 0px |
| 主要按鈕 | .btn.btn--primary | 最小高 40px、14px／600、12px 圓角、上下內距 4px／左右 8px；強調底深色字 |
| 次要按鈕 | .btn.btn--ghost | 與主要按鈕同尺寸、字級、內距與圓角；次層底與外框 |
| 文字操作 | .link-btn | 12px／600、最小高 40px、無外框 |
| 表單 | .field／.textarea | 14px；單行最小高 40px，文字區最小高 80px |

共用按鈕只保留主要與次要兩種，不再提供緊湊或選擇按鈕規格。
原選擇按鈕改用次要按鈕；選取時加 .is-active 與 aria-pressed，保留狀態回饋，尺寸保持一致。
文字操作與圖示操作屬於既有操作呈現方式，不新增另一套文字按鈕尺寸。
--control-height 統一操作高度；同列欄位／新增按鈕使用 stretch，多行可自然增高。
下拉箭頭 --icon-size 為 16px、右側留 8px；右側預留箭頭區，文字不可重疊。
圖示操作要有 aria-label；表單要有 label 或 aria-label；維持可見鍵盤焦點。
Enter 新增、中文選字與文字區換行的既有行為保留。

## 7. 今天頁模板

- 順序：時間摘要 → 今天的心情 → 今天的行動。
- 時間數字共用基線；重點數字 24px，長倒數數字 16px。
- 每日問題／換一題用兩欄 grid，問題換行時操作位置穩定。
- 想做／剛做完共用一個入口；頻率／更多選項同列，展開內容佔整列。
- 行動固定三軌：40px 狀態／可換行內容／40px 收起。
- 卡住？／感受放內容軌道下方，不因文字長短改欄。
- 協助與完成回饋使用相同內嵌容器、8px 內距與共用控制項。

## 8. 響應式

| 寬度 | 規則 |
| --- | --- |
| 小於 600px | 單欄、頁邊 8px、內容最大寬 520px |
| 600–767px | 單欄、頁邊 8px、內容最大寬 760px |
| 768px 起 | 最大寬 1120px；心情／行動左右排列、時間滿寬 |

768px 起底部四個主功能延伸至視窗兩側。字級與圓角不隨斷點放大。
驗收包含 320、390（iPhone 14）、768、1024px 與文字放大後的換行。

## 9. 未來修改流程

1. 先判斷是全站規則、共用元件，還是單頁排列。
2. 全站數值先改 variables.css；不要為同用途增加近似 token。
3. 共用元件改 components.css；今天頁排列改 today.css 的既有 selector。
4. 修改規則時移除舊定義，不在別檔尾端新增同名覆蓋，也不使用 !important。
5. 檢查深／淺色、長文字、空狀態、選取、展開／收起及鍵盤焦點。
6. 執行 npm run build，確認手機與平板版面，並同步更新本文件。
7. 部署另外安排。

常見調整（variables.css）：

- 卡片增加留白：--card-padding: var(--space-6);（12px）
- 卡片之間增加留白：--section-gap: var(--space-6);（12px）
- 提高操作高度：--control-height: 44px; 並檢查欄位／按鈕同高。

不要用 transform: scale() 或 zoom 模擬較小字體。
下一階段依今天樣板遷移探索、目標與回顧的專屬樣式，清除散落舊數值。
