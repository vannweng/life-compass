/**
 * @description 每日紀錄與每日一問服務
 * @module services/DailyService
 */

import { createEmptyEntry, MOOD_OPTIONS, type DailyEntry } from '../models/DailyEntryModel';
import { DAILY_QUESTIONS, type DailyQuestion } from '../models/DailyQuestionModel';
import { DateService } from './DateService';
import { STORAGE_KEYS, StorageService } from './StorageService';

/** @description 以日期為鍵的紀錄表 */
type EntryMap = Record<string, DailyEntry>;

/**
 * @description 每日紀錄服務
 */
export class DailyService {
  /**
   * @description 取得全部紀錄
   * @returns 日期 → 紀錄
   */
  static getAll(): EntryMap {
    return StorageService.get<EntryMap>(STORAGE_KEYS.DAILY_ENTRIES, {});
  }

  /**
   * @description 取得某日紀錄（不存在則回傳空白）
   * @param date YYYY-MM-DD
   * @returns 單日紀錄
   */
  static get(date: string): DailyEntry {
    return this.getAll()[date] ?? createEmptyEntry(date);
  }

  /**
   * @description 更新某日紀錄
   * @param date YYYY-MM-DD
   * @param patch 欲更新欄位
   * @returns 更新後紀錄
   */
  static update(date: string, patch: Partial<Omit<DailyEntry, 'date'>>): DailyEntry {
    const all = this.getAll();
    const next: DailyEntry = { ...(all[date] ?? createEmptyEntry(date)), ...patch, date };
    all[date] = next;
    StorageService.set(STORAGE_KEYS.DAILY_ENTRIES, all);
    return next;
  }

  /**
   * @description 補登或修改今天及過去日期的心情，保留當日其他紀錄
   * @param date YYYY-MM-DD
   * @param value 心情選項數值
   * @returns 是否成功儲存
   */
  static setMoodForDate(date: string, value: number): boolean {
    const option = MOOD_OPTIONS.find((m): boolean => m.value === value);
    if (!option || !/^\d{4}-\d{2}-\d{2}$/.test(date)
      || DateService.toKey(DateService.fromKey(date)) !== date || date > DateService.todayKey()) return false;
    this.update(date, { mood: option.value });
    return true;
  }

  /**
   * @description 判斷紀錄是否有實質內容
   * @param entry 單日紀錄
   * @returns 是否已記錄
   */
  static hasContent(entry: DailyEntry): boolean {
    return entry.mood !== null || entry.note.trim() !== '' || entry.answer.trim() !== '';
  }

  /**
   * @description 依日期決定每日一問（同一天固定同一題，可被手動換題覆寫）
   * @param date YYYY-MM-DD
   * @returns 當日問題
   */
  static questionFor(date: string): DailyQuestion {
    const entry = this.get(date);
    const chosen = DAILY_QUESTIONS.find((q) => q.id === entry.questionId);
    if (chosen) return chosen;
    const index = Math.abs(DateService.diffDays('2024-01-01', date)) % DAILY_QUESTIONS.length;
    return DAILY_QUESTIONS[index] ?? (DAILY_QUESTIONS[0] as DailyQuestion);
  }

  /**
   * @description 換下一題並記錄
   * @param date YYYY-MM-DD
   * @returns 新問題
   */
  static shuffleQuestion(date: string): DailyQuestion {
    const current = this.questionFor(date);
    const idx = DAILY_QUESTIONS.findIndex((q) => q.id === current.id);
    const next = DAILY_QUESTIONS[(idx + 1) % DAILY_QUESTIONS.length] ?? current;
    this.update(date, { questionId: next.id, answer: '' });
    return next;
  }
}
