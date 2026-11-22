/**
 * @description 特長線索服務：把「能量」與「順手度」交叉，分開判斷充能與擅長
 * @module services/StrengthService
 */

import { GoodTimeService } from './GoodTimeService';
import { normalizeText } from './TextService';

/** @description 統計天數（順手度為選填，窗口比能量地圖長） */
const WINDOW_DAYS = 30;
/** @description 單一活動至少要有幾次順手度評分才納入判斷 */
export const MIN_RATED = 2;
/** @description 視為「順手」的平均順手度下限 */
const EASY_AT = 2.5;
/** @description 視為「吃力」的平均順手度上限 */
const HARD_AT = 1.5;

/**
 * @description 單一活動的交叉統計
 */
export interface StrengthItem {
  activity: string;
  rated: number;
  avgEnergy: number;
  avgEase: number;
}

/**
 * @description 三種線索分組
 */
export interface StrengthGroups {
  /** 充能且順手：可能是特長 */
  strengths: StrengthItem[];
  /** 順手但不充能：擅長，但不一定想多做 */
  skillOnly: StrengthItem[];
  /** 充能但吃力：有熱情，還在練習 */
  passion: StrengthItem[];
  /** 有順手度評分的活動數（達 MIN_RATED 次者） */
  eligible: number;
}

/**
 * @description 特長線索服務
 */
export class StrengthService {
  /**
   * @description 依活動統計平均能量與平均順手度
   * @returns 達評分門檻的活動統計
   */
  static items(): StrengthItem[] {
    const groups = new Map<string, { activity: string; rated: number; energy: number; ease: number }>();
    for (const e of GoodTimeService.recent(WINDOW_DAYS)) {
      if (!e.ease) continue;
      const key = normalizeText(e.activity);
      const g = groups.get(key) ?? { activity: e.activity, rated: 0, energy: 0, ease: 0 };
      g.rated += 1;
      g.energy += e.energy;
      g.ease += e.ease;
      groups.set(key, g);
    }
    return [...groups.values()].filter((g) => g.rated >= MIN_RATED)
      .map((g) => ({ activity: g.activity, rated: g.rated, avgEnergy: g.energy / g.rated, avgEase: g.ease / g.rated }));
  }

  /**
   * @description 分組線索
   * @param limit 每組最多筆數
   * @returns 三種線索分組
   */
  static groups(limit = 2): StrengthGroups {
    const all = this.items();
    const top = (list: StrengthItem[]): StrengthItem[] => list.slice(0, limit);
    return {
      strengths: top(all.filter((i) => i.avgEnergy > 0 && i.avgEase >= EASY_AT).sort((a, b) => b.avgEnergy + b.avgEase - (a.avgEnergy + a.avgEase))),
      skillOnly: top(all.filter((i) => i.avgEnergy <= 0 && i.avgEase >= EASY_AT).sort((a, b) => b.avgEase - a.avgEase)),
      passion: top(all.filter((i) => i.avgEnergy > 0 && i.avgEase <= HARD_AT).sort((a, b) => b.avgEnergy - a.avgEnergy)),
      eligible: all.length,
    };
  }
}
