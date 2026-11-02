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
  { id: 'today', label: '今天', iconPath: 'sun' },
  { id: 'explore', label: '探索', iconPath: 'compass' },
  { id: 'goals', label: '目標', iconPath: 'target' },
  { id: 'review', label: '回顧', iconPath: 'chart-line' },
];
