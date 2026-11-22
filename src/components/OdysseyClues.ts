/**
 * @description 三種人生上方的「你的線索」：把價值觀、充能、特長、耗能放在眼前再開始想像
 * @module components/OdysseyClues
 */

import { InsightService } from '../services/InsightService';
import { ProfileService } from '../services/ProfileService';
import { StrengthService } from '../services/StrengthService';
import { escapeHtml } from '../services/TextService';

/** @description 統計天數 */
const WINDOW_DAYS = 30;

/**
 * @description 線索參考卡
 */
export class OdysseyClues {
  /**
   * @description 渲染單行線索
   * @param label 標籤
   * @param items 內容
   * @returns HTML 字串；無內容時為空字串
   */
  private static line(label: string, items: string[]): string {
    return items.length ? `<p class="odyssey-clues__line"><span class="context-label">${label}</span><br/>${items.map(escapeHtml).join('、')}</p>` : '';
  }

  /**
   * @description 渲染卡片；沒有任何線索時不顯示
   * @returns HTML 字串
   */
  static render(): string {
    const life = ProfileService.get().compass.life.trim();
    const up = InsightService.topEnergizers(WINDOW_DAYS).map((a) => a.activity);
    const strengths = StrengthService.groups().strengths.map((s) => s.activity);
    const down = InsightService.topDrainers(WINDOW_DAYS).map((a) => a.activity);
    const body = [
      this.line('你說有意義的人生', life ? [life] : []),
      this.line('讓你充能的事', up),
      this.line('可能是你的特長', strengths),
      this.line('讓你耗能的事', down),
    ].join('');
    if (!body) return '';
    return `<section class="card odyssey-clues" id="odyssey-clues"><p class="context-label">寫之前，先看看你發現了什麼</p>${body}</section>`;
  }
}
