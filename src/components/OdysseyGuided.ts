/**
 * @description 三種人生的一題一題引導：從名稱、第 1/3/5 年到評分，一次只問一件事
 * @module components/OdysseyGuided
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ODYSSEY_YEAR_PROMPTS, type OdysseyPlan, type OdysseyTemplate } from '../models/OdysseyModel';
import { escapeHtml } from '../services/TextService';
import { renderOdysseyRating } from './OdysseyRating';

/** @description 引導最後一題的序號（0 名稱、1–3 年度、4 評分） */
const LAST_STEP = 4;

/**
 * @description 判斷計畫是否完全空白
 * @param plan 計畫
 * @returns 是否空白
 */
export function isEmptyPlan(plan: OdysseyPlan): boolean {
  return !(plan.title || plan.year1 || plan.year3 || plan.year5 || plan.like || plan.confidence);
}

/**
 * @description 一題一題引導
 */
export class OdysseyGuided {
  /**
   * @description 渲染空白計畫的開場
   * @param tpl 版本模板
   * @returns HTML 字串
   */
  static intro(tpl: OdysseyTemplate): string {
    return `<p style="font-weight:700;margin-bottom:8px">${tpl.guide}</p>
      <p class="card__sub">不用一次寫完。我們一次問一題，只要寫你現在想得到的就好。</p>
      <button class="btn btn--primary btn--block" style="margin-top:12px" data-action="odyssey:start">一題一題來</button>`;
  }

  /**
   * @description 渲染目前這一題
   * @param step 題序 0–4
   * @param plan 計畫
   * @param tpl 版本模板
   * @returns HTML 字串
   */
  static step(step: number, plan: OdysseyPlan, tpl: OdysseyTemplate): string {
    const year = (['year1', 'year3', 'year5'] as const)[step - 1];
    let body = '';
    if (step === 0) {
      body = `<label class="field-label" for="od-title">${tpl.guide}</label>
        <input class="field" id="od-title" data-input="odyssey:title" placeholder="${tpl.placeholder}" value="${escapeHtml(plan.title)}" />`;
    } else if (year) {
      body = `<label class="field-label" for="od-${year}">${ODYSSEY_YEAR_PROMPTS[year]}</label>
        <textarea class="textarea" id="od-${year}" style="min-height:96px" data-input="odyssey:${year}">${escapeHtml(plan[year])}</textarea>`;
    } else {
      body = `${renderOdysseyRating(plan, 'like', '這個人生我有多喜歡？')}${renderOdysseyRating(plan, 'confidence', '我有多大信心做到？')}`;
    }
    return `<p class="context-label">第 ${step + 1} 題 / ${LAST_STEP + 1}</p><div class="odyssey-step">${body}</div>
      <div class="odyssey-step__nav">
        ${step > 0 ? '<button class="btn btn--ghost" data-action="odyssey:prev">上一題</button>' : ''}
        <button class="btn btn--primary" data-action="odyssey:next">${step === LAST_STEP ? '完成' : '下一題'}</button></div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    const at = (): number => ctx.ui.odysseyStep ?? 0;
    return { actions: {
      'odyssey:start': () => ctx.setUi({ odysseyStep: 0, scrollTarget: 'odyssey-board' }),
      'odyssey:prev': () => ctx.setUi({ odysseyStep: Math.max(0, at() - 1) }),
      'odyssey:next': () => {
        if (at() >= LAST_STEP) { ctx.setUi({ odysseyStep: null }); return ctx.toast('已保存，之後都能回來修改'); }
        ctx.setUi({ odysseyStep: at() + 1 });
      },
    }, inputs: {} };
  }
}
