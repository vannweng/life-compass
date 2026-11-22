/** 今天的行動：待辦、事後快記與回饋共用一張卡。 */
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import type { Action } from '../models/ActionModel';
import { ACTION_DIRECTION_LABELS } from '../models/ActionFeedbackModel';
import { EASE_OPTIONS, ENERGY_OPTIONS } from '../models/GoodTimeModel';
import { ActionService } from '../services/ActionService';
import { ActionFeedbackService } from '../services/ActionFeedbackService';
import { DateService } from '../services/DateService';
import { GoalService } from '../services/GoalService';
import { GoodTimeService } from '../services/GoodTimeService';
import { ExperimentService } from '../services/ExperimentService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon } from './Dom';
import { ActionComposer } from './ActionComposer';
import { ActionFollowThrough } from './ActionFollowThrough';

export class TodayActions {
  private static row(action: Action, date: string, ctx: AppContext): string {
    const done = ActionService.isDone(action.id, date);
    const feedback = ActionFeedbackService.getAll().find((f) => f.actionId === action.id && f.date === date);
    const goal = GoalService.getAll().find((g) => g.id === action.goalId);
    const experiment = ExperimentService.getAll().find((e) => e.id === action.experimentId);
    const energy = ENERGY_OPTIONS.find((e) => e.value === feedback?.energy);
    const clue = [energy?.label, EASE_OPTIONS.find((e) => e.value === feedback?.ease)?.label, feedback?.isFlow ? '心流' : '', feedback?.direction ? ACTION_DIRECTION_LABELS[feedback.direction] : '', feedback?.note].filter(Boolean).join(' · ');
    const source = experiment ?? goal;
    return `<div class="action-item" id="action-${action.id}" data-key="${action.id}" tabindex="-1">
      <div class="row action-row ${done ? 'is-done' : ''}">
        <button class="check ${done ? 'is-on' : ''}" data-action="act:toggle" data-id="${action.id}" aria-label="${done ? '取消完成' : '完成'}：${escapeHtml(action.title)}" aria-pressed="${done}">${icon(ICONS.check, 14)}</button>
        <div class="row__main"><div class="row__title">${escapeHtml(ActionService.stepFor(action.id, date))}</div>
          <div class="action-row__meta">${action.repeat === 'daily' ? '<span class="action-repeat-tag">每天</span>' : ''}
          ${source ? `<button class="link-btn action-source-link" data-action="${experiment ? 'source:explore' : 'source:show-goal'}">${experiment ? '實驗' : '清單'} · ${escapeHtml(source.title)}</button>` : action.reason ? `<span class="row__meta">${escapeHtml(action.reason)}</span>` : ''}</div>
          ${clue ? `<div class="action-clue">${escapeHtml(clue)}</div>` : ''}</div>
        <button class="link-btn action-stuck-btn" data-action="${done ? 'action:open-feedback' : 'action:stuck'}" data-id="${action.id}">${done ? '留下感受' : '卡住？'}</button>
        <button class="link-btn action-archive-btn" data-action="act:archive" data-id="${action.id}">收起</button>
      </div>${ActionFollowThrough.renderFor(ctx, action.id)}</div>`;
  }

  static render(date: string, ctx: AppContext): string {
    const actions = ActionService.forDate(date);
    const pending = actions.filter((a) => !ActionService.isDone(a.id, date));
    const completed = actions.filter((a) => ActionService.isDone(a.id, date));
    const legacy = GoodTimeService.byDate(date).filter((entry) => !entry.actionId);
    const archived = ctx.ui.lastArchivedActionId ? ActionService.find(ctx.ui.lastArchivedActionId) : null;
    return `<section class="card" id="today-actions" tabindex="-1">
      <div class="card__head"><div><h3>今天的行動</h3>${completed.length || pending.length ? `<p class="card__sub">${[completed.length ? `已完成 ${completed.length} 件` : '', pending.length ? `待做 ${pending.length} 件` : ''].filter(Boolean).join(' · ')}</p>` : ''}</div></div>
      ${ActionComposer.render(ctx)}
      ${archived?.archived ? `<div class="action-archive-notice"><span>已收起「${escapeHtml(archived.title)}」</span><button class="link-btn" data-action="act:restore" data-id="${archived.id}">復原</button></div>` : ''}
      <div class="action-pending">${pending.map((a) => this.row(a, date, ctx)).join('')}</div>
      ${completed.length || legacy.length ? `<div class="action-completed"><p class="context-label">今天已做</p>
        ${completed.map((a) => this.row(a, date, ctx)).join('')}
        ${legacy.map((entry) => `<div class="row legacy-record" data-key="${entry.id}"><span class="row__meta num">${entry.time}</span><div class="row__main">${escapeHtml(entry.activity)}<div class="action-clue">${ENERGY_OPTIONS.find((e) => e.value === entry.energy)?.label ?? ''}${entry.isFlow ? ' · 心流' : ''}</div></div><button class="link-btn" data-action="act:again" data-id="${entry.id}">再做一次</button></div>`).join('')}</div>` : ''}
    </section>`;
  }

  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(ActionComposer.handlers(ctx), ActionFollowThrough.handlers(ctx), { actions: {
      'act:toggle': (el) => {
        const id = dataOf(el, 'id');
        const wasDone = ActionService.isDone(id, DateService.todayKey());
        ActionService.toggle(id, DateService.todayKey());
        if (!wasDone) {
          ctx.setUi({ feedbackActionId: null, activeActionId: null });
          return ctx.toast('完成了');
        }
        ctx.setUi({ feedbackActionId: null });
      },
      'act:archive': (el) => {
        const id = dataOf(el, 'id');
        ActionService.archive(id);
        ctx.setUi({ lastArchivedActionId: id, feedbackActionId: null, activeActionId: null });
      },
      'act:restore': (el) => {
        ActionService.restore(dataOf(el, 'id'));
        ctx.setUi({ lastArchivedActionId: null });
        ctx.toast('已恢復行動');
      },
      'act:again': (el) => {
        const entry = GoodTimeService.find(dataOf(el, 'id'));
        if (!entry) return;
        ctx.clearDraft('act-title', 'act-goal', 'act-experiment', 'act-reason', 'act-repeat');
        ctx.ui.drafts['act-title'] = entry.activity;
        ctx.setUi({ actionEntryMode: 'plan', scrollTarget: 'action-composer' });
      },
    }, inputs: {} });
  }
}
