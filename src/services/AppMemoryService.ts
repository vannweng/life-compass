/** @description 介面狀態與未送出草稿的本機儲存。 */
import { APP_MEMORY_VERSION, DRAFT_FIELDS, parseAppMemory, type AppMemory } from '../models/AppMemoryModel';
import type { UiState } from '../models/AppContextModel';
import { STORAGE_KEYS, StorageService } from './StorageService';

/** @description 記住介面選擇，並在重開時恢復。 */
export class AppMemoryService {
  /**
   * @description 讀取並驗證上次的介面記憶
   * @returns 合法的已儲存狀態
   */
  static load(): Partial<AppMemory> {
    return parseAppMemory(StorageService.get<unknown>(STORAGE_KEYS.APP_MEMORY, null));
  }

  /**
   * @description 保存需要記憶的狀態，不保存個人中心彈窗與捲動指令
   * @param ui 目前介面狀態
   * @returns 無
   */
  static save(ui: UiState): void {
    const { tab, goalStatusFilter, goalCategoryFilter, odysseyType, calendarMonth, selectedDate,
      draftEnergy, draftFlow, showExperimentForm, experimentPreset, drafts, onboardingStep } = ui;
    const memory: AppMemory = { tab, goalStatusFilter, goalCategoryFilter, odysseyType, calendarMonth, selectedDate,
      draftEnergy, draftFlow, showExperimentForm, experimentPreset, drafts, onboardingStep };
    StorageService.set(STORAGE_KEYS.APP_MEMORY, { version: APP_MEMORY_VERSION, ...memory });
  }

  /**
   * @description 暫存指定表單欄位；即時保存的正式資料不納入草稿
   * @param ui 介面狀態
   * @param id 欄位 ID
   * @param value 尚未送出的值
   * @returns 無
   */
  static rememberDraft(ui: UiState, id: string, value: string): void {
    if (DRAFT_FIELDS.includes(id)) ui.drafts[id] = value;
  }
}
