/** @description 人生清單列、今日一步與完成操作。 */
import { DEFAULT_CATEGORIES, STAGE_MAP, type CategoryTag, type Goal } from '../models/GoalModel';
import { escapeHtml } from '../services/TextService';
import { ICONS, icon } from './Dom';
import { ActionSources } from './ActionSources';

/** @description 顯示目標標題、分類、今日一步及完成操作。 */
export class GoalListItem {
  /**
   * @description 渲染單一人生清單項目
   * @param goal 已推導本月狀態的目標
   * @returns HTML 字串
   */
  static render(goal: Goal): string {
    const category = DEFAULT_CATEGORIES.find((option: CategoryTag): boolean => option.id === goal.category);
    const done = goal.status === 'done';
    const title = escapeHtml(goal.title);
    return `<div class="row goal-list-row ${done ? 'is-done' : ''}" data-goal-id="${goal.id}">
      <button class="check ${done ? 'is-on' : ''}" data-action="goal:done" data-id="${goal.id}"
        aria-label="${done ? '取消完成' : '標記完成'}：${title}" aria-pressed="${done}">${icon(ICONS.check, 14)}</button>
      <div class="row__main"><div class="row__title">${title}</div>
        <div class="row__meta"><span class="cat-pill"><span class="dot" style="background:${category?.color ?? '#999'}"></span>
          ${category?.name ?? '其他'}</span> · ${STAGE_MAP[goal.stage].title}</div>${ActionSources.evidence('goal', goal.id)}</div>
      <div class="goal-actions">${!done ? `<button class="link-btn" data-action="source:goal" data-id="${goal.id}">今天一步</button>` : '<span class="goal-completed">已完成</span>'}
        <button class="btn btn--ghost bare-delete-btn" data-action="goal:remove" data-id="${goal.id}" aria-label="刪除：${title}">${icon(ICONS.trash, 16)}</button>
      </div></div>`;
  }
}
