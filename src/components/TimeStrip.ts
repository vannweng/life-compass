/**
 * @description 今日時間條：「今天是你人生的第 N 天」— 每天打開都感受到時間
 * @module components/TimeStrip
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';
import { LifeClockService } from '../services/LifeClockService';

/**
 * @description 今日時間條
 */
export class TimeStrip {
  /**
   * @description 渲染時間條
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(profile: UserProfile): string {
    const s = LifeClockService.calculate(profile);
    return `<button class="time-strip" id="time-strip" type="button" data-action="life:open" aria-label="查看一生時間頁">
      <p class="time-strip__day">今天是你人生的第 <b class="num">${s.lifeDayNumber.toLocaleString()}</b> 天</p>
      <div class="time-strip__future">
        <span>今年還剩 <b class="num">${s.yearDaysLeft}</b> 天</span>
        <span>餘生 <b class="num" data-live="seconds">${LifeClockService.secondsLeft(profile).toLocaleString()}</b> 秒</span>
      </div>
    </button>`;
  }

  /**
   * @description 事件處理（點擊開啟個人中心的完整時鐘，與 Header 共用動作）
   * @param _ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return { actions: { 'life:open': () => ctx.setUi({ page: 'life', scrollTarget: 'life-page' }) }, inputs: {} };
  }
}
