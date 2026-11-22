/** 完成回饋與事後快記共用的小按鈕。 */
import { EASE_OPTIONS, ENERGY_OPTIONS, type EaseLevel, type EnergyLevel } from '../models/GoodTimeModel';
import { ACTION_DIRECTION_LABELS, type ActionDirection } from '../models/ActionFeedbackModel';

export class ActionFeelings {
  static energy(value: EnergyLevel | null, action: string): string {
    return `<div class="energy-row" role="group" aria-label="這一步的能量（選填）">${ENERGY_OPTIONS.map((option) =>
      `<button class="energy-btn ${value === option.value ? 'is-active' : ''}" style="--c:${option.color}" data-action="${action}"
        data-value="${option.value}" aria-pressed="${value === option.value}">${option.label}</button>`).join('')}</div>`;
  }

  /** @description 順手度按鈕列（選填）。 @param value 目前值 @param action 點擊動作名 @returns HTML 字串 */
  static ease(value: EaseLevel | null, action: string): string {
    return `<p class="context-label">做起來順手嗎？（選填）</p><div class="ease-row" role="group" aria-label="做起來的順手度（選填）">${EASE_OPTIONS.map((option) =>
      `<button class="energy-btn ${value === option.value ? 'is-active' : ''}" style="--c:var(--accent)" data-action="${action}"
        data-value="${option.value}" aria-pressed="${value === option.value}">${option.label}</button>`).join('')}</div>`;
  }

  static direction(value: ActionDirection | null): string {
    return `<div class="action-direction-row" role="group" aria-label="接下來的方向（選填）">${Object.entries(ACTION_DIRECTION_LABELS).map(([id, label]) =>
      `<button class="btn btn--ghost ${value === id ? 'is-active' : ''}" data-action="action:feedback-direction" data-value="${id}" aria-pressed="${value === id}">${label}</button>`).join('')}</div>`;
  }
}
