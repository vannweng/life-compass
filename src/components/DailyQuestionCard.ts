/**
 * @description 每日一問卡片：回答問題比面對空白隨筆容易
 * @module components/DailyQuestionCard
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { DailyService } from '../services/DailyService';
import { DateService } from '../services/DateService';
import { escapeHtml } from '../services/TextService';
import { ICONS, icon } from './Dom';

/**
 * @description 每日一問卡片
 */
export class DailyQuestionCard {
  /**
   * @description 渲染卡片
   * @param date YYYY-MM-DD
   * @returns HTML 字串
   */
  static render(date: string): string {
    const q = DailyService.questionFor(date);
    const entry = DailyService.get(date);
    return `
      <section class="card question-card" id="daily-question">
        <div class="card__head">
          <p class="question-card__text">${escapeHtml(q.text)}</p>
          <button class="link-btn" data-action="question:shuffle">${icon(ICONS.refresh, 14)}換一題</button>
        </div>
        <textarea class="textarea" id="daily-answer" data-input="daily:answer" placeholder="一句話就好，不用寫很多…">${escapeHtml(entry.answer)}</textarea>
      </section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    const today = (): string => DateService.todayKey();
    return {
      actions: {
        'question:shuffle': () => {
          DailyService.shuffleQuestion(today());
          ctx.refresh();
        },
      },
      inputs: {
        'daily:answer': (el) => {
          const q = DailyService.questionFor(today());
          DailyService.update(today(), { answer: el.value, questionId: q.id });
        },
      },
    };
  }
}
