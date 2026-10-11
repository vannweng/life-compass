/**
 * @description 本月聚焦：最多 3 個，越少越容易做到
 * @module components/FocusThisMonth
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { MAX_FOCUS_PER_MONTH } from '../models/GoalModel';
import { DateService } from '../services/DateService';
import { GoalService } from '../services/GoalService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon } from './Dom';

/**
 * @description 本月聚焦區塊
 */
export class FocusThisMonth {
  /**
   * @description 渲染區塊
   * @returns HTML 字串
   */
  static render(): string {
    const focus = GoalService.focusFor();
    const slots = Array.from({ length: MAX_FOCUS_PER_MONTH }, (_, i) => {
      const g = focus[i];
      if (!g) return '<div class="focus-slot focus-slot--empty">從下方清單選一個目標放進來</div>';
      const done = g.status === 'done';
      return `<div class="focus-slot ${done ? 'is-done' : ''}">
        <button class="check ${done ? 'is-on' : ''}" data-action="goal:done" data-id="${g.id}" aria-label="完成">${icon(ICONS.check, 14)}</button>
        <div class="row__main"><div class="row__title" ${done ? 'style="text-decoration:line-through;color:var(--muted)"' : ''}>${escapeHtml(g.title)}</div></div>
        <button class="mini-btn mini-btn--plain" data-action="goal:focus" data-id="${g.id}" aria-label="移出聚焦">${icon(ICONS.close, 14)}</button></div>`;
    }).join('');
    return `
      <section class="card" id="focus-month">
        <div class="card__head"><div><h3>${Number(DateService.monthKey().slice(5))} 月聚焦</h3>
        <p class="card__sub">${focus.length} / ${MAX_FOCUS_PER_MONTH} · 少而精，才做得到</p></div></div>
        ${slots}
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
        'goal:focus': (el) => {
          const r = GoalService.toggleFocus(dataOf(el, 'id'));
          if (r === 'full') ctx.toast(`本月最多聚焦 ${MAX_FOCUS_PER_MONTH} 個，先完成或移出一個吧`);
          ctx.refresh();
        },
        'goal:done': (el) => {
          GoalService.toggleDone(dataOf(el, 'id'));
          ctx.refresh();
        },
      },
      inputs: {},
    };
  }
}
