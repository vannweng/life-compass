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
    return `
      <section class="card time-strip" id="time-strip" data-action="profile:open" role="button" tabindex="0" aria-label="查看餘生時鐘">
        <div class="time-strip__glow"></div>
        <p class="time-strip__day">今天是你人生的第 <b class="num">${s.lifeDayNumber.toLocaleString()}</b> 天</p>
        <div class="time-strip__future">
          <div class="time-strip__metric">
            <span>今年還剩</span>
            <p class="time-strip__metric-value"><b class="num">${s.yearDaysLeft}</b><span>天</span></p>
          </div>
          <div class="time-strip__metric time-strip__metric--seconds">
            <span>餘生</span>
            <p class="time-strip__metric-value"><b class="num" data-live="seconds">${LifeClockService.secondsLeft(profile).toLocaleString()}</b><span>秒</span></p>
          </div>
        </div>
      </section>`;
  }

  /**
   * @description 事件處理（點擊開啟個人中心的完整時鐘，與 Header 共用動作）
   * @param _ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(_ctx: AppContext): Handlers {
    return { actions: {}, inputs: {} };
  }
}
