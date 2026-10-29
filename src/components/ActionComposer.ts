/** 一個輸入框，同時支援想做與剛做完的事。 */
import type { AppContext, Handlers } from '../models/AppContextModel';
import { ActionService } from '../services/ActionService';
import { ActionFeedbackService } from '../services/ActionFeedbackService';
import { DateService } from '../services/DateService';
import { ExperimentService } from '../services/ExperimentService';
import { GoalService } from '../services/GoalService';
import { isEnergyLevel } from '../models/GoodTimeModel';
import { escapeHtml } from '../services/TextService';
import { ActionFeelings } from './ActionFeelings';
import { dataOf, valueOf } from './Dom';

export class ActionComposer {
  static render(ctx: AppContext): string {
    const record = ctx.ui.actionEntryMode === 'record';
    const goals = GoalService.getAll();
    const goal = goals.find((g) => g.id === ctx.ui.drafts['act-goal']);
    const experiment = ExperimentService.getAll().find((e) => e.id === ctx.ui.drafts['act-experiment']);
    return `<div class="action-composer" id="action-composer" tabindex="-1">
      <div class="action-entry-tabs" role="group" aria-label="新增行動方式">
        <button class="btn btn--ghost ${!record ? 'is-active' : ''}" data-action="act:mode" data-value="plan" aria-pressed="${!record}">想做的事</button>
        <button class="btn btn--ghost ${record ? 'is-active' : ''}" data-action="act:mode" data-value="record" aria-pressed="${record}">剛做完的事</button></div>
      ${goal || experiment ? `<div class="action-source">來自：${escapeHtml(experiment?.title ?? goal?.title ?? '')}<button class="link-btn" data-action="source:clear">取消連結</button></div>` : ''}
      <div class="action-entry-line"><input class="field" id="act-title" data-enter-action="act:add" aria-label="${record ? '剛做完什麼' : '今天想做的一小步'}"
        placeholder="${record ? '剛做完什麼？例如：和朋友散步' : '今天想做的一小步…'}" maxlength="100" />
        <button class="btn btn--primary" data-action="act:add">${record ? '記下' : '新增'}</button></div>
      ${record ? ActionFeelings.energy(ctx.ui.actionEntryEnergy, 'act:entry-energy') : ''}
      <div class="action-composer__options">
      ${!record ? `<select class="field action-repeat-select" id="act-repeat" aria-label="行動頻率"><option value="once">這次就好</option><option value="daily">每天</option></select>` : ''}
      <details class="action-extra" id="action-extra"><summary>更多選項（選填）</summary>
        <label class="field-label" for="act-goal">連到人生清單</label><select class="field" id="act-goal" data-input="act:goal"><option value="">獨立的小事</option>${goals.filter((g) => g.status !== 'done' || g.id === goal?.id).map((g) => `<option value="${g.id}">${escapeHtml(g.title)}</option>`).join('')}</select>
        <label class="field-label" for="act-reason">我在意的原因</label><input class="field" id="act-reason" placeholder="可以先不寫" maxlength="100" />
      </details></div></div>`;
  }

  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'act:mode': (el) => ctx.setUi({ actionEntryMode: dataOf(el, 'value') === 'record' ? 'record' : 'plan', feedbackActionId: null, activeActionId: null }),
      'act:entry-energy': (el) => { const value = Number(dataOf(el, 'value')); if (isEnergyLevel(value)) ctx.setUi({ actionEntryEnergy: value }); },
      'act:add': () => {
        const title = valueOf('act-title');
        if (!title) return ctx.toast('寫下一件小事就好');
        const record = ctx.ui.actionEntryMode === 'record';
        const experiment = ExperimentService.getAll().find((e) => e.id === ctx.ui.drafts['act-experiment']);
        const goal = GoalService.getAll().find((g) => g.id === valueOf('act-goal'));
        const action = ActionService.add(title, record || valueOf('act-repeat') !== 'daily' ? 'once' : 'daily', goal?.id ?? null,
          valueOf('act-reason') || goal?.title || experiment?.hypothesis || '', experiment?.id ?? null);
        if (experiment) ExperimentService.update(experiment.id, { status: 'doing' });
        if (record) {
          ActionService.toggle(action.id, DateService.todayKey());
          ActionFeedbackService.save(action.id, null, '', ctx.ui.actionEntryEnergy);
        }
        ctx.clearDraft('act-title', 'act-reason', 'act-goal', 'act-experiment');
        ctx.setUi({ actionEntryEnergy: null, feedbackActionId: null, activeActionId: null });
        ctx.toast(record ? '已記下，也會帶進回顧' : '已加入今天');
      },
    }, inputs: { 'act:goal': () => { ctx.clearDraft('act-experiment'); } } };
  }
}
