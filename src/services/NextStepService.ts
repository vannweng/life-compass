/** 從具體回饋提出可試的小實驗，接受後建立今天的一步。 */
import { ACTION_DIRECTION_LABELS } from '../models/ActionFeedbackModel';
import { ActionFeedbackService } from './ActionFeedbackService';
import { ActionService } from './ActionService';
import { ExperimentService } from './ExperimentService';

export interface NextStep {
  actionId: string;
  feedbackKey: string;
  step: string;
  hypothesis: string;
  evidence: string;
  goalId: string | null;
}

export class NextStepService {
  static suggestion(): NextStep | null {
    const recent = ActionFeedbackService.recent(7);
    const latest = recent.find((f) => (f.direction || f.note.trim()) && !ActionService.find(f.actionId)?.archived);
    if (!latest) return null;
    const action = ActionService.find(latest.actionId);
    if (!action) return null;
    const count = recent.filter((f) => f.actionId === action.id).length;
    const plans = {
      continue: { step: latest.step || action.title, hypothesis: '再試一次，是否仍然值得繼續投入？' },
      change: { step: `只做 2 分鐘：${action.title}`, hypothesis: '先縮短時間，是否更容易開始、也更願意繼續？' },
      pause: { step: `花 1 分鐘想想：${action.title}原本想幫我達成什麼？`, hypothesis: '先釐清目的，再判斷要換方法還是放下。' },
      observe: { step: `再試 2 分鐘：${action.title}`, hypothesis: '再留下一個具體觀察，看看什麼值得保留。' },
    };
    const plan = plans[latest.direction ?? 'observe'];
    return { actionId: action.id, feedbackKey: `${latest.id}:${latest.direction}:${latest.note}`,
      ...plan, goalId: action.goalId,
      evidence: `近七天 ${count} 則線索${latest.direction ? `，最近選了「${ACTION_DIRECTION_LABELS[latest.direction]}」` : ''}${latest.note ? `；你寫下「${latest.note}」` : ''}。這只是待驗證的猜想。` };
  }

  static accept(item: NextStep, title: string): string | null {
    if (ActionFeedbackService.responseFor(item.feedbackKey)) return null;
    const experiment = ExperimentService.add(title, item.hypothesis, 'experience', null, item.goalId);
    const action = ActionService.add(title, 'once', item.goalId, item.hypothesis, experiment.id);
    ExperimentService.update(experiment.id, { status: 'doing' });
    ActionFeedbackService.respond(item.actionId, 'confirm', item.feedbackKey, experiment.id);
    return action.id;
  }
}
