/**
 * @description 探索分頁視圖：能量地圖 → 小實驗 → 三種人生
 * @module views/ExploreView
 */

import { ExplorationHub } from '../components/ExplorationHub';
import { OdysseyBoard } from '../components/OdysseyBoard';
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import { dataOf } from '../components/Dom';

/**
 * @description 探索分頁
 */
export class ExploreView {
  /**
   * @description 渲染視圖
   * @param ctx 應用上下文
   * @returns HTML 字串
   */
  static render(ctx: AppContext): string {
    const odyssey = ctx.ui.exploreSection === 'odyssey';
    return `<div class="view" id="view-explore">
      <div class="explore-section-tabs" role="tablist" aria-label="探索方式">
        <button class="btn btn--ghost ${odyssey ? '' : 'is-active'}" role="tab" aria-selected="${!odyssey}" data-action="explore:section" data-section="explore">探索自己</button>
        <button class="btn btn--ghost ${odyssey ? 'is-active' : ''}" role="tab" aria-selected="${odyssey}" data-action="explore:section" data-section="odyssey">三種人生</button>
      </div>
      ${odyssey ? OdysseyBoard.render(ctx) : ExplorationHub.render(ctx)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(ExplorationHub.handlers(ctx), OdysseyBoard.handlers(ctx), {
      actions: { 'explore:section': (el) => ctx.setUi({ exploreSection: dataOf(el, 'section') === 'odyssey' ? 'odyssey' : 'explore' }) },
      inputs: {},
    });
  }
}
