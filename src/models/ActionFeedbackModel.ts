/**
 * @description 行動卡住、完成回饋與每週下一步的資料型別。
 * @module models/ActionFeedbackModel
 */

import type { EnergyLevel } from './GoodTimeModel';

/** @description 使用者目前的卡點類型。 */
export type ActionBlocker = 'too-big' | 'unclear' | 'low-energy' | 'unsure';

/** @description 做完後對這件事的暫時方向判斷。 */
export type ActionDirection = 'continue' | 'change' | 'pause';

/** @description 每週建議的使用者回應。 */
export type SuggestionResponse = 'confirm' | 'reject';

/** @description 小行動完成後留下的一則線索。 */
export interface ActionFeedback {
  id: string;
  actionId: string;
  date: string;
  direction: ActionDirection | null;
  note: string;
  createdAt: string;
  energy?: EnergyLevel | null;
  isFlow?: boolean;
  step?: string;
}

/** @description 對每週建議的確認或反駁紀錄。 */
export interface WeeklySuggestionResponse {
  week: string;
  actionId: string;
  response: SuggestionResponse;
  createdAt: string;
  feedbackId?: string;
  experimentId?: string;
}

/** @description 卡點顯示與引導問題。 */
export const ACTION_BLOCKER_GUIDANCE: Record<ActionBlocker, { label: string; question: string; example: string }> = {
  'too-big': { label: '事情太大', question: '如果只花五分鐘，第一步能小到什麼程度？', example: '只打開資料，寫下第一個要查的問題' },
  unclear: { label: '不知道怎麼做', question: '現在最不清楚的是哪一點？先做哪個查證？', example: '搜尋一個關鍵字，記下看懂的一句話' },
  'low-energy': { label: '今天沒力氣', question: '用最省力的方法，還能保留哪一點進度？', example: '只準備好工具，做一分鐘就可以停' },
  unsure: { label: '不確定還要不要做', question: '它原本想幫你做到什麼？今天能先確認什麼？', example: '寫下還想繼續的原因，或問一個人的經驗' },
};

/** @description 完成回饋的方向標籤。 */
export const ACTION_DIRECTION_LABELS: Record<ActionDirection, string> = {
  continue: '更想繼續',
  change: '想換方法',
  pause: '想先放下',
};
