/** 完成回饋與事後快記共用的小按鈕。 */
import { ENERGY_OPTIONS, type EnergyLevel } from '../models/GoodTimeModel';
import { ACTION_DIRECTION_LABELS, type ActionDirection } from '../models/ActionFeedbackModel';

export class ActionFeelings {
  static energy(value: EnergyLevel | null, action: string): string {
    return `<div class="energy-row" role="group" aria-label="這一步的能量（選填）">${ENERGY_OPTIONS.map((option) =>
      `<button class="energy-btn ${value === option.value ? 'is-active' : ''}" style="--c:${option.color}" data-action="${action}"
        data-value="${option.value}" aria-pressed="${value === option.value}">${option.label}</button>`).join('')}</div>`;
  }

  static direction(value: ActionDirection | null): string {
    return `<div class="action-direction-row" role="group" aria-label="接下來的方向（選填）">${Object.entries(ACTION_DIRECTION_LABELS).map(([id, label]) =>
      `<button class="btn btn--ghost ${value === id ? 'is-active' : ''}" data-action="action:feedback-direction" data-value="${id}" aria-pressed="${value === id}">${label}</button>`).join('')}</div>`;
  }
}
