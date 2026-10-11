/**
 * @description 洞察與統計服務：從日常紀錄中幫使用者「看見自己」
 * @module services/InsightService
 */

import type { MoodValue } from '../models/DailyEntryModel';
import { ActionService } from './ActionService';
import { DailyService } from './DailyService';
import { DateService } from './DateService';
import { GoodTimeService } from './GoodTimeService';
import { normalizeText } from './TextService';

/**
 * @description 活動能量統計
 */
export interface ActivityInsight {
  activity: string;
  count: number;
  avgEnergy: number;
  flowCount: number;
  /** 最近一筆紀錄 ID（用於轉成實驗） */
  latestId: string;
}

/**
 * @description 洞察服務
 */
export class InsightService {
  /**
   * @description 依活動分組統計能量
   * @param days 統計天數
   * @returns 活動統計陣列
   */
  static activityStats(days: number): ActivityInsight[] {
    const groups = new Map<string, ActivityInsight & { sum: number }>();
    for (const e of GoodTimeService.recent(days)) {
      const key = normalizeText(e.activity);
      const g = groups.get(key) ?? { activity: e.activity, count: 0, avgEnergy: 0, flowCount: 0, latestId: e.id, sum: 0 };
      g.count += 1;
      g.sum += e.energy;
      g.flowCount += e.isFlow ? 1 : 0;
      g.avgEnergy = g.sum / g.count;
      groups.set(key, g);
    }
    return [...groups.values()].map(({ sum: _sum, ...rest }) => rest);
  }

  /**
   * @description 最讓你有能量的活動（心流加權）
   * @param days 天數
   * @param limit 筆數
   * @returns 排序後活動
   */
  static topEnergizers(days = 14, limit = 3): ActivityInsight[] {
    return this.activityStats(days)
      .filter((a) => a.avgEnergy > 0)
      .sort((a, b) => b.avgEnergy + b.flowCount * 0.5 - (a.avgEnergy + a.flowCount * 0.5))
      .slice(0, limit);
  }

  /**
   * @description 最消耗你的活動
   * @param days 天數
   * @param limit 筆數
   * @returns 排序後活動
   */
  static topDrainers(days = 14, limit = 3): ActivityInsight[] {
    return this.activityStats(days).filter((a) => a.avgEnergy < 0).sort((a, b) => a.avgEnergy - b.avgEnergy).slice(0, limit);
  }

  /**
   * @description 某天是否有任何紀錄（心情 / 隨筆 / 每日一問 / 好時光 / 行動）
   * @param date YYYY-MM-DD
   * @returns 是否已記錄
   */
  static isRecorded(date: string): boolean {
    return DailyService.hasContent(DailyService.get(date))
      || GoodTimeService.byDate(date).length > 0
      || ActionService.doneCount(date) > 0;
  }

  /**
   * @description 某月已記錄天數（溫和機制：不因中斷歸零）
   * @param monthKey YYYY-MM
   * @returns 天數
   */
  static recordedDaysInMonth(monthKey: string = DateService.monthKey()): number {
    return DateService.daysInMonth(monthKey).filter((d) => this.isRecorded(d)).length;
  }

  /**
   * @description 連續記錄天數（今天未記錄時從昨天起算）
   * @returns 天數
   */
  static streak(): number {
    const days = DateService.lastNDays(366).reverse();
    const start = this.isRecorded(days[0] ?? '') ? 0 : 1;
    let count = 0;
    for (let i = start; i < days.length && this.isRecorded(days[i] ?? ''); i++) count++;
    return count;
  }

  /**
   * @description 最近 n 天心情序列
   * @param days 天數
   * @returns 日期與心情
   */
  static moodSeries(days: number): Array<{ date: string; mood: MoodValue | null }> {
    const all = DailyService.getAll();
    return DateService.lastNDays(days).map((date) => ({ date, mood: all[date]?.mood ?? null }));
  }
}
