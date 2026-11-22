/**
 * @description 回顧頁「我的指南針」：把 onboarding 的價值觀與近期充能線索放在一起回問
 * @module components/CompassReflection
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { GoodTimeService } from '../services/GoodTimeService';
import { ProfileService } from '../services/ProfileService';
import { escapeHtml } from '../services/TextService';

/** @description 最多顯示的充能事項數 */
const MAX_ENERGIZERS = 3;

/**
 * @description 指南針回顧卡
 */
export class CompassReflection {
  /**
   * @description 取得近 7 天讓人充能（能量 > 0）的事項名稱，去除重複
   * @returns 事項名稱陣列
   */
  private static energizers(): string[] {
    const names = GoodTimeService.recent(7).filter((e) => e.energy > 0).map((e) => e.activity);
    return [...new Set(names)].slice(0, MAX_ENERGIZERS);
  }

  /**
   * @description 渲染卡片；尚未填寫人生觀時改為邀請填寫
   * @returns HTML 字串
   */
  static render(): string {
    const { compass } = ProfileService.get();
    const life = compass.life.trim();
    const work = compass.work.trim();
    if (!life) {
      return `<section class="card compass-reflection" id="compass-reflection"><div class="card__head"><h3>我的指南針</h3></div>
        <p class="card__sub">寫下你覺得什麼樣的人生有意義，之後每週回顧會用它來問你：最近的行動靠近了嗎？</p>
        <button class="link-btn" data-action="compass:edit">現在寫一句</button></section>`;
    }
    const picks = this.energizers();
    const energy = picks.length ? `這週讓你充能的事：${picks.map(escapeHtml).join('、')}。` : '這週還沒有充能的紀錄，記下幾件事就能對照。';
    return `<section class="card compass-reflection" id="compass-reflection"><div class="card__head"><h3>我的指南針</h3></div>
      <p class="context-label">你說有意義的人生是</p><blockquote>${escapeHtml(life)}</blockquote>
      ${work ? `<p class="context-label">你說工作對你代表</p><blockquote>${escapeHtml(work)}</blockquote>` : ''}
      <p class="card__sub">${energy}</p>
      <p class="compass-reflection__question">這些行動，有靠近你說的有意義嗎？${work ? '' : '工作對你又代表什麼？'}</p>
      <button class="link-btn" data-action="compass:edit">${work ? '修改我的答案' : '補上工作觀'}</button></section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return { actions: { 'compass:edit': () => ctx.setUi({ showProfile: true }) }, inputs: {} };
  }
}
