/**
 * @description 人生清單庫：分類篩選、快速新增、聚焦與完成
 * @module components/GoalLibrary
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { DEFAULT_CATEGORIES, STAGE_MAP, isLifeStage, type CategoryTag, type Goal, type StageInfo } from '../models/GoalModel';
import { DateService } from '../services/DateService';
import { GoalService } from '../services/GoalService';
import { ICONS, dataOf, icon, valueOf } from './Dom';
import { GoalFilters } from './GoalFilters';
import { GoalListItem } from './GoalListItem';

/**
 * @description 人生清單庫
 */
export class GoalLibrary {
  /**
   * @description 渲染清單庫
   * @param ctx 應用上下文
   * @returns HTML 字串
   */
  static render(ctx: AppContext): string {
    const { goalStatusFilter: sf, goalCategoryFilter: cf } = ctx.ui;
    const month = DateService.monthKey();
    const rows = GoalService.filtered(sf, cf).map((goal: Goal): string => GoalListItem.render(goal, month)).join('');
    const catOpts = DEFAULT_CATEGORIES.map((category: CategoryTag): string => `<option value="${category.id}">${category.name}</option>`).join('');
    const stageOpts = Object.values(STAGE_MAP).map((stage: StageInfo): string => `<option value="${stage.id}" ${stage.id === 'q4' ? 'selected' : ''}>${stage.title}</option>`).join('');
    return `
      <section class="card" id="goal-library">
        <div class="card__head"><h3>人生清單</h3></div>
        <div class="goal-add">
          <input class="field" id="goal-title" placeholder="寫下一個想做的事…" maxlength="60" />
          <div class="goal-add__row"><select class="field" id="goal-cat">${catOpts}</select><select class="field" id="goal-stage">${stageOpts}</select>
          <button class="btn btn--primary" id="goal-add-btn" data-action="goal:add">${icon(ICONS.plus, 16)}新增</button></div>
        </div>
        ${GoalFilters.render(sf, cf)}
        <div class="goal-list">${rows || '<div class="empty"><b>目前沒有符合篩選的項目</b>可以切換狀態或分類，或新增一件想做的事</div>'}</div>
      </section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return {
      actions: {
        'goal:add': () => {
          const title = valueOf('goal-title');
          if (!title) return ctx.toast('請輸入目標名稱');
          const stage = valueOf('goal-stage');
          GoalService.add(title, valueOf('goal-cat') || 'experience', isLifeStage(stage) ? stage : 'q4');
          ctx.clearDraft('goal-title');
          ctx.refresh();
        },
        'goal:remove': (el) => { GoalService.remove(dataOf(el, 'id')); ctx.refresh(); },
        'goal:filter-status': (el) => {
          const id = dataOf(el, 'id');
          ctx.setUi({ goalStatusFilter: id === 'idea' || id === 'active' || id === 'done' ? id : 'all' });
        },
        'goal:filter-cat': (el) => ctx.setUi({ goalCategoryFilter: dataOf(el, 'id') }),
      },
      inputs: {},
    };
  }
}
