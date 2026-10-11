/**
 * @description 主導覽分頁資料模型
 * @module models/TabModel
 */

/** @description 四大分頁 ID */
export type TabId = 'today' | 'explore' | 'goals' | 'review';

/**
 * @description 分頁設定
 */
export interface TabInfo {
  id: TabId;
  label: string;
  /** 內嵌 SVG path 資料 */
  iconPath: string;
}

/** @description 四大分頁 */
export const NAV_TABS: readonly TabInfo[] = [
  { id: 'today', label: '今天', iconPath: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.4-6.4-1.4 1.4M7 17l-1.4 1.4m12.8 0L17 17M7 7 5.6 5.6M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z' },
  { id: 'explore', label: '探索', iconPath: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z' },
  { id: 'goals', label: '目標', iconPath: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-4a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z' },
  { id: 'review', label: '回顧', iconPath: 'M4 19V5m0 14h16M8 15l3-4 3 2 4-6' },
];
