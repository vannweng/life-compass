/** 日期回顧直接讀取行動與感受；有能量也只顯示一次。 */
import { ACTION_DIRECTION_LABELS } from '../models/ActionFeedbackModel';
import { ENERGY_OPTIONS } from '../models/GoodTimeModel';
import { ActionFeedbackService } from '../services/ActionFeedbackService';
import { ActionService } from '../services/ActionService';
import { GoalService } from '../services/GoalService';
import { escapeHtml } from '../services/TextService';

export class ActionHistory {
  static render(date: string): string {
    const feedbacks = ActionFeedbackService.getAll();
    const goals = GoalService.getAll();
    return ActionService.getLogs().filter((log) => log.date === date).map((log) => {
      const action = ActionService.find(log.actionId);
      if (!action) return '';
      const feedback = feedbacks.find((f) => f.actionId === action.id && f.date === date);
      const goal = goals.find((g) => g.id === action.goalId);
      const energy = ENERGY_OPTIONS.find((e) => e.value === feedback?.energy);
      const clue = [energy?.label, feedback?.direction ? ACTION_DIRECTION_LABELS[feedback.direction] : '', feedback?.isFlow ? '心流' : '', feedback?.note].filter(Boolean).join(' · ');
      return `<div class="history-action"><div>✓ ${escapeHtml(log.step || feedback?.step || ActionService.stepFor(action.id, date))}</div>${goal ? `<p class="card__sub">清單 · ${escapeHtml(goal.title)}</p>` : ''}${clue ? `<p class="action-clue">${escapeHtml(clue)}</p>` : ''}</div>`;
    }).join('');
  }
}
