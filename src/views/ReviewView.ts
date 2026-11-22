/**
 * @description 回顧分頁視圖：證據建議 → 心情趨勢 → 週/月隨想 → 過去紀錄
 * @module views/ReviewView
 */

import { CompassReflection } from '../components/CompassReflection';
import { HistoryCalendar } from '../components/HistoryCalendar';
import { LifeGrid } from '../components/LifeGrid';
import { ReviewPipeline } from '../components/ReviewPipeline';
import { WeeklyNextStep } from '../components/WeeklyNextStep';
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';

/**
 * @description 回顧分頁
 */
export class ReviewView {
  /**
   * @description 渲染視圖
   * @param ctx 應用上下文
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(ctx: AppContext, _profile: UserProfile): string {
    return `<div class="view" id="view-review">
      ${CompassReflection.render()}
      ${WeeklyNextStep.render()}
      ${ReviewPipeline.render()}
      ${LifeGrid.renderMood()}
      ${HistoryCalendar.render(ctx)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(CompassReflection.handlers(ctx), ReviewPipeline.handlers(ctx), HistoryCalendar.handlers(ctx), WeeklyNextStep.handlers(ctx));
  }
}
