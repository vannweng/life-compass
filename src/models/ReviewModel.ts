/**
 * @description 週 / 月回顧資料模型
 * @module models/ReviewModel
 */

/** @description 回顧類型 */
export type ReviewType = 'week' | 'month';

/**
 * @description 一份回顧
 */
export interface Review {
  /** 期間鍵值：週為 YYYY-Www，月為 YYYY-MM */
  periodKey: string;
  type: ReviewType;
  answers: string[];
  updatedAt: string;
}

/** @description 每週回顧問題（3 題，低負擔） */
export const WEEKLY_QUESTIONS: readonly string[] = [
  '這週讓你最有能量的時刻是？',
  '這週你發現了自己什麼？',
  '下週想多做一點什麼、少做一點什麼？',
];

/** @description 每月回顧問題 */
export const MONTHLY_QUESTIONS: readonly string[] = [
  '這個月你完成或靠近了什麼？',
  '這個月最大的收穫或領悟是？',
  '下個月想聚焦在哪裡？',
];
