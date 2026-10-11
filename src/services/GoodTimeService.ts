/**
 * @description 好時光（能量）紀錄服務
 * @module services/GoodTimeService
 */

import type { EnergyLevel, GoodTimeEntry } from '../models/GoodTimeModel';
import { DateService } from './DateService';
import { STORAGE_KEYS, StorageService } from './StorageService';
import { createId } from './TextService';

/**
 * @description 好時光服務
 */
export class GoodTimeService {
  /**
   * @description 取得所有紀錄（新到舊）
   * @returns 紀錄陣列
   */
  static getAll(): GoodTimeEntry[] {
    return StorageService.get<GoodTimeEntry[]>(STORAGE_KEYS.GOOD_TIMES, []);
  }

  /**
   * @description 新增一筆紀錄
   * @param activity 活動描述
   * @param energy 能量值
   * @param isFlow 是否心流
   * @returns 新紀錄
   */
  static add(activity: string, energy: EnergyLevel, isFlow: boolean): GoodTimeEntry {
    const entry: GoodTimeEntry = {
      id: createId('gt'),
      date: DateService.todayKey(),
      time: DateService.nowTime(),
      activity: activity.trim(),
      energy,
      isFlow,
    };
    StorageService.set(STORAGE_KEYS.GOOD_TIMES, [entry, ...this.getAll()]);
    return entry;
  }

  /**
   * @description 刪除紀錄
   * @param id 紀錄 ID
   * @returns 無
   */
  static remove(id: string): void {
    StorageService.set(STORAGE_KEYS.GOOD_TIMES, this.getAll().filter((e) => e.id !== id));
  }

  /**
   * @description 取得某日紀錄
   * @param date YYYY-MM-DD
   * @returns 紀錄陣列
   */
  static byDate(date: string): GoodTimeEntry[] {
    return this.getAll().filter((e) => e.date === date);
  }

  /**
   * @description 取得最近一筆能量紀錄的日期，供歷史入口定位
   * @returns YYYY-MM-DD；沒有紀錄時回傳 null
   */
  static latestDate(): string | null {
    return this.getAll().map((entry: GoodTimeEntry): string => entry.date).sort().at(-1) ?? null;
  }

  /**
   * @description 取得最近 n 天紀錄
   * @param days 天數
   * @returns 紀錄陣列
   */
  static recent(days: number): GoodTimeEntry[] {
    const keys = new Set(DateService.lastNDays(days));
    return this.getAll().filter((e) => keys.has(e.date));
  }

  /**
   * @description 依 ID 取得紀錄
   * @param id 紀錄 ID
   * @returns 紀錄或 undefined
   */
  static find(id: string): GoodTimeEntry | undefined {
    return this.getAll().find((e) => e.id === id);
  }
}
