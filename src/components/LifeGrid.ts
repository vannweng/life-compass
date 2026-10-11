/**
 * @description 一生點陣圖與心情趨勢（回顧頁的時間視覺化）
 * @module components/LifeGrid
 */

import { MOOD_OPTIONS } from '../models/DailyEntryModel';
import type { UserProfile } from '../models/ProfileModel';
import { InsightService } from '../services/InsightService';
import { LifeClockService } from '../services/LifeClockService';

/**
 * @description 一生點陣圖與心情趨勢
 */
export class LifeGrid {
  /**
   * @description 渲染一生月份點陣圖
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static renderGrid(profile: UserProfile): string {
    const { total, lived } = LifeClockService.monthGrid(profile);
    const cells = Array.from({ length: total }, (_, i) => `<i class="${i < lived ? 'lived' : i === lived ? 'now' : ''}"></i>`).join('');
    const s = LifeClockService.calculate(profile);
    return `<section class="card" id="life-grid">
      <div class="card__head"><div><h3>我的一生</h3><p class="card__sub">每個圓點是一個月 · 已走過 ${s.consumedPct.toFixed(1)}%</p></div></div>
      <div class="life-grid">${cells}</div></section>`;
  }

  /**
   * @description 渲染最近 14 天心情趨勢
   * @returns HTML 字串
   */
  static renderMood(): string {
    const bars = InsightService.moodSeries(14).map((d) => {
      const opt = MOOD_OPTIONS.find((m) => m.value === d.mood);
      const h = d.mood ? d.mood * 20 : 6;
      return `<span title="${d.date}" style="height:${h}%;${opt ? `background:${opt.color}` : ''}"></span>`;
    }).join('');
    return `<section class="card" id="mood-trend">
      <div class="card__head"><div><h3>最近 14 天心情</h3><p class="card__sub">本月已記錄 ${InsightService.recordedDaysInMonth()} 天</p></div></div>
      <div class="mood-trend">${bars}</div></section>`;
  }
}
