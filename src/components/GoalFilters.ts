/** @description 人生清單的狀態切換與分類標籤。 */
import { DEFAULT_CATEGORIES, GOAL_STATUS_FILTERS, type CategoryTag, type GoalFilterOption, type GoalStatusFilter } from '../models/GoalModel';

/** @description 分開呈現狀態與分類篩選的 UI 組件。 */
export class GoalFilters {
  /**
   * @description 渲染分段切換列及可換行的分類標籤
   * @param status 目前狀態篩選
   * @param category 目前分類篩選
   * @returns HTML 字串
   */
  static render(status: GoalStatusFilter, category: string): string {
    const statuses = GOAL_STATUS_FILTERS.map((option: GoalFilterOption): string =>
      `<button class="goal-status-tab ${status === option.id ? 'is-active' : ''}" data-action="goal:filter-status"
        data-id="${option.id}" aria-pressed="${status === option.id}">${option.label}</button>`).join('');
    const categories: readonly CategoryTag[] = [{ id: 'all', name: '全部', color: '' }, ...DEFAULT_CATEGORIES];
    const tags = categories.map((option: CategoryTag): string =>
      `<button class="goal-category-tag ${category === option.id ? 'is-active' : ''}" data-action="goal:filter-cat"
        data-id="${option.id}" aria-pressed="${category === option.id}">${option.name}</button>`).join('');
    return `<div class="goal-filters">
      <div class="goal-status-tabs" role="group" aria-label="清單狀態">${statuses}</div>
      <div class="goal-category-tags" role="group" aria-label="清單分類">${tags}</div>
    </div>`;
  }
}
