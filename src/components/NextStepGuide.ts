/**
 * @description 今天頁頂部的「下一步」引導卡
 * @module components/NextStepGuide
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { NAV_TABS } from '../models/TabModel';
import { JourneyService } from '../services/JourneyService';
import { escapeHtml } from '../services/TextService';
import { dataOf } from './Dom';

/**
 * @description 下一步引導卡
 */
export class NextStepGuide {
  /**
   * @description 渲染引導卡
   * @returns HTML 字串
   */
  static render(): string {
    const g = JourneyService.guide();
    const cta = g.cta ? `<button class="btn btn--primary" data-action="guide:go" data-tab="${g.cta.tab}" data-section="${g.cta.section ?? ''}">${escapeHtml(g.cta.label)}</button>` : '';
    return `<section class="card next-step-guide" id="next-step-guide" aria-label="下一步">
      <p class="context-label">下一步 · ${escapeHtml(g.stage)}</p>
      <p class="next-step-guide__message">${escapeHtml(g.message)}</p>
      <p class="card__sub">${escapeHtml(g.hint)}</p>
      <div class="next-step-guide__bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(g.progress * 100)}"><i style="width:${g.progress * 100}%"></i></div>
      ${cta}
    </section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'guide:go': (el) => {
        const tab = NAV_TABS.find((t) => t.id === dataOf(el, 'tab'));
        if (tab) { ctx.setUi({ page: 'main', tab: tab.id, ...(dataOf(el, 'section') === 'odyssey' ? { exploreSection: 'odyssey' as const } : {}) }); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      },
    }, inputs: {} };
  }
}
