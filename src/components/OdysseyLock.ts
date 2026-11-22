/**
 * @description 「三種人生」鎖定畫面：資料還不夠時，說明原因並提供前往記錄或略過
 * @module components/OdysseyLock
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { JourneyService, PATTERN_ENTRIES } from '../services/JourneyService';
import { GoodTimeService } from '../services/GoodTimeService';
import { ProfileService } from '../services/ProfileService';

/**
 * @description 三種人生鎖定卡
 */
export class OdysseyLock {
  /**
   * @description 渲染鎖定卡
   * @returns HTML 字串
   */
  static render(): string {
    const total = Math.min(GoodTimeService.getAll().length, PATTERN_ENTRIES);
    const left = JourneyService.entriesToOdyssey();
    return `<section class="card odyssey-lock" id="odyssey-lock">
      <div class="card__head"><h3>三種人生</h3></div>
      <p class="odyssey-lock__title">先認識現在的自己，再想像未來</p>
      <p class="card__sub">想像三種不同的人生時，如果有你自己的能量紀錄當依據，會比憑空想更貼近你。再記 ${left} 筆就能解鎖。</p>
      <div class="next-step-guide__bar" role="progressbar" aria-valuemin="0" aria-valuemax="${PATTERN_ENTRIES}" aria-valuenow="${total}"><i style="width:${(total / PATTERN_ENTRIES) * 100}%"></i></div>
      <p class="card__sub">已記 ${total} / ${PATTERN_ENTRIES} 筆</p>
      <div class="weekly-next-step__actions">
        <button class="btn btn--primary" data-action="odyssey:record">去記一筆</button>
        <button class="btn btn--ghost" data-action="odyssey:unlock">我想先試試</button></div>
    </section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'odyssey:record': () => ctx.setUi({ page: 'main', tab: 'today', actionEntryMode: 'record', scrollTarget: 'action-composer' }),
      'odyssey:unlock': () => { ProfileService.update({ odysseyUnlocked: true }); ctx.refresh(); },
    }, inputs: {} };
  }
}
