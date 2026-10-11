/**
 * @description 心情選擇與隨筆卡片
 * @module components/MoodNoteCard
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { MOOD_OPTIONS, type MoodValue } from '../models/DailyEntryModel';
import { DailyService } from '../services/DailyService';
import { DateService } from '../services/DateService';
import { escapeHtml } from '../services/TextService';
import { dataOf } from './Dom';

/**
 * @description 判斷數值是否為心情值
 * @param n 數值
 * @returns 是否為 MoodValue
 */
function isMood(n: number): n is MoodValue {
  return n >= 1 && n <= 5 && Number.isInteger(n);
}

/**
 * @description 心情與隨筆卡片
 */
export class MoodNoteCard {
  /**
   * @description 渲染卡片
   * @param date YYYY-MM-DD
   * @returns HTML 字串
   */
  static render(date: string): string {
    const entry = DailyService.get(date);
    const moods = MOOD_OPTIONS.map((m) => `
      <button class="mood-btn ${entry.mood === m.value ? 'is-active' : ''}" style="--c:${m.color}"
        data-action="mood:set" data-value="${m.value}" id="mood-${m.value}" aria-pressed="${entry.mood === m.value}">
        ${m.label}
      </button>`).join('');
    return `
      <section class="card" id="mood-note">
        <div class="card__head"><h3>今天的心情</h3></div>
        <div class="mood-row" role="group" aria-label="今天的心情">${moods}</div>
        <label class="field-label" for="daily-note">隨筆（可選）</label>
        <textarea class="textarea" id="daily-note" data-input="daily:note" placeholder="寫下今天的想法…">${escapeHtml(entry.note)}</textarea>
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
        'mood:set': (el) => {
          const value = Number(dataOf(el, 'value'));
          if (!isMood(value)) return;
          const current = DailyService.get(DateService.todayKey()).mood;
          DailyService.update(DateService.todayKey(), { mood: current === value ? null : value });
          ctx.refresh();
        },
      },
      inputs: { 'daily:note': (el) => { DailyService.update(DateService.todayKey(), { note: el.value }); } },
    };
  }
}
