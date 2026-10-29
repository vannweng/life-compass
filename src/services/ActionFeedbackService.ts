/**
 * @description 管理小行動後的線索，以及使用者對每週建議的回應。
 * @module services/ActionFeedbackService
 */

import type { ActionFeedback, ActionDirection, SuggestionResponse, WeeklySuggestionResponse } from '../models/ActionFeedbackModel';
import { DateService } from './DateService';
import { STORAGE_KEYS, StorageService } from './StorageService';
import { createId } from './TextService';
import type { EnergyLevel } from '../models/GoodTimeModel';
import { ActionService } from './ActionService';
import { GoodTimeService } from './GoodTimeService';

/** @description 小行動回饋的本機儲存服務。 */
export class ActionFeedbackService {
  /** @description 取得全部回饋。 @returns 回饋清單。 */
  static getAll(): ActionFeedback[] {
    return StorageService.get<ActionFeedback[]>(STORAGE_KEYS.ACTION_FEEDBACK, []);
  }

  /** @description 取得每週建議回應。 @returns 回應清單。 */
  static getResponses(): WeeklySuggestionResponse[] {
    return StorageService.get<WeeklySuggestionResponse[]>(STORAGE_KEYS.WEEKLY_SUGGESTIONS, []);
  }

  /**
   * @description 新增或更新某日某件行動的回饋。
   * @param actionId 行動 ID。
   * @param direction 暫時方向，可留空。
   * @param note 觀察、疑問或原因。
   * @returns 無。
   */
  static save(actionId: string, direction: ActionDirection | null, note: string, energy: EnergyLevel | null = null, isFlow = false): void {
    const date = DateService.todayKey();
    const prior = this.getAll().find((item) => item.actionId === actionId && item.date === date);
    const step = ActionService.stepFor(actionId);
    const next: ActionFeedback = { id: prior?.id ?? createId('feedback'), actionId, date, direction,
      note: note.trim(), energy, isFlow, step, createdAt: new Date().toISOString() };
    const existing = this.getAll().filter((item) => item.actionId !== actionId || item.date !== date);
    StorageService.set(STORAGE_KEYS.ACTION_FEEDBACK, [...existing, next]);
    if (energy !== null) GoodTimeService.saveForAction(actionId, step, energy, isFlow);
  }

  /**
   * @description 取得指定行動最近的一則回饋。
   * @param actionId 行動 ID。
   * @returns 回饋或 null。
   */
  static latest(actionId: string): ActionFeedback | null {
    return this.getAll().filter((item) => item.actionId === actionId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }

  /**
   * @description 取得最近天數內的回饋。
   * @param days 天數。
   * @returns 由新到舊的回饋清單。
   */
  static recent(days: number): ActionFeedback[] {
    const dates = new Set(DateService.lastNDays(days));
    return this.getAll().filter((item) => dates.has(item.date)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * @description 記錄使用者對本週建議的立場。
   * @param actionId 建議對應的行動 ID。
   * @param response 確認或反駁。
   * @returns 無。
   */
  static respond(actionId: string, response: SuggestionResponse, feedbackId: string, experimentId?: string): void {
    const week = DateService.weekKey();
    const remaining = this.getResponses().filter((item) => item.week !== week || item.feedbackId !== feedbackId);
    StorageService.set(STORAGE_KEYS.WEEKLY_SUGGESTIONS, [...remaining, { week, actionId, response, feedbackId, experimentId, createdAt: new Date().toISOString() }]);
  }

  /**
   * @description 讀取指定建議的目前回應。
   * @param actionId 行動 ID。
   * @returns 回應或 null。
   */
  static responseFor(feedbackId: string): WeeklySuggestionResponse | null {
    const week = DateService.weekKey();
    return this.getResponses().find((item) => item.week === week && item.feedbackId === feedbackId) ?? null;
  }
}
