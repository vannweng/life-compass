/**
 * @description 餘生時鐘計算服務：時間緊迫感的核心
 * @module services/LifeClockService
 */

import type { UserProfile } from '../models/ProfileModel';
import { DateService, MS_PER_DAY } from './DateService';

/**
 * @description 餘生統計結果
 */
export interface LifeStats {
  ageYears: number;
  /** 今天是人生第幾天 */
  lifeDayNumber: number;
  daysLeft: number;
  weeksLeft: number;
  summersLeft: number;
  weekendsLeft: number;
  worldCupsLeft: number;
  /** 生命已走過百分比 */
  consumedPct: number;
  /** 今年剩餘天數 */
  yearDaysLeft: number;
  /** 今年已過百分比 */
  yearPct: number;
}

/**
 * @description 餘生時鐘
 */
export class LifeClockService {
  /**
   * @description 預期終點時間
   * @param profile 使用者設定
   * @returns 終點日期
   */
  static endDate(profile: UserProfile): Date {
    const birth = DateService.fromKey(profile.birthDate);
    return new Date(birth.getFullYear() + profile.expectedAge, birth.getMonth(), birth.getDate());
  }

  /**
   * @description 計算完整餘生統計
   * @param profile 使用者設定
   * @param now 目前時間（可注入以便測試）
   * @returns 統計結果
   */
  static calculate(profile: UserProfile, now: Date = new Date()): LifeStats {
    const birth = DateService.fromKey(profile.birthDate);
    const end = this.endDate(profile);
    const livedMs = Math.max(0, now.getTime() - birth.getTime());
    const leftMs = Math.max(0, end.getTime() - now.getTime());
    const daysLeft = Math.floor(leftMs / MS_PER_DAY);
    const yearsLeft = leftMs / (365.25 * MS_PER_DAY);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
    const yearTotal = yearEnd.getTime() - yearStart.getTime();

    return {
      ageYears: Math.floor(livedMs / (365.25 * MS_PER_DAY)),
      lifeDayNumber: Math.floor(livedMs / MS_PER_DAY) + 1,
      daysLeft,
      weeksLeft: Math.floor(daysLeft / 7),
      summersLeft: Math.floor(yearsLeft),
      weekendsLeft: Math.floor(daysLeft / 7),
      worldCupsLeft: Math.floor(yearsLeft / 4),
      consumedPct: Math.min(100, (livedMs / (end.getTime() - birth.getTime())) * 100),
      yearDaysLeft: Math.ceil((yearEnd.getTime() - now.getTime()) / MS_PER_DAY),
      yearPct: ((now.getTime() - yearStart.getTime()) / yearTotal) * 100,
    };
  }

  /**
   * @description 即時剩餘秒數
   * @param profile 使用者設定
   * @returns 秒數
   */
  static secondsLeft(profile: UserProfile): number {
    return Math.max(0, Math.floor((this.endDate(profile).getTime() - Date.now()) / 1000));
  }

  /**
   * @description 一生月份格子（已過 / 剩餘）
   * @param profile 使用者設定
   * @returns 總月數與已過月數
   */
  static monthGrid(profile: UserProfile): { total: number; lived: number } {
    const birth = DateService.fromKey(profile.birthDate);
    const now = new Date();
    const lived = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return { total: profile.expectedAge * 12, lived: Math.max(0, lived) };
  }
}
