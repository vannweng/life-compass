/** 行動旁直接展開協助；完成後可選擇是否留下感受。 */
import type { AppContext, Handlers } from '../models/AppContextModel';
import { ACTION_BLOCKER_GUIDANCE, type ActionBlocker, type ActionDirection } from '../models/ActionFeedbackModel';
import { isEaseLevel, isEnergyLevel } from '../models/GoodTimeModel';
import { ActionFeedbackService } from '../services/ActionFeedbackService';
import { ActionService } from '../services/ActionService';
import { DateService } from '../services/DateService';
import { ExperimentService } from '../services/ExperimentService';
import { escapeHtml } from '../services/TextService';
import { ActionFeelings } from './ActionFeelings';
import { dataOf, valueOf } from './Dom';

export class ActionFollowThrough {
  static open(ctx: AppContext, id: string): void {
    const feedback = ActionFeedbackService.getAll().find((f) => f.actionId === id && f.date === DateService.todayKey());
    ctx.clearDraft('action-feedback-note');
    ctx.ui.drafts['action-feedback-note'] = feedback?.note ?? '';
    ctx.setUi({ feedbackActionId: id, actionFeedbackDirection: feedback?.direction ?? null,
      actionFeedbackEnergy: feedback?.energy ?? null, actionFeedbackFlow: feedback?.isFlow ?? false, actionFeedbackEase: feedback?.ease ?? null,
      activeActionId: null });
  }

  private static save(ctx: AppContext): boolean {
    if (!ctx.ui.feedbackActionId) return false;
    return ActionFeedbackService.save(ctx.ui.feedbackActionId, ctx.ui.actionFeedbackDirection,
      ctx.ui.drafts['action-feedback-note'] ?? '', ctx.ui.actionFeedbackEnergy, ctx.ui.actionFeedbackFlow, ctx.ui.actionFeedbackEase);
  }

  private static restoreAfterFailedSave(ctx: AppContext, id: string): void {
    this.open(ctx, id);
    ctx.toast('無法儲存感受，請確認瀏覽器允許本機儲存');
  }

  static renderFor(ctx: AppContext, id: string): string {
    const saved = ActionFeedbackService.getAll().find((f) => f.actionId === id && f.date === DateService.todayKey());
    if (ctx.ui.feedbackActionId === id) return `<div class="action-guidance action-guidance--feedback" id="action-feedback">
      <div class="card__head"><p class="card__sub">${saved ? '感受已儲存' : '想留下感受嗎？'}</p><button class="link-btn" data-action="action:close-feedback">先這樣</button></div>
      <details class="action-extra" id="feedback-extra">
        <summary>記下感受（選填）</summary>
        ${ActionFeelings.energy(ctx.ui.actionFeedbackEnergy, 'action:feedback-energy')}
        ${ctx.ui.actionFeedbackEnergy !== null ? ActionFeelings.ease(ctx.ui.actionFeedbackEase, 'action:feedback-ease') : ''}
        ${ActionFeelings.direction(ctx.ui.actionFeedbackDirection)}
        <label class="flow-toggle"><input type="checkbox" data-action="action:feedback-flow" ${ctx.ui.actionFeedbackFlow ? 'checked' : ''} />做到忘記時間</label>
        <textarea class="textarea" id="action-feedback-note" data-input="action:feedback-note" aria-label="這一步的觀察" placeholder="發現什麼，或下次想怎麼試…" maxlength="500">${escapeHtml(ctx.ui.drafts['action-feedback-note'] ?? '')}</textarea>
      </details>
      <div class="action-follow-ups">${saved ? `<button class="link-btn" data-action="action:clear-feedback" data-id="${id}">清除感受</button>` : ''}<button class="link-btn" data-action="action:repeat" data-id="${id}">再做一次</button><button class="link-btn" data-action="action:experiment" data-id="${id}">延伸成小實驗</button></div>
    </div>`;
    if (ctx.ui.activeActionId !== id) return '';
    const guide = ctx.ui.actionBlocker ? ACTION_BLOCKER_GUIDANCE[ctx.ui.actionBlocker] : null;
    return `<div class="action-guidance" id="action-guidance">
      <div class="card__head"><h3>哪裡卡住了？</h3><button class="link-btn" data-action="action:close-help">收起</button></div>
      <div class="action-blockers">${Object.entries(ACTION_BLOCKER_GUIDANCE).map(([value, item]) => `<button class="btn btn--ghost ${ctx.ui.actionBlocker === value ? 'is-active' : ''}" data-action="action:blocker" data-value="${value}" aria-pressed="${ctx.ui.actionBlocker === value}">${item.label}</button>`).join('')}</div>
      ${guide ? `<p class="action-guidance__question">${guide.question}</p><button class="action-example" data-action="action:use-example">就先做：${guide.example}</button>
        <div class="action-entry-line"><input class="field" id="action-micro-step" data-enter-action="action:set-step" aria-label="自己決定一小步" placeholder="或自己改成更小的一步…" maxlength="100" /><button class="btn btn--ghost" data-action="action:set-step">採用</button></div>` : ''}
    </div>`;
  }

