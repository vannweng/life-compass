/**
 * @description 探索流水線服務：把實驗結果與人生清單目標串起來，供回顧頁使用
 * @module services/PipelineService
 */

import type { Experiment } from '../models/ExperimentModel';
import type { Goal } from '../models/GoalModel';
import type { ActionDirection } from '../models/ActionFeedbackModel';
import { ActionFeedbackService } from './ActionFeedbackService';
import { ActionService } from './ActionService';
import { ExperimentService } from './ExperimentService';
import { GoalService } from './GoalService';

/** @description 每區最多顯示幾筆 */
const MAX_PER_GROUP = 3;

/**
 * @description 回顧頁流水線的三組內容
 */
export interface PipelineSummary {
  /** 做完後想繼續、尚未升級成目標的實驗 */
  promotable: Experiment[];
  /** 本月聚焦中的目標 */
  focusGoals: Goal[];
  /** 試過後發現不適合或想放下的實驗 */
  letGo: Experiment[];
  /** 實驗總數 */
  experimentCount: number;
  /** 目標總數 */
  goalCount: number;
}

/**
 * @description 流水線服務
 */
export class PipelineService {
  /**
   * @description 取得某實驗最近一次留下的方向
   * @param experimentId 實驗 ID
   * @returns 方向或 null
   */
  private static latestDirection(experimentId: string): ActionDirection | null {
    const ids = new Set(ActionService.getAll().filter((a) => a.experimentId === experimentId).map((a) => a.id));
    const latest = ActionFeedbackService.getAll().filter((f) => ids.has(f.actionId) && f.direction)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return latest?.direction ?? null;
  }

  /**
   * @description 彙整回顧頁要顯示的實驗與目標
   * @returns 三組內容與總數
   */
  static summary(): PipelineSummary {
    const experiments = ExperimentService.getAll();
    const open = experiments.filter((e) => !e.promotedGoalId && !e.goalId);
    const promotable = open.filter((e) => e.verdict === 'love' || (e.verdict === 'pending' && this.latestDirection(e.id) === 'continue'));
    const letGo = experiments.filter((e) => !e.promotedGoalId && (e.verdict === 'no' || (e.verdict === 'pending' && this.latestDirection(e.id) === 'pause')));
    const goals = GoalService.getAll();
    return {
      promotable: promotable.slice(0, MAX_PER_GROUP),
      focusGoals: GoalService.focusFor().filter((g) => g.status !== 'done').slice(0, MAX_PER_GROUP),
      letGo: letGo.slice(0, MAX_PER_GROUP),
      experimentCount: experiments.length,
      goalCount: goals.length,
    };
  }
}
