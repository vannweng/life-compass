/**
 * @description 今天分頁視圖：時間條 → 每日一問 → 心情隨筆 → 好時光 → 行動
 * @module views/TodayView
 */

import { MoodNoteCard } from '../components/MoodNoteCard';
import { TimeStrip } from '../components/TimeStrip';
import { TodayActions } from '../components/TodayActions';
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';
import { DateService } from '../services/DateService';

/**
 * @description 今天分頁
 */
export class TodayView {
  /**
   * @description 渲染視圖
   * @param ctx 應用上下文
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(ctx: AppContext, profile: UserProfile): string {
    const date = DateService.todayKey();
    return `<div class="view" id="view-today">
      ${TimeStrip.render(profile)}
      ${MoodNoteCard.render(date)}
      ${TodayActions.render(date, ctx)}
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(
      TimeStrip.handlers(ctx),
      MoodNoteCard.handlers(ctx),
      TodayActions.handlers(ctx),
    );
  }
}
