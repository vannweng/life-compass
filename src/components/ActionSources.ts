/** 來源入口共用：保留目標與實驗關聯，直接帶到今天。 */
import type { AppContext, Handlers } from '../models/AppContextModel';
import { ACTION_DIRECTION_LABELS } from '../models/ActionFeedbackModel';
import { ActionService } from '../services/ActionService';
import { ActionFeedbackService } from '../services/ActionFeedbackService';
import { ExperimentService } from '../services/ExperimentService';
import { GoalService } from '../services/GoalService';
import { escapeHtml } from '../services/TextService';
import { dataOf } from './Dom';

export class ActionSources {
  /** 顯示同一來源累積的實際步驟與線索，不要求另外寫心得。 */
  static evidence(source: 'goal' | 'experiment', id: string): string {
    const actions = ActionService.getAll().filter((a) => source === 'goal' ? a.goalId === id : a.experimentId === id);
    const ids = new Set(actions.map((a) => a.id));
    const count = ActionService.getLogs().filter((log) => ids.has(log.actionId)).length;
    const latest = ActionFeedbackService.getAll().filter((f) => ids.has(f.actionId))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    if (!count && !latest) return '';
    const clue = latest ? [latest.direction ? ACTION_DIRECTION_LABELS[latest.direction] : '', latest.note].filter(Boolean).join(' · ') : '';
    return `<p class="source-evidence">已走 ${count} 小步${clue ? ` · ${escapeHtml(clue)}` : ''}</p>`;
  }

  static open(ctx: AppContext, source: 'goal' | 'experiment', id: string): void {
    const goal = source === 'goal' ? GoalService.getAll().find((g) => g.id === id) : null;
    const experiment = source === 'experiment' ? ExperimentService.getAll().find((e) => e.id === id) : null;
    if (!goal && !experiment) return;
    const pending = ActionService.pendingFor(source, id);
    if (pending) {
      ctx.setUi({ tab: 'today', scrollTarget: `action-${pending.id}` });
      ctx.toast('這件事已有待做的一步');
      return;
    }
    ctx.clearDraft('act-title', 'act-reason', 'act-goal', 'act-experiment', 'act-repeat');
    ctx.ui.drafts['act-title'] = goal ? `花 5 分鐘準備：${goal.title}` : experiment?.title ?? '';
    ctx.ui.drafts['act-goal'] = goal?.id ?? experiment?.goalId ?? experiment?.promotedGoalId ?? '';
    ctx.ui.drafts['act-experiment'] = experiment?.id ?? '';
    ctx.ui.drafts['act-repeat'] = 'once';
    ctx.setUi({ tab: 'today', actionEntryMode: 'plan', activeActionId: null, feedbackActionId: null, scrollTarget: 'action-composer' });
  }

  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'source:goal': (el) => this.open(ctx, 'goal', dataOf(el, 'id')),
      'source:experiment': (el) => this.open(ctx, 'experiment', dataOf(el, 'id')),
      'source:clear': () => { ctx.clearDraft('act-goal', 'act-experiment'); ctx.refresh(); },
      'source:review': () => ctx.setUi({ tab: 'review', scrollTarget: 'weekly-next-step' }),
      'source:explore': () => ctx.setUi({ tab: 'explore', exploreSection: 'explore', scrollTarget: 'experiment-list' }),
      'source:show-goal': () => ctx.setUi({ tab: 'goals', goalStatusFilter: 'all', goalCategoryFilter: 'all', scrollTarget: 'goal-library' }),
    }, inputs: {} };
  }
}
