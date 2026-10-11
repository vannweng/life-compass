/**
 * @description 目標分頁視圖：時鐘 Hero → 本月聚焦 → 清單庫
 * @module views/GoalsView
 */

import { FocusThisMonth } from '../components/FocusThisMonth';
import { GoalLibrary } from '../components/GoalLibrary';
import { LifeClockHero } from '../components/LifeClockHero';
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';

/**
 * @description 目標分頁
 */
export class GoalsView {
  /**
   * @description 渲染視圖
   * @param ctx 應用上下文
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(ctx: AppContext, profile: UserProfile): string {
    return `<div class="view" id="view-goals">
      ${LifeClockHero.render(profile)}
      ${FocusThisMonth.render()}
      ${GoalLibrary.render(ctx)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(FocusThisMonth.handlers(ctx), GoalLibrary.handlers(ctx));
  }
}
