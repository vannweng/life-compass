/**
 * @description 應用程式 UI 狀態與事件處理型別（組件與視圖共用契約）
 * @module models/AppContextModel
 */

import type { GoalStatusFilter } from './GoalModel';
import type { EnergyLevel } from './GoodTimeModel';
import type { OdysseyType } from './OdysseyModel';
import type { TabId } from './TabModel';

/** @description 可輸入的表單元素 */
export type FieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** @description 點擊動作處理器（el 為帶有 data-action 的元素） */
export type ActionHandler = (el: HTMLElement) => void;

/** @description 輸入處理器（el 為帶有 data-input 的表單元素） */
export type InputHandler = (el: FieldElement) => void;

/** @description 動作對照表 */
export type ActionMap = Record<string, ActionHandler>;

/** @description 輸入對照表 */
export type InputMap = Record<string, InputHandler>;

/**
 * @description 組件 / 視圖回傳的事件處理集合
 */
export interface Handlers {
  actions: ActionMap;
  inputs: InputMap;
}

/**
 * @description 全域 UI 狀態，草稿與瀏覽選擇由 AppMemoryService 保存
 */
export interface UiState {
  tab: TabId;
  goalStatusFilter: GoalStatusFilter;
  goalCategoryFilter: string;
  odysseyType: OdysseyType;
  calendarMonth: string;
  selectedDate: string;
  showProfile: boolean;
  onboardingStep: number | null;
  /** 好時光快記暫存的能量值 */
  draftEnergy: EnergyLevel;
  draftFlow: boolean;
  /** 是否展開新增實驗表單 */
  showExperimentForm: boolean;
  /** 新增實驗表單預填標題 */
  experimentPreset: string;
  /** 尚未送出的輸入草稿（元素 ID → 文字），由組件於重繪時回填 */
  drafts: Record<string, string>;
  /** 渲染後要捲動到的元素 ID */
  scrollTarget: string | null;
}

/**
 * @description 傳給組件的應用程式上下文
 */
export interface AppContext {
  ui: UiState;
  /** 更新 UI 狀態並重新渲染 */
  setUi: (patch: Partial<UiState>) => void;
  /** 資料變更後重新渲染 */
  refresh: () => void;
  /** 顯示輕提示 */
  toast: (message: string) => void;
  /** 清除指定輸入框草稿 */
  clearDraft: (...ids: string[]) => void;
}

/**
 * @description 合併多個 Handlers
 * @param list 處理器集合陣列
 * @returns 合併結果
 */
export function mergeHandlers(...list: Handlers[]): Handlers {
  return list.reduce<Handlers>(
    (acc, h) => ({ actions: { ...acc.actions, ...h.actions }, inputs: { ...acc.inputs, ...h.inputs } }),
    { actions: {}, inputs: {} },
  );
}
