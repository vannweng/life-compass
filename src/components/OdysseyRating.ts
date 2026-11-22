/**
 * @description 三種人生的 1–5 評分列（看板與引導共用）
 * @module components/OdysseyRating
 */

import type { OdysseyPlan } from '../models/OdysseyModel';

/** @description 可評分欄位 */
export type OdysseyRatingKey = 'like' | 'confidence';

/**
 * @description 渲染評分列
 * @param plan 計畫
 * @param key 評分欄位
 * @param label 標籤
 * @returns HTML 字串
 */
export function renderOdysseyRating(plan: OdysseyPlan, key: OdysseyRatingKey, label: string): string {
  const btns = [1, 2, 3, 4, 5].map((n) => `<button class="btn btn--ghost ${plan[key] === n ? 'is-active' : ''}" data-action="odyssey:rate" data-key="${key}" data-value="${n}" aria-pressed="${plan[key] === n}">${n}</button>`).join('');
  return `<span class="field-label">${label}</span><div class="rating">${btns}</div>`;
}
