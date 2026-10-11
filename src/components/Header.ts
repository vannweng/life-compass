/**
 * @description 頂部問候列組件
 * @module components/Header
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';
import { DateService } from '../services/DateService';
import { InsightService } from '../services/InsightService';
import { escapeHtml } from '../services/TextService';
import { ICONS, icon } from './Dom';

/**
 * @description 頂部問候列
 */
export class Header {
  /**
   * @description 依時段回傳問候語
   * @param hour 小時 0–23
   * @returns 問候語
   */
  static greeting(hour: number): string {
    if (hour < 5) return '夜深了';
    if (hour < 11) return '早安';
    if (hour < 14) return '午安';
    if (hour < 18) return '下午好';
    return '晚安';
  }

  /**
   * @description 渲染頂部列
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(profile: UserProfile): string {
    const streak = InsightService.streak();
    return `
      <header class="app-header">
        <div class="app-header__text">
          <p class="app-header__date">${DateService.formatDisplay(DateService.todayKey())}</p>
          <h1 class="app-header__title">${this.greeting(new Date().getHours())}，${escapeHtml(profile.name)}</h1>
        </div>
        <div class="app-header__right">
          <span class="streak-chip" title="連續記錄天數">${icon(ICONS.flame, 14)}<b>${streak}</b> 天</span>
          <button class="icon-btn" id="profile-open-btn" data-action="profile:open" aria-label="個人中心">${icon(ICONS.user)}</button>
        </div>
      </header>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return { actions: { 'profile:open': () => ctx.setUi({ showProfile: true }) }, inputs: {} };
  }
}
