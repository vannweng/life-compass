/** 每週回顧與小實驗共用同一份行動證據。 */
import type { AppContext, Handlers } from '../models/AppContextModel';
import { ActionFeedbackService } from '../services/ActionFeedbackService';
import { ExperimentService } from '../services/ExperimentService';
import { NextStepService } from '../services/NextStepService';
import { escapeHtml } from '../services/TextService';
import { ActionSources } from './ActionSources';
import { valueOf } from './Dom';

export class WeeklyNextStep {
  static render(): string {
    const item = NextStepService.suggestion();
    const response = item ? ActionFeedbackService.responseFor(item.feedbackKey) : null;
    const running = ExperimentService.getAll().filter((e) => e.status === 'doing');
    return `<section class="card weekly-next-step" id="weekly-next-step" tabindex="-1">
      <div class="card__head"><div><h3>本週的一個下一步</h3><p class="card__sub">從做過的事，挑一小步再試試</p></div><button class="link-btn" data-action="source:explore">小實驗</button></div>
      ${item && !response ? `<p class="weekly-next-step__proposal">${escapeHtml(item.hypothesis)}</p>
        <p class="weekly-next-step__evidence">依據：${escapeHtml(item.evidence)}</p>
        <div class="weekly-step-preview">${escapeHtml(item.step)}</div>
        <details class="action-extra" id="weekly-edit"><summary>改成更適合我的一步</summary><input class="field" id="weekly-step" data-enter-action="weekly:accept" aria-label="本週想試的一步" value="${escapeHtml(item.step)}" maxlength="160" /></details>
        <div class="weekly-next-step__actions"><button class="btn btn--primary" data-action="weekly:accept">試這一步</button><button class="btn btn--ghost" data-action="weekly:reject">不符合，先保留</button></div>`
        : response ? `<p class="weekly-next-step__response">${response.response === 'confirm' ? '已帶到今天，做完的感受會自動回到小實驗。' : '已保留你的不同看法，先收集新的線索。'}</p>`
        : '<p class="card__sub">做完一小步，選個方向或留一句觀察，這裡就能提出有依據的建議。</p>'}
      ${running.length ? `<div class="weekly-running"><p class="context-label">正在試的事</p>${running.map((experiment) => `<div class="weekly-experiment" data-key="${experiment.id}"><div class="row__main"><b>${escapeHtml(experiment.title)}</b>${ActionSources.evidence('experiment', experiment.id) || '<p class="card__sub">還沒留下感受，做一小步就好。</p>'}</div><button class="btn btn--primary" data-action="source:experiment" data-id="${experiment.id}">今天試一步</button></div>`).join('')}</div>` : ''}
    </section>`;
  }

  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'weekly:accept': () => {
        const item = NextStepService.suggestion();
        if (!item) return;
        const id = NextStepService.accept(item, valueOf('weekly-step') || item.step);
        if (!id) return ctx.refresh();
        ctx.setUi({ tab: 'today', activeActionId: null, feedbackActionId: null, scrollTarget: `action-${id}` });
        ctx.toast('已建立小實驗，今天先做這一步');
      },
      'weekly:reject': () => {
        const item = NextStepService.suggestion();
        if (!item) return;
        ActionFeedbackService.respond(item.actionId, 'reject', item.feedbackKey);
        ctx.refresh();
      },
    }, inputs: {} };
  }
}
