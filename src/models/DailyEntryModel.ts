/**
 * @description 每日紀錄資料模型（依日期儲存，不再互相覆蓋）
 * @module models/DailyEntryModel
 */

/** @description 心情分數 1（沉重）~ 5（充實） */
export type MoodValue = 1 | 2 | 3 | 4 | 5;

/**
 * @description 心情選項設定
 */
export interface MoodOption {
  value: MoodValue;
  label: string;
  color: string;
}

/**
 * @description 單日紀錄
 */
export interface DailyEntry {
  /** 日期 YYYY-MM-DD */
  date: string;
  mood: MoodValue | null;
  note: string;
  /** 當日回答的每日一問 ID */
  questionId: string | null;
  answer: string;
}

/** @description 心情選項（由低到高） */
export const MOOD_OPTIONS: readonly MoodOption[] = [
  { value: 1, label: '沉重', color: '#F87171' },
  { value: 2, label: '疲憊', color: '#FB923C' },
  { value: 3, label: '普通', color: '#94A3B8' },
  { value: 4, label: '平靜', color: '#34D399' },
  { value: 5, label: '充實', color: '#A3E635' },
];

/**
 * @description 建立空白單日紀錄
 * @param date 日期 YYYY-MM-DD
 * @returns 空白紀錄
 */
export function createEmptyEntry(date: string): DailyEntry {
  return { date, mood: null, note: '', questionId: null, answer: '' };
}
