/**
 * @description 底部 App 式導覽列（4 分頁）
 * @module components/BottomNav
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { NAV_TABS, type TabId } from '../models/TabModel';
import { dataOf, icon } from './Dom';

/**
 * @description 判斷字串是否為 TabId
 * @param value 待檢查字串
 * @returns 是否為 TabId
 */
function isTabId(value: string): value is TabId {
  return NAV_TABS.some((t) => t.id === value);
}

/**
 * @description 底部導覽列
 */
export class BottomNav {
  /**
   * @description 渲染導覽列
   * @param active 目前分頁
   * @returns HTML 字串
   */
  static render(active: TabId): string {
    const items = NAV_TABS.map((t) => `
      <button class="bottom-nav__item ${t.id === active ? 'is-active' : ''}" id="nav-${t.id}"
        data-action="nav:go" data-tab="${t.id}" aria-current="${t.id === active ? 'page' : 'false'}">
        ${icon(t.iconPath, 22)}
        <span>${t.label}</span>
      </button>`).join('');
    return `<nav class="bottom-nav" aria-label="主要導覽">${items}</nav>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return {
      actions: {
        'nav:go': (el) => {
          const tab = dataOf(el, 'tab');
          if (isTabId(tab)) {
            ctx.setUi({ tab });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
      },
      inputs: {},
    };
  }
}
