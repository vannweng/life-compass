/**
 * @description 週 / 月回顧表單
 * @module components/ReviewForm
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { MONTHLY_QUESTIONS, WEEKLY_QUESTIONS, type ReviewType } from '../models/ReviewModel';
import { DateService } from '../services/DateService';
import { InsightService } from '../services/InsightService';
import { ReflectionService } from '../services/ReflectionService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon } from './Dom';

/**
 * @description 回顧表單
 */
export class ReviewForm {
  /**
   * @description 渲染單個回顧區塊
   * @param type 回顧類型
   * @returns HTML 字串
   */
  private static block(type: ReviewType): string {
    const isWeek = type === 'week';
    const key = isWeek ? DateService.weekKey() : DateService.monthKey();
    const qs = isWeek ? WEEKLY_QUESTIONS : MONTHLY_QUESTIONS;
    const index = ReflectionService.pickQuestion(type, key, qs.length);
    const review = ReflectionService.getReview(type, key, qs.length);
    const hint = isWeek
      ? `這週記錄了 ${DateService.lastNDays(7).filter((d) => InsightService.isRecorded(d)).length} / 7 天`
      : `這個月記錄了 ${InsightService.recordedDaysInMonth()} 天`;
    return `<section class="card" id="review-${type}">
      <div class="card__head"><div><h3>${isWeek ? '本週隨想' : '本月隨想'}</h3><p class="card__sub">${hint}</p></div></div>
      <div class="mood-reflection-card__prompt">
        <div class="card__head"><label class="question-card__text" for="rv-${type}-${index}">${escapeHtml(qs[index] ?? '')}</label>
          <button class="link-btn" data-action="review:shuffle" data-type="${type}" aria-label="${isWeek ? '本週隨想' : '本月隨想'}換一題">${icon(ICONS.refresh, 14)}換一題</button></div>
        <textarea class="textarea" id="rv-${type}-${index}" data-input="review:save" data-type="${type}" data-index="${index}" placeholder="一句話就好，不用寫很多…">${escapeHtml(review.answers[index] ?? '')}</textarea>
      </div></section>`;
  }

  /**
   * @description 渲染週與月回顧
   * @returns HTML 字串
   */
  static render(): string {
    return this.block('week') + this.block('month');
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return {
      actions: {
        'review:shuffle': (el) => {
          const type: ReviewType = dataOf(el, 'type') === 'month' ? 'month' : 'week';
          const key = type === 'week' ? DateService.weekKey() : DateService.monthKey();
          const size = type === 'week' ? WEEKLY_QUESTIONS.length : MONTHLY_QUESTIONS.length;
          ReflectionService.pickQuestion(type, key, size, true);
          ctx.refresh();
        },
      },
      inputs: {
        'review:save': (el) => {
          const type: ReviewType = dataOf(el, 'type') === 'month' ? 'month' : 'week';
          const key = type === 'week' ? DateService.weekKey() : DateService.monthKey();
          const size = type === 'week' ? WEEKLY_QUESTIONS.length : MONTHLY_QUESTIONS.length;
          ReflectionService.saveAnswer(type, key, Number(dataOf(el, 'index')), el.value, size);
        },
      },
    };
  }
}
