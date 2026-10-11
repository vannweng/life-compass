/**
 * @description 回顧分頁視圖：心情趨勢 → 週/月回顧 → 日曆 → 一生點陣
 * @module views/ReviewView
 */

import { HistoryCalendar } from '../components/HistoryCalendar';
import { LifeGrid } from '../components/LifeGrid';
import { ReviewForm } from '../components/ReviewForm';
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
  static render(ctx: AppContext, profile: UserProfile): string {
    return `<div class="view" id="view-review">
      ${LifeGrid.renderMood()}
      ${ReviewForm.render()}
      ${HistoryCalendar.render(ctx)}
      ${LifeGrid.renderGrid(profile)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(ReviewForm.handlers(ctx), HistoryCalendar.handlers(ctx));
  }
}
