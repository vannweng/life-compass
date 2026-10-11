/**
 * @description 好時光快記：記錄「這件事讓我有/沒有能量」，是探索自己的核心資料來源
 * @module components/GoodTimeQuickLog
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ENERGY_OPTIONS, isEnergyLevel } from '../models/GoodTimeModel';
import { DateService } from '../services/DateService';
import { GoodTimeService } from '../services/GoodTimeService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon, valueOf } from './Dom';

/**
 * @description 好時光快記卡片
 */
export class GoodTimeQuickLog {
  /**
   * @description 渲染卡片
   * @param ctx 應用上下文（讀取暫存的能量 / 心流）
   * @returns HTML 字串
   */
  static render(ctx: AppContext): string {
    const energy = ENERGY_OPTIONS.map((o) => `
      <button class="energy-btn ${ctx.ui.draftEnergy === o.value ? 'is-active' : ''}" style="--c:${o.color}"
        data-action="gt:energy" data-value="${o.value}" aria-pressed="${ctx.ui.draftEnergy === o.value}">${o.label}</button>`).join('');
    const items = GoodTimeService.byDate(DateService.todayKey()).map((e) => {
      const color = ENERGY_OPTIONS.find((o) => o.value === e.energy)?.color ?? '#94a3b8';
      return `<div class="gt-item"><span class="gt-item__time num">${e.time}</span>
        <span class="dot" style="background:${color}"></span>
        <span style="flex:1;overflow-wrap:anywhere">${escapeHtml(e.activity)}</span>
        ${e.isFlow ? '<span class="gt-item__flow">心流</span>' : ''}
        <button class="mini-btn mini-btn--plain" data-action="gt:remove" data-id="${e.id}" aria-label="刪除">${icon(ICONS.close, 14)}</button></div>`;
    }).join('');
    return `
      <section class="card" id="good-time-log" tabindex="-1" aria-label="能量快記">
        <div class="card__head"><div><h3>剛剛在做什麼？</h3><p class="card__sub">記下讓你有（或沒有）能量的時刻</p></div></div>
        <div class="energy-row" role="group" aria-label="選擇能量">${energy}</div>
        <div class="gt-activity-label-row">
          <label class="field-label" for="gt-activity">再寫下剛剛做的事</label>
          <label class="flow-toggle"><input type="checkbox" id="gt-flow" data-action="gt:flow" ${ctx.ui.draftFlow ? 'checked' : ''}/>做到忘記時間</label>
        </div>
        <div class="gt-activity-field">
          <input class="field" id="gt-activity" data-input="gt:activity" value="${escapeHtml(ctx.ui.drafts['gt-activity'] ?? '')}"
            placeholder="例如：和朋友聊設計、開了一整天的會…" maxlength="60" />
          <button class="mini-btn mini-btn--plain gt-activity-clear" data-action="gt:clear" aria-label="清除活動文字">${icon(ICONS.close, 16)}</button>
        </div>
        <button class="btn btn--primary btn--block" id="gt-submit" data-action="gt:add">${icon(ICONS.plus, 16)}記錄這一刻</button>
        ${items ? `<div class="gt-list">${items}</div>` : ''}
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
        'gt:energy': (el) => {
          const v = Number(dataOf(el, 'value'));
          if (isEnergyLevel(v)) ctx.setUi({ draftEnergy: v });
        },
        'gt:flow': (el) => { if (el instanceof HTMLInputElement) ctx.ui.draftFlow = el.checked; },
        'gt:clear': (): void => {
          ctx.clearDraft('gt-activity');
          ctx.refresh();
          document.getElementById('gt-activity')?.focus({ preventScroll: true });
        },
        'gt:add': () => {
          const text = valueOf('gt-activity');
          if (!text) return ctx.toast('先寫下你在做什麼吧');
          const e = ctx.ui.draftEnergy;
          GoodTimeService.add(text, isEnergyLevel(e) ? e : 0, ctx.ui.draftFlow);
          ctx.clearDraft('gt-activity');
          ctx.ui.draftEnergy = 0;
          ctx.ui.draftFlow = false;
          ctx.toast('已記錄，謝謝你關注自己');
          ctx.refresh();
        },
        'gt:remove': (el) => { GoodTimeService.remove(dataOf(el, 'id')); ctx.refresh(); },
      },
      inputs: { 'gt:activity': (el): void => { ctx.ui.drafts['gt-activity'] = el.value; } },
    };
  }
}
