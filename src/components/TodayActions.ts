/**
 * @description 今日行動清單：每日習慣每天可重新勾選
 * @module components/TodayActions
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ACTION_REPEAT_LABELS } from '../models/ActionModel';
import { ActionService } from '../services/ActionService';
import { DateService } from '../services/DateService';
import { GoalService } from '../services/GoalService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon, valueOf } from './Dom';

/**
 * @description 今日行動清單
 */
export class TodayActions {
  /**
   * @description 渲染清單
   * @param date YYYY-MM-DD
   * @returns HTML 字串
   */
  static render(date: string): string {
    const goals = GoalService.getAll();
    const rows = ActionService.forDate(date).map((a) => {
      const done = ActionService.isDone(a.id, date);
      const goal = goals.find((g) => g.id === a.goalId);
      return `<div class="row ${done ? 'is-done' : ''}">
        <button class="check ${done ? 'is-on' : ''}" data-action="act:toggle" data-id="${a.id}" aria-label="完成">${icon(ICONS.check, 14)}</button>
        <span class="action-repeat-tag">${ACTION_REPEAT_LABELS[a.repeat]}</span>
        <div class="row__main"><div class="row__title">${escapeHtml(a.title)}</div>
        ${goal ? `<div class="row__meta">${escapeHtml(goal.title)}</div>` : ''}</div>
        <button class="mini-btn mini-btn--plain" data-action="act:archive" data-id="${a.id}" aria-label="移除">${icon(ICONS.close, 14)}</button></div>`;
    }).join('');
    const total = ActionService.forDate(date).length;
    const done = ActionService.doneCount(date);
    return `
      <section class="card" id="today-actions">
        <div class="card__head"><div><h3>今天的小行動</h3><p class="card__sub">${total ? `${done} / ${total} 完成` : '小到不會失敗的事就好'}</p></div></div>
        ${rows || '<div class="empty"><b>還沒有行動</b>加一個今天就能完成的小事吧</div>'}
        <div class="field-row" style="margin-top:12px">
          <input class="field" id="act-title" placeholder="新增行動，例如：散步 15 分鐘" maxlength="40" />
          <select class="field" id="act-repeat" style="width:92px"><option value="daily">每天</option><option value="once">一次</option></select>
          <button class="btn btn--primary" data-action="act:add" aria-label="新增行動">${icon(ICONS.plus, 16)}</button>
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
        'act:toggle': (el) => { ActionService.toggle(dataOf(el, 'id'), DateService.todayKey()); ctx.refresh(); },
        'act:archive': (el) => { ActionService.archive(dataOf(el, 'id')); ctx.refresh(); },
        'act:add': () => {
          const title = valueOf('act-title');
          if (!title) return ctx.toast('請先輸入行動內容');
          ActionService.add(title, valueOf('act-repeat') === 'once' ? 'once' : 'daily');
          ctx.clearDraft('act-title');
          ctx.refresh();
        },
      },
      inputs: {},
    };
  }
}
