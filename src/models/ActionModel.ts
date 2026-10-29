/**
 * @description 每日行動（習慣 / 單次任務）與完成紀錄資料模型
 * @module models/ActionModel
 */

/** @description 重複類型：每天 / 單次 */
export type ActionRepeat = 'daily' | 'once';

/**
 * @description 行動項目
 */
export interface Action {
  id: string;
  title: string;
  /** 這件事連著的在意理由 */
  reason: string;
  /** 所屬目標 ID，可為空（獨立習慣） */
  goalId: string | null;
  /** 此步驟所屬的小實驗；舊資料可省略。 */
  experimentId?: string | null;
  repeat: ActionRepeat;
  createdAt: string;
  archived: boolean;
  /** 卡住後決定的下一個小步驟 */
  microStep?: string;
  microStepDate?: string;
}

/**
 * @description 行動完成紀錄（依日期）
 */
export interface ActionLog {
  actionId: string;
  /** 保留當次實際做的小步，之後調整行動不改寫歷史。 */
  step?: string;
  /** 完成日期 YYYY-MM-DD */
  date: string;
}

/** @description 重複類型中文標籤 */
export const ACTION_REPEAT_LABELS: Record<ActionRepeat, string> = {
  daily: '每天',
  once: '一次',
};
