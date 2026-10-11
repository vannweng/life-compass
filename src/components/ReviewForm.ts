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
import { dataOf } from './Dom';

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
    const review = ReflectionService.getReview(type, key, qs.length);
    const fields = qs.map((q, i) => `
      <label class="field-label" for="rv-${type}-${i}">${q}</label>
      <textarea class="textarea" id="rv-${type}-${i}" style="min-height:64px" data-input="review:save" data-type="${type}" data-index="${i}">${escapeHtml(review.answers[i] ?? '')}</textarea>`).join('');
    const hint = isWeek
      ? `這週記錄了 ${DateService.lastNDays(7).filter((d) => InsightService.isRecorded(d)).length} / 7 天`
      : `這個月記錄了 ${InsightService.recordedDaysInMonth()} 天`;
    return `<section class="card" id="review-${type}">
      <div class="card__head"><div><h3>${isWeek ? '本週回顧' : '本月回顧'}</h3><p class="card__sub">${hint}</p></div></div>${fields}</section>`;
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
   * @param _ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(_ctx: AppContext): Handlers {
    return {
      actions: {},
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
