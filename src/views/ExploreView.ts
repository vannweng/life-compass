/**
 * @description 探索分頁視圖：能量地圖 → 小實驗 → 三種人生
 * @module views/ExploreView
 */

import { EnergyInsight } from '../components/EnergyInsight';
import { ExperimentList } from '../components/ExperimentList';
import { OdysseyBoard } from '../components/OdysseyBoard';
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';

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
    return `<div class="view" id="view-explore">
      ${EnergyInsight.render()}
      ${ExperimentList.render(ctx)}
      ${OdysseyBoard.render(ctx)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(EnergyInsight.handlers(ctx), ExperimentList.handlers(ctx), OdysseyBoard.handlers(ctx));
  }
}
