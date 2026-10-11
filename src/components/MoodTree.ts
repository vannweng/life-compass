/** @description 以 CSS 繪製日曆心情小樹，不使用表情符號或圖片。 */
import type { MoodOption } from '../models/DailyEntryModel';

/** @description 有紀錄日期的小樹角色，樹色與表情反映心情。 */
export class MoodTree {
  /**
   * @description 產生樹冠、眼睛與嘴巴的裝飾元素
   * @param mood 當日心情；未選心情時使用中性輪廓
   * @returns HTML 字串，視覺細節由 CSS 繪製
   */
  static render(mood: MoodOption | undefined): string {
    return `<span class="mood-tree mood-tree--${mood?.value ?? 'unrated'}"
      ${mood ? `style="--mood-color:${mood.color}"` : ''} aria-hidden="true">
      <span class="mood-tree__crown"><span class="mood-tree__eyes"></span><span class="mood-tree__mouth"></span></span>
    </span>`;
  }
}
