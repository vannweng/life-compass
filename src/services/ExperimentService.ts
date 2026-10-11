/**
 * @description 探索實驗服務（含晉升為人生目標）
 * @module services/ExperimentService
 */

import type { Experiment, ExperimentType } from '../models/ExperimentModel';
import { DateService } from './DateService';
import { GoalService } from './GoalService';
import { STORAGE_KEYS, StorageService } from './StorageService';
import { createId } from './TextService';

/**
 * @description 探索實驗服務
 */
export class ExperimentService {
  /**
   * @description 取得所有實驗
   * @returns 實驗陣列
   */
  static getAll(): Experiment[] {
    return StorageService.get<Experiment[]>(STORAGE_KEYS.EXPERIMENTS, []);
  }

  /**
   * @description 新增實驗
   * @param title 實驗名稱
   * @param hypothesis 想驗證的假設
   * @param type 實驗模式
   * @param sourceGoodTimeId 來源好時光 ID
   * @returns 新實驗
   */
  static add(title: string, hypothesis: string, type: ExperimentType, sourceGoodTimeId: string | null = null): Experiment {
    const exp: Experiment = {
      id: createId('exp'), title: title.trim(), hypothesis: hypothesis.trim(), type,
      status: 'planned', verdict: 'pending', learnings: '',
      sourceGoodTimeId, promotedGoalId: null, createdAt: DateService.todayKey(),
    };
    StorageService.set(STORAGE_KEYS.EXPERIMENTS, [exp, ...this.getAll()]);
    return exp;
  }

  /**
   * @description 更新實驗
   * @param id 實驗 ID
   * @param patch 欲更新欄位
   * @returns 無
   */
  static update(id: string, patch: Partial<Experiment>): void {
    StorageService.set(STORAGE_KEYS.EXPERIMENTS, this.getAll().map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  /**
   * @description 刪除實驗
   * @param id 實驗 ID
   * @returns 無
   */
  static remove(id: string): void {
    StorageService.set(STORAGE_KEYS.EXPERIMENTS, this.getAll().filter((e) => e.id !== id));
  }

  /**
   * @description 將實驗晉升為人生目標
   * @param id 實驗 ID
   * @returns 新目標 ID，若已晉升或不存在則為 null
   */
  static promote(id: string): string | null {
    const exp = this.getAll().find((e) => e.id === id);
    if (!exp || exp.promotedGoalId) return null;
    const goal = GoalService.add(exp.title, 'growth', 'q4');
    this.update(id, { promotedGoalId: goal.id, status: 'done', verdict: 'love' });
    return goal.id;
  }
}
