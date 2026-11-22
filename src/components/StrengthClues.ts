/**
 * @description 探索頁的特長線索：把「充能」與「擅長」分開看
 * @module components/StrengthClues
 */

import { GoodTimeService } from '../services/GoodTimeService';
import { CLUE_ENTRIES } from '../services/JourneyService';
import { MIN_RATED, StrengthService, type StrengthItem } from '../services/StrengthService';
import { escapeHtml } from '../services/TextService';

/**
 * @description 特長線索區塊
 */
export class StrengthClues {
  /**
   * @description 渲染一組線索
   * @param mark 符號
   * @param title 組標題
   * @param note 解讀說明
   * @param items 活動
   * @returns HTML 字串
   */
  private static group(mark: string, title: string, note: string, items: StrengthItem[]): string {
    if (!items.length) return '';
    return `<div class="strength-group"><p class="strength-group__title">${mark} ${title}</p>
      ${items.map((i) => `<div class="exploration-signal"><div class="row__main"><b>${escapeHtml(i.activity)}</b><span>${i.rated} 次評分</span></div></div>`).join('')}
      <p class="card__sub">${note}</p></div>`;
  }

  /**
   * @description 渲染區塊；紀錄太少時不顯示，有紀錄但尚無順手度時顯示說明
   * @returns HTML 字串
   */
  static render(): string {
    if (GoodTimeService.getAll().length < CLUE_ENTRIES) return '';
    const g = StrengthService.groups();
    const shown = g.strengths.length + g.skillOnly.length + g.passion.length;
    const head = '<div class="exploration-block__head"><p class="context-label">特長線索</p></div>';
    if (!shown) {
      return `<div class="exploration-block strength-clues">${head}
        <p class="card__sub">記下事情時，選「做起來順手嗎？」。同一件事有 ${MIN_RATED} 次評分後，這裡會分出：充能又順手、順手但不來電、有熱情還在練。</p></div>`;
    }
    return `<div class="exploration-block strength-clues">${head}
      ${this.group('＋', '充能又順手', '可能是你的特長，值得多試幾次驗證。', g.strengths)}
      ${this.group('○', '順手，但不太充能', '你做得來，不代表一定想多做；這也是有用的發現。', g.skillOnly)}
      ${this.group('△', '充能，但還有點吃力', '有熱情、還在練習；可以拆成更小的一步來試。', g.passion)}
      <p class="card__sub">這些只是根據你的紀錄做出的猜想，最後由你決定。</p></div>`;
  }
}
