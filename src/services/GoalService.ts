/**
 * @description 人生目標服務（清單 + 每月聚焦）
 * @module services/GoalService
 */

import { MAX_FOCUS_PER_MONTH, type Goal, type GoalStatus, type GoalStatusFilter, type LifeStage } from '../models/GoalModel';
import { DateService } from './DateService';
import { STORAGE_KEYS, StorageService } from './StorageService';
import { createId } from './TextService';

/** @description 切換聚焦結果 */
export type FocusToggleResult = 'added' | 'removed' | 'full';

/**
 * @description 人生目標服務
 */
export class GoalService {
  /**
   * @description 取得所有目標，依本月聚焦推導未完成狀態，相容既有資料
   * @returns 目標陣列
   */
  static getAll(): Goal[] {
    return StorageService.get<Goal[]>(STORAGE_KEYS.GOALS, []).map((goal: Goal): Goal => ({
      ...goal, status: this.statusFor(goal),
    }));
  }

  /**
   * @description 依完成狀態與指定月份的聚焦紀錄判斷顯示狀態
   * @param goal 目標
   * @param monthKey YYYY-MM，預設本月
   * @returns 已完成、本月聚焦中或想做清單
   */
  static statusFor(goal: Goal, monthKey: string = DateService.monthKey()): GoalStatus {
    if (goal.status === 'done') return 'done';
    return goal.focusMonths.includes(monthKey) ? 'active' : 'idea';
  }

  /**
   * @description 依本月狀態及分類篩選目標
   * @param status 狀態篩選
   * @param category 分類 ID 或 all
   * @returns 符合條件的目標
   */
  static filtered(status: GoalStatusFilter, category: string): Goal[] {
    return this.getAll().filter((goal: Goal): boolean =>
      (status === 'all' || goal.status === status) && (category === 'all' || goal.category === category));
  }

  /**
   * @description 儲存全部目標
   * @param goals 目標陣列
   * @returns 無
   */
  static saveAll(goals: Goal[]): void {
    StorageService.set(STORAGE_KEYS.GOALS, goals);
  }

  /**
   * @description 新增目標
   * @param title 標題
   * @param category 分類 ID
   * @param stage 人生階段
   * @param status 初始狀態
   * @returns 新目標
   */
  static add(title: string, category: string, stage: LifeStage, status: GoalStatus = 'idea'): Goal {
    const goal: Goal = {
      id: createId('goal'), title: title.trim(), category, stage, status,
      focusMonths: [], createdAt: DateService.todayKey(), completedDate: null, note: '',
    };
    this.saveAll([goal, ...this.getAll()]);
    return goal;
  }

  /**
   * @description 更新目標
   * @param id 目標 ID
   * @param patch 欲更新欄位
   * @returns 無
   */
  static update(id: string, patch: Partial<Goal>): void {
    this.saveAll(this.getAll().map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  /**
   * @description 刪除目標
   * @param id 目標 ID
   * @returns 無
   */
  static remove(id: string): void {
    this.saveAll(this.getAll().filter((g) => g.id !== id));
  }

  /**
   * @description 切換完成狀態
   * @param id 目標 ID
   * @returns 無
   */
  static toggleDone(id: string): void {
    const goal = this.getAll().find((g) => g.id === id);
    if (!goal) return;
    const done = goal.status !== 'done';
    const status = done ? 'done' : this.statusFor({ ...goal, status: 'idea' });
    this.update(id, { status, completedDate: done ? DateService.todayKey() : null });
  }

  /**
   * @description 取得某月聚焦目標
   * @param monthKey YYYY-MM
   * @returns 目標陣列
   */
  static focusFor(monthKey: string = DateService.monthKey()): Goal[] {
    return this.getAll().filter((g) => g.focusMonths.includes(monthKey));
  }

  /**
   * @description 切換本月聚焦（上限 MAX_FOCUS_PER_MONTH）
   * @param id 目標 ID
   * @param monthKey YYYY-MM
   * @returns 切換結果
   */
  static toggleFocus(id: string, monthKey: string = DateService.monthKey()): FocusToggleResult {
    const goal = this.getAll().find((g) => g.id === id);
    if (!goal) return 'removed';
    if (goal.focusMonths.includes(monthKey)) {
      this.update(id, {
        focusMonths: goal.focusMonths.filter((m: string): boolean => m !== monthKey),
        status: goal.status === 'done' ? 'done' : 'idea',
      });
      return 'removed';
    }
    if (this.focusFor(monthKey).length >= MAX_FOCUS_PER_MONTH) return 'full';
    const status: GoalStatus = goal.status === 'idea' ? 'active' : goal.status;
    this.update(id, { focusMonths: [...goal.focusMonths, monthKey], status });
    return 'added';
  }
}
