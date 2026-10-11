/**
 * @description 人生目標（原人生清單項目）資料模型
 * @module models/GoalModel
 */

/** @description 目標狀態：想做清單 → 本月聚焦中 → 已完成；沿用既有儲存鍵值 */
export type GoalStatus = 'idea' | 'active' | 'done';

/** @description 清單狀態篩選 */
export type GoalStatusFilter = 'all' | GoalStatus;

/** @description 狀態篩選選項 */
export interface GoalFilterOption {
  id: GoalStatusFilter;
  label: string;
}

/** @description 人生階段（適合執行的年齡區間） */
export type LifeStage = 'q1' | 'q2' | 'q3' | 'q4';

/**
 * @description 分類標籤
 */
export interface CategoryTag {
  id: string;
  name: string;
  color: string;
}

/**
 * @description 人生階段設定
 */
export interface StageInfo {
  id: LifeStage;
  title: string;
  subtitle: string;
  color: string;
}

/**
 * @description 人生目標
 */
export interface Goal {
  id: string;
  title: string;
  category: string;
  stage: LifeStage;
  status: GoalStatus;
  /** 被設為聚焦的月份 YYYY-MM 清單 */
  focusMonths: string[];
  createdAt: string;
  completedDate: string | null;
  /** 完成心得或補充 */
  note: string;
}

/** @description 每月聚焦上限：聚焦越少，越容易做到 */
export const MAX_FOCUS_PER_MONTH = 3;

/** @description 預設分類 */
export const DEFAULT_CATEGORIES: readonly CategoryTag[] = [
  { id: 'experience', name: '體驗', color: '#22D3EE' },
  { id: 'growth', name: '成長', color: '#818CF8' },
  { id: 'career', name: '事業', color: '#60A5FA' },
  { id: 'relationship', name: '關係', color: '#C084FC' },
  { id: 'health', name: '身心', color: '#34D399' },
];

/** @description 人生階段對照 */
export const STAGE_MAP: Record<LifeStage, StageInfo> = {
  q1: { id: 'q1', title: '體能期', subtitle: '高體能／冒險（20–35）', color: '#F87171' },
  q2: { id: 'q2', title: '累積期', subtitle: '精力與資源累積（30–50）', color: '#FB923C' },
  q3: { id: 'q3', title: '熟齡期', subtitle: '沉澱與品質（50–70）', color: '#FACC15' },
  q4: { id: 'q4', title: '隨時', subtitle: '沒有年齡門檻', color: '#F472B6' },
};

/** @description 狀態中文標籤 */
export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  idea: '想做清單',
  active: '聚焦中',
  done: '已完成',
};

/** @description 清單分段切換列的選項 */
export const GOAL_STATUS_FILTERS: readonly GoalFilterOption[] = [
  { id: 'all', label: '全部' },
  { id: 'idea', label: GOAL_STATUS_LABELS.idea },
  { id: 'active', label: GOAL_STATUS_LABELS.active },
  { id: 'done', label: GOAL_STATUS_LABELS.done },
];

/**
 * @description 判斷字串是否為合法人生階段
 * @param value 待檢查值
 * @returns 是否為 LifeStage
 */
export function isLifeStage(value: unknown): value is LifeStage {
  return value === 'q1' || value === 'q2' || value === 'q3' || value === 'q4';
}
