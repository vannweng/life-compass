/** @description 本機介面記憶的型別、草稿欄位與儲存資料驗證。 */
import type { UiState } from './AppContextModel';
import { DEFAULT_CATEGORIES, GOAL_STATUS_FILTERS, type CategoryTag, type GoalFilterOption } from './GoalModel';
import { isEnergyLevel } from './GoodTimeModel';
import { NAV_TABS, type TabInfo } from './TabModel';

/** @description 可跨重新整理保留的介面狀態，彈窗與一次性捲動目標不保存。 */
export type AppMemory = Pick<UiState, 'tab' | 'goalStatusFilter' | 'goalCategoryFilter' | 'odysseyType'
  | 'calendarMonth' | 'selectedDate' | 'draftEnergy' | 'draftFlow' | 'showExperimentForm'
  | 'experimentPreset' | 'drafts' | 'onboardingStep'>;

/** @description 尚未送出的表單欄位；已即時保存的每日紀錄不重複存為草稿。 */
export const DRAFT_FIELDS: readonly string[] = [
  'gt-activity', 'goal-title', 'goal-cat', 'goal-stage', 'act-title', 'act-repeat',
  'exp-title', 'exp-hyp', 'exp-type', 'ob-activity', 'ob-name',
];

/** @description 記憶資料版本。 */
export const APP_MEMORY_VERSION = 1;

/**
 * @description 判斷值是否為一般物件
 * @param value 儲存資料
 * @returns 是否可讀取物件屬性
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @description 驗證完整日期，避免不合法日期使日曆無法顯示
 * @param value 日期值
 * @returns 是否為有效 YYYY-MM-DD
 */
function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/**
 * @description 驗證記憶內容，只回傳合法欄位，缺少或損壞欄位使用啟動預設值
 * @param value LocalStorage 讀取的未知資料
 * @returns 已驗證的介面狀態
 */
export function parseAppMemory(value: unknown): Partial<AppMemory> {
  if (!isRecord(value) || value['version'] !== APP_MEMORY_VERSION) return {};
  const memory: Partial<AppMemory> = {};
  const tab = value['tab'];
  const status = value['goalStatusFilter'];
  const category = value['goalCategoryFilter'];
  const odyssey = value['odysseyType'];
  if (NAV_TABS.some((option: TabInfo): boolean => option.id === tab)) memory.tab = tab as AppMemory['tab'];
  if (GOAL_STATUS_FILTERS.some((option: GoalFilterOption): boolean => option.id === status)) memory.goalStatusFilter = status as AppMemory['goalStatusFilter'];
  if (category === 'all' || DEFAULT_CATEGORIES.some((option: CategoryTag): boolean => option.id === category)) memory.goalCategoryFilter = category as string;
  if (odyssey === 'current' || odyssey === 'pivot' || odyssey === 'wild') memory.odysseyType = odyssey;
  const month = value['calendarMonth'];
  if (typeof month === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(month)) memory.calendarMonth = month;
  if (isDateKey(value['selectedDate'])) memory.selectedDate = value['selectedDate'];
  if (isEnergyLevel(value['draftEnergy'])) memory.draftEnergy = value['draftEnergy'];
  if (typeof value['draftFlow'] === 'boolean') memory.draftFlow = value['draftFlow'];
  if (typeof value['showExperimentForm'] === 'boolean') memory.showExperimentForm = value['showExperimentForm'];
  if (typeof value['experimentPreset'] === 'string') memory.experimentPreset = value['experimentPreset'].slice(0, 200);
  const step = value['onboardingStep'];
  if (typeof step === 'number' && Number.isInteger(step) && step >= 1 && step <= 4) memory.onboardingStep = step;
  const drafts = value['drafts'];
  if (isRecord(drafts)) {
    memory.drafts = {};
    for (const id of DRAFT_FIELDS) {
      const text = drafts[id];
      if (typeof text === 'string') memory.drafts[id] = text.slice(0, 2048);
    }
  }
  return memory;
}
