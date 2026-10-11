/**
 * @description 能量洞察：從好時光紀錄找出讓你有能量 / 被消耗的事
 * @module components/EnergyInsight
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { GoodTimeService } from '../services/GoodTimeService';
import { DateService } from '../services/DateService';
import { InsightService, type ActivityInsight } from '../services/InsightService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon } from './Dom';

/** @description 統計天數 */
const WINDOW_DAYS = 14;
/** @description 開始顯示洞察所需的最少紀錄數 */
const MIN_ENTRIES = 3;

/**
 * @description 能量洞察卡片
 */
export class EnergyInsight {
  /**
   * @description 渲染單一活動列
   * @param a 活動統計
   * @param rank 名次
   * @param drain 是否為消耗型
   * @returns HTML 字串
   */
  private static item(a: ActivityInsight, rank: number, drain: boolean): string {
    const pct = Math.min(100, Math.abs(a.avgEnergy) * 50);
    return `<div class="insight-item">
      <span class="insight-rank ${drain ? 'insight-rank--drain' : ''}">${rank}</span>
      <div class="row__main"><div class="row__title">${escapeHtml(a.activity)}</div>
        <div class="row__meta">${a.count} 次${a.flowCount ? ` · ${a.flowCount} 次心流` : ''}</div>
        <div class="compare-bar"><span style="width:${pct}%;${drain ? 'background:var(--danger)' : ''}"></span></div></div>
      ${drain ? '' : `<button class="btn btn--ghost btn--sm" data-action="insight:experiment" data-id="${a.latestId}">想試試</button>`}
    </div>`;
  }

  /**
   * @description 渲染卡片
   * @returns HTML 字串
   */
  static render(): string {
    const count = GoodTimeService.recent(WINDOW_DAYS).length;
    const historyLink = `<button class="link-btn" data-action="insight:history">過去紀錄${icon(ICONS.arrow, 14)}</button>`;
    if (count < MIN_ENTRIES) {
      return `<section class="card" id="energy-insight"><div class="card__head"><h3>你的能量地圖</h3>${historyLink}</div>
        <div class="empty"><b>再記錄 ${MIN_ENTRIES - count} 筆，就能看到你的規律</b>到「今天」記下讓你有（或沒有）能量的時刻</div>
        <button class="btn btn--ghost btn--block" data-action="insight:record">到今天記錄${icon(ICONS.arrow, 14)}</button></section>`;
    }
    const up = InsightService.topEnergizers(WINDOW_DAYS).map((a, i) => this.item(a, i + 1, false)).join('');
    const down = InsightService.topDrainers(WINDOW_DAYS).map((a, i) => this.item(a, i + 1, true)).join('');
    return `<section class="card" id="energy-insight">
      <div class="card__head"><div><h3>你的能量地圖</h3><p class="card__sub">最近 ${WINDOW_DAYS} 天，共 ${count} 筆紀錄</p></div>${historyLink}</div>
      <p class="eyebrow">讓你充電的事</p>${up || '<div class="empty">還沒有明顯讓你充電的事</div>'}
      ${down ? `<p class="eyebrow" style="margin-top:10px">讓你耗電的事</p>${down}` : ''}
    </section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return {
      actions: {
        'insight:history': (): void => {
          const date = GoodTimeService.latestDate() ?? DateService.todayKey();
          ctx.setUi({ tab: 'review', selectedDate: date, calendarMonth: date.slice(0, 7), scrollTarget: 'history-calendar' });
        },
        'insight:record': (): void => ctx.setUi({ tab: 'today', scrollTarget: 'good-time-log' }),
        'insight:experiment': (el) => {
          const entry = GoodTimeService.find(dataOf(el, 'id'));
          ctx.setUi({ showExperimentForm: true, experimentPreset: entry ? `更深入體驗：${entry.activity}` : '' });
        },
      },
      inputs: {},
    };
  }
}