  private static setStep(ctx: AppContext, step: string): void {
    if (!ctx.ui.activeActionId || !step) return ctx.toast('寫下一小步，或直接點上面的例子');
    ActionService.update(ctx.ui.activeActionId, { microStep: step, microStepDate: DateService.todayKey() });
    ctx.clearDraft('action-micro-step');
    ctx.setUi({ activeActionId: null, actionBlocker: null });
    ctx.toast('今天先做這一步就好');
  }

  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'action:stuck': (el) => {
        ctx.clearDraft('action-micro-step');
        ctx.setUi({ activeActionId: dataOf(el, 'id'), actionBlocker: null, feedbackActionId: null });
      },
      'action:open-feedback': (el) => this.open(ctx, dataOf(el, 'id')),
      'action:close-help': () => ctx.setUi({ activeActionId: null, actionBlocker: null }),
      'action:blocker': (el) => {
        const value = dataOf(el, 'value');
        if (!(value in ACTION_BLOCKER_GUIDANCE)) return;
        ctx.setUi({ actionBlocker: value as ActionBlocker });
      },
      'action:use-example': () => { if (ctx.ui.actionBlocker) this.setStep(ctx, ACTION_BLOCKER_GUIDANCE[ctx.ui.actionBlocker].example); },
      'action:set-step': () => this.setStep(ctx, valueOf('action-micro-step')),
      'action:feedback-direction': (el) => {
        const value = dataOf(el, 'value');
        if (value !== 'continue' && value !== 'change' && value !== 'pause') return;
        const id = ctx.ui.feedbackActionId;
        if (!id) return;
        ctx.ui.actionFeedbackDirection = ctx.ui.actionFeedbackDirection === value ? null : value as ActionDirection;
        if (!this.save(ctx)) return this.restoreAfterFailedSave(ctx, id);
        ctx.refresh();
      },
      'action:feedback-energy': (el) => {
        const value = Number(dataOf(el, 'value'));
        if (!isEnergyLevel(value)) return;
        const id = ctx.ui.feedbackActionId;
        if (!id) return;
        ctx.ui.actionFeedbackEnergy = ctx.ui.actionFeedbackEnergy === value ? null : value;
        if (!this.save(ctx)) return this.restoreAfterFailedSave(ctx, id);
        ctx.refresh();
      },
      'action:feedback-ease': (el) => {
        const value = Number(dataOf(el, 'value'));
        const id = ctx.ui.feedbackActionId;
        if (!isEaseLevel(value) || !id) return;
        ctx.ui.actionFeedbackEase = ctx.ui.actionFeedbackEase === value ? null : value;
        if (!this.save(ctx)) return this.restoreAfterFailedSave(ctx, id);
        ctx.refresh();
      },
      'action:feedback-flow': (el) => {
        if (!(el instanceof HTMLInputElement)) return;
        const id = ctx.ui.feedbackActionId;
        if (!id) return;
        ctx.ui.actionFeedbackFlow = el.checked;
        if (!this.save(ctx)) return this.restoreAfterFailedSave(ctx, id);
        ctx.refresh();
      },
      'action:close-feedback': () => ctx.setUi({ feedbackActionId: null }),
      'action:clear-feedback': (el) => {
        if (!ActionFeedbackService.clear(dataOf(el, 'id'))) return ctx.toast('無法清除感受，請確認瀏覽器允許本機儲存');
        ctx.clearDraft('action-feedback-note');
        ctx.setUi({ feedbackActionId: null, actionFeedbackDirection: null, actionFeedbackEnergy: null, actionFeedbackFlow: false, actionFeedbackEase: null });
        ctx.toast('已清除感受');
      },
      'action:repeat': (el) => {
        const action = ActionService.find(dataOf(el, 'id'));
        if (!action) return;
        const step = ActionService.stepFor(action.id);
        const existing = ActionService.forDate(DateService.todayKey()).find((a) => a.title === step && a.goalId === action.goalId && a.experimentId === action.experimentId && !ActionService.isDone(a.id, DateService.todayKey()));
        const next = existing ?? ActionService.add(step, 'once', action.goalId, action.reason, action.experimentId);
        ctx.setUi({ feedbackActionId: null, scrollTarget: `action-${next.id}` });
        ctx.toast('已加入下一次的小步');
      },
      'action:experiment': (el) => {
        const action = ActionService.find(dataOf(el, 'id'));
        if (!action) return;
        if (!action.experimentId) {
          const exp = ExperimentService.add(action.title, '再試一次，觀察什麼值得繼續。', 'experience', null, action.goalId);
          ActionService.linkExperiment(action.id, exp.id);
        }
        ctx.setUi({ tab: 'explore', exploreSection: 'explore', scrollTarget: 'experiment-list' });
      },
    }, inputs: { 'action:feedback-note': (el) => {
      ctx.ui.drafts['action-feedback-note'] = el.value;
      if (!this.save(ctx)) ctx.toast('無法儲存感受，內容仍保留在目前畫面');
    } } };
  }
}
