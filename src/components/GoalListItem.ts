/** @description 人生清單列與本月聚焦文字操作。 */
import { DEFAULT_CATEGORIES, STAGE_MAP, type CategoryTag, type Goal } from '../models/GoalModel';
import { escapeHtml } from '../services/TextService';
import { ICONS, icon } from './Dom';

/** @description 顯示目標標題、分類及可辨識的聚焦操作。 */
export class GoalListItem {
  /**
   * @description 渲染單一目標，已聚焦的按鈕可再次點選移出
   * @param goal 已推導本月狀態的目標
   * @param month 本月 YYYY-MM
   * @returns HTML 字串
   */
  static render(goal: Goal, month: string): string {
    const category = DEFAULT_CATEGORIES.find((option: CategoryTag): boolean => option.id === goal.category);
    const focused = goal.focusMonths.includes(month);
    const done = goal.status === 'done';
    const title = escapeHtml(goal.title);
    const focusAction = `${focused ? '移出' : '加入'}本月聚焦：${title}`;
    const focusButton = done && !focused ? '<span class="goal-completed">已完成</span>' :
      `<button class="goal-focus-btn ${focused ? 'is-active' : ''}" data-action="goal:focus" data-id="${goal.id}"
        aria-pressed="${focused}" aria-label="${focusAction}" title="${focused ? '點選移出本月聚焦' : '加入本月聚焦'}">
        ${icon(focused ? ICONS.check : ICONS.plus, 14)}<span>本月聚焦</span></button>`;
    return `<div class="row goal-list-row ${done ? 'is-done' : ''}" data-goal-id="${goal.id}">
      <button class="check ${done ? 'is-on' : ''}" data-action="goal:done" data-id="${goal.id}"
        aria-label="${done ? '取消完成' : '標記完成'}：${title}" aria-pressed="${done}">${icon(ICONS.check, 14)}</button>
      <div class="row__main"><div class="row__title">${title}</div>
        <div class="row__meta"><span class="cat-pill"><span class="dot" style="background:${category?.color ?? '#999'}"></span>
          ${category?.name ?? '其他'}</span> · ${STAGE_MAP[goal.stage].title}</div></div>
      <div class="goal-actions">${focusButton}
        <button class="btn btn--ghost bare-delete-btn" data-action="goal:remove" data-id="${goal.id}" aria-label="刪除：${title}">${icon(ICONS.trash, 16)}</button>
      </div></div>`;
  }
}
