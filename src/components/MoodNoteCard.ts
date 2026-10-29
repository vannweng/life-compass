/**
 * @description 心情選擇與隨筆卡片
 * @module components/MoodNoteCard
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { MOOD_OPTIONS, type MoodValue } from '../models/DailyEntryModel';
import { DailyService } from '../services/DailyService';
import { DateService } from '../services/DateService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon } from './Dom';

/**
 * @description 判斷數值是否為心情值
 * @param n 數值
 * @returns 是否為 MoodValue
 */
function isMood(n: number): n is MoodValue {
  return n >= 1 && n <= 5 && Number.isInteger(n);
}

/**
 * @description 心情與每日問題隨筆卡片
 */
export class MoodNoteCard {
  /**
   * @description 渲染卡片
   * @param date YYYY-MM-DD
   * @returns HTML 字串
   */
  static render(date: string): string {
    const entry = DailyService.get(date);
    const question = DailyService.questionFor(date);
    const moods = MOOD_OPTIONS.map((m) => `
      <button class="mood-btn ${entry.mood === m.value ? 'is-active' : ''}" style="--c:${m.color}"
        data-action="mood:set" data-value="${m.value}" id="mood-${m.value}" aria-pressed="${entry.mood === m.value}">
        ${m.label}
      </button>`).join('');
    return `
      <section class="card mood-reflection-card" id="mood-note">
        <div class="card__head"><h3>今天的心情</h3></div>
        <div class="mood-row" role="group" aria-label="今天的心情">${moods}</div>
        <div class="mood-reflection-card__prompt">
          <div class="card__head">
            <p class="question-card__text">${escapeHtml(question.text)}</p>
            <button class="link-btn" data-action="question:shuffle">${icon(ICONS.refresh, 14)}換一題</button>
          </div>
          <textarea class="textarea" id="daily-answer" data-input="daily:answer" aria-label="${escapeHtml(question.text)}" placeholder="一句話就好，不用寫很多…">${escapeHtml(entry.answer)}</textarea>
        </div>
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
        'question:shuffle': () => {
          DailyService.shuffleQuestion(DateService.todayKey());
          ctx.refresh();
        },
      },
      inputs: {
        'daily:answer': (el) => {
          const date = DateService.todayKey();
          DailyService.update(date, { answer: el.value, questionId: DailyService.questionFor(date).id });
        },
      },
    };
  }
}
