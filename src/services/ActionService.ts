/**
 * @description 每日行動服務（每天可重新勾選的習慣與單次任務）
 * @module services/ActionService
 */

import type { Action, ActionLog, ActionRepeat } from '../models/ActionModel';
import { DateService } from './DateService';
import { STORAGE_KEYS, StorageService } from './StorageService';
import { createId } from './TextService';

/**
 * @description 每日行動服務
 */
export class ActionService {
  /**
   * @description 取得所有行動
   * @returns 行動陣列
   */
  static getAll(): Action[] {
    return StorageService.get<Action[]>(STORAGE_KEYS.ACTIONS, []);
  }

  /**
   * @description 取得所有完成紀錄
   * @returns 紀錄陣列
   */
  static getLogs(): ActionLog[] {
    return StorageService.get<ActionLog[]>(STORAGE_KEYS.ACTION_LOGS, []);
  }

  /**
   * @description 新增行動
   * @param title 標題
   * @param repeat 重複類型
   * @param goalId 所屬目標
   * @returns 新行動
   */
  static add(title: string, repeat: ActionRepeat, goalId: string | null = null, reason = '', experimentId: string | null = null): Action {
    const action: Action = { id: createId('act'), title: title.trim(), reason: reason.trim(), goalId, experimentId, repeat, createdAt: DateService.todayKey(), archived: false };
    StorageService.set(STORAGE_KEYS.ACTIONS, [...this.getAll(), action]);
    return action;
  }

  /**
   * @description 更新行動的理由或目前可開始的小步。
   * @param id 行動 ID。
   * @param patch 欲更新的欄位。
   * @returns 無。
   */
  static update(id: string, patch: Partial<Pick<Action, 'reason' | 'microStep' | 'microStepDate' | 'goalId'>>): void {
    StorageService.set(STORAGE_KEYS.ACTIONS, this.getAll().map((action) => (action.id === id ? { ...action, ...patch } : action)));
  }

  /**
   * @description 取得一件行動。
   * @param id 行動 ID。
   * @returns 行動或 null。
   */
  static find(id: string): Action | null {
    return this.getAll().find((action) => action.id === id) ?? null;
  }

  /** 將既有經驗連回小實驗，不複製完成與回饋紀錄。 */
  static linkExperiment(id: string, experimentId: string): void {
    StorageService.set(STORAGE_KEYS.ACTIONS, this.getAll().map((action) => action.id === id ? { ...action, experimentId } : action));
  }

  /** 今天的小步，舊版未指定日期的步驟仍可讀取。 */
  static stepFor(id: string, date = DateService.todayKey()): string {
    const action = this.find(id);
    if (!action) return '';
    return action.microStep && (!action.microStepDate || action.microStepDate === date) ? action.microStep : action.title;
  }

  /** 同一來源已有待辦時沿用，避免反覆點擊建立多份。 */
  static pendingFor(source: 'goal' | 'experiment', id: string): Action | undefined {
    return this.forDate(DateService.todayKey()).find((action) =>
      (source === 'goal' ? action.goalId === id : action.experimentId === id)
      && !this.isDone(action.id, DateService.todayKey()));
  }

  /**
   * @description 封存行動（保留歷史紀錄）
   * @param id 行動 ID
   * @returns 無
   */
  static archive(id: string): void {
    StorageService.set(STORAGE_KEYS.ACTIONS, this.getAll().map((a) => (a.id === id ? { ...a, archived: true } : a)));
  }

  /**
   * @description 是否在某日完成
   * @param id 行動 ID
   * @param date YYYY-MM-DD
   * @returns 是否完成
   */
  static isDone(id: string, date: string): boolean {
    return this.getLogs().some((l) => l.actionId === id && l.date === date);
  }

  /**
   * @description 切換某日完成狀態
   * @param id 行動 ID
   * @param date YYYY-MM-DD
   * @returns 無
   */
  static toggle(id: string, date: string): void {
    const logs = this.getLogs();
    const exists = logs.some((l) => l.actionId === id && l.date === date);
    const next = exists ? logs.filter((l) => !(l.actionId === id && l.date === date)) : [...logs, { actionId: id, date, step: this.stepFor(id, date) }];
    StorageService.set(STORAGE_KEYS.ACTION_LOGS, next);
  }

  /**
   * @description 某日應顯示的行動：每日習慣 + 尚未完成（或當日完成）的單次任務
   * @param date YYYY-MM-DD
   * @returns 行動陣列
   */
  static forDate(date: string): Action[] {
    const logs = this.getLogs();
    return this.getAll().filter((a) => {
      if (a.archived) return false;
      if (a.repeat === 'daily') return true;
      const doneLog = logs.find((l) => l.actionId === a.id);
      return !doneLog || doneLog.date === date;
    });
  }

  /**
   * @description 某日完成的行動數
   * @param date YYYY-MM-DD
   * @returns 數量
   */
  static doneCount(date: string): number {
    return this.getLogs().filter((l) => l.date === date).length;
  }
}
