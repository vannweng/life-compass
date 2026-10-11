/**
 * @description 探索實驗清單：小成本嘗試 → 寫下感受 → 想繼續就晉升為人生目標
 * @module components/ExperimentList
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import {
  EXPERIMENT_STATUS_LABELS, EXPERIMENT_TYPE_LABELS, EXPERIMENT_VERDICT_LABELS,
  type Experiment, type ExperimentStatus, type ExperimentVerdict,
} from '../models/ExperimentModel';
import { ExperimentService } from '../services/ExperimentService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon, valueOf } from './Dom';

/**
 * @description 判斷是否為合法結論
 * @param v 字串
 * @returns 是否為 ExperimentVerdict
 */
function isVerdict(v: string): v is ExperimentVerdict {
  return v === 'pending' || v === 'love' || v === 'meh' || v === 'no';
}

/**
 * @description 實驗清單
 */
export class ExperimentList {
  /**
   * @description 渲染單張實驗卡
   * @param e 實驗
   * @returns HTML 字串
   */
  private static card(e: Experiment): string {
    const next: ExperimentStatus = e.status === 'planned' ? 'doing' : 'done';
    const nextLabel = e.status === 'planned' ? '開始' : '標記完成';
    const verdicts = (['love', 'meh', 'no'] as const).map((v) => `<button class="chip ${e.verdict === v ? 'is-active' : ''}" data-action="exp:verdict" data-id="${e.id}" data-value="${v}">${EXPERIMENT_VERDICT_LABELS[v]}</button>`).join('');
    return `<div class="exp-card">
      <div class="card__head" style="margin-bottom:4px"><div class="row__title">${escapeHtml(e.title)}</div>
        <span class="tag ${e.promotedGoalId ? 'tag--love' : ''}">${e.promotedGoalId ? '已成為目標' : EXPERIMENT_STATUS_LABELS[e.status]}</span></div>
      <div class="row__meta">${EXPERIMENT_TYPE_LABELS[e.type]}${e.hypothesis ? ` · 想驗證：${escapeHtml(e.hypothesis)}` : ''}</div>
      ${e.status !== 'planned' ? `<textarea class="textarea" style="margin-top:8px;min-height:60px" data-input="exp:learn" data-id="${e.id}" placeholder="做完之後的感受、發現…">${escapeHtml(e.learnings)}</textarea>` : ''}
      <div class="exp-card__controls">
        ${e.status !== 'planned' ? `<div class="exp-card__verdicts">${verdicts}</div>` : ''}
        <div class="exp-card__actions">
        ${e.status !== 'done' ? `<button class="btn btn--ghost btn--sm" data-action="exp:status" data-id="${e.id}" data-value="${next}">${nextLabel}</button>` : ''}
        ${e.verdict === 'love' && !e.promotedGoalId ? `<button class="btn btn--primary exp-card__promote" data-action="exp:promote" data-id="${e.id}">加入人生清單</button>` : ''}
        <button class="btn btn--ghost bare-delete-btn" data-action="exp:remove" data-id="${e.id}" aria-label="刪除">${icon(ICONS.trash, 16)}</button>
      </div></div></div>`;
  }

  /**
   * @description 渲染新增表單
   * @param preset 預填標題
   * @returns HTML 字串
   */
  private static form(preset: string): string {
    return `<div class="experiment-form">
      <input class="field" id="exp-title" data-enter-action="exp:add" placeholder="想試什麼？例如：去咖啡店當一天志工" value="${escapeHtml(preset)}" maxlength="60" />
      <input class="field" id="exp-hyp" data-enter-action="exp:add" style="margin-top:8px" placeholder="想驗證什麼？例如：我真的喜歡和人互動嗎" maxlength="80" />
      <div class="field-row" style="margin-top:8px"><select class="field" id="exp-type"><option value="experience">親身體驗</option><option value="interview">找人聊聊</option></select>
      <button class="btn btn--primary" data-action="exp:add">建立</button><button class="btn btn--ghost" data-action="exp:cancel">取消</button></div></div>`;
  }

  /**
   * @description 渲染實驗清單
   * @param ctx 應用上下文
   * @returns HTML 字串
   */
  static render(ctx: AppContext): string {
    const list = ExperimentService.getAll().map((e) => this.card(e)).join('');
    return `<section class="card" id="experiment-list">
      <div class="card__head"><div><h3>小實驗</h3><p class="card__sub">用最小成本，確認你是不是真的喜歡</p></div>
        <button class="link-btn" data-action="exp:new">${icon(ICONS.plus, 14)}新增</button></div>
      ${ctx.ui.showExperimentForm ? this.form(ctx.ui.experimentPreset) : ''}
      ${list || '<div class="empty"><b>還沒有實驗</b>從能量地圖挑一件讓你充電的事，試著再體驗一次</div>'}</section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return {
      actions: {
        'exp:new': () => ctx.setUi({ showExperimentForm: true, experimentPreset: '' }),
        'exp:cancel': (): void => {
          ctx.clearDraft('exp-title', 'exp-hyp', 'exp-type');
          ctx.setUi({ showExperimentForm: false, experimentPreset: '' });
        },
        'exp:add': () => {
          const title = valueOf('exp-title');
          if (!title) return ctx.toast('請輸入實驗名稱');
          ExperimentService.add(title, valueOf('exp-hyp'), valueOf('exp-type') === 'interview' ? 'interview' : 'experience');
          ctx.clearDraft('exp-title', 'exp-hyp', 'exp-type');
          ctx.setUi({ showExperimentForm: false, experimentPreset: '' });
        },
        'exp:status': (el) => {
          const v = dataOf(el, 'value');
          ExperimentService.update(dataOf(el, 'id'), { status: v === 'doing' ? 'doing' : 'done' });
          ctx.refresh();
        },
        'exp:verdict': (el) => {
          const v = dataOf(el, 'value');
          if (isVerdict(v)) ExperimentService.update(dataOf(el, 'id'), { verdict: v });
          ctx.refresh();
        },
        'exp:promote': (el) => {
          if (ExperimentService.promote(dataOf(el, 'id'))) ctx.toast('已加入人生清單！');
          ctx.refresh();
        },
        'exp:remove': (el) => { ExperimentService.remove(dataOf(el, 'id')); ctx.refresh(); },
      },
      inputs: { 'exp:learn': (el) => ExperimentService.update(dataOf(el, 'id'), { learnings: el.value }) },
    };
  }
}
