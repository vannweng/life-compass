/**
 * @description 目標分頁視圖：人生清單
 * @module views/GoalsView
 */

import { GoalLibrary } from '../components/GoalLibrary';
import type { AppContext, Handlers } from '../models/AppContextModel';
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
  static render(ctx: AppContext, _profile: UserProfile): string {
    return `<div class="view" id="view-goals">
      ${GoalLibrary.render(ctx)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return GoalLibrary.handlers(ctx);
  }
}
