/**
 * @description 探索實驗（原型測試）資料模型
 * @module models/ExperimentModel
 */

/** @description 實驗狀態 */
export type ExperimentStatus = 'planned' | 'doing' | 'done';

/** @description 實驗模式：訪談他人 / 親身體驗 */
export type ExperimentType = 'interview' | 'experience';

/** @description 實驗結論：喜歡 / 普通 / 不適合 / 尚未判斷 */
export type ExperimentVerdict = 'pending' | 'love' | 'meh' | 'no';

/**
 * @description 探索實驗
 */
export interface Experiment {
  id: string;
  title: string;
  /** 想驗證的假設 */
  hypothesis: string;
  type: ExperimentType;
  status: ExperimentStatus;
  verdict: ExperimentVerdict;
  learnings: string;
  /** 來源好時光紀錄 ID */
  sourceGoodTimeId: string | null;
  /** 晉升後的目標 ID */
  promotedGoalId: string | null;
  createdAt: string;
}

/** @description 狀態標籤 */
export const EXPERIMENT_STATUS_LABELS: Record<ExperimentStatus, string> = {
  planned: '計畫中',
  doing: '進行中',
  done: '已完成',
};

/** @description 模式標籤 */
export const EXPERIMENT_TYPE_LABELS: Record<ExperimentType, string> = {
  interview: '找人聊聊',
  experience: '親身體驗',
};

/** @description 結論標籤 */
export const EXPERIMENT_VERDICT_LABELS: Record<ExperimentVerdict, string> = {
  pending: '還不確定',
  love: '想繼續',
  meh: '普通',
  no: '不適合我',
};
