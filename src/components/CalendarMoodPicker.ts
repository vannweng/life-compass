/** @description 月曆選取日期的心情補登組件 */
import type { AppContext, Handlers } from '../models/AppContextModel';
import { MOOD_OPTIONS, type MoodOption } from '../models/DailyEntryModel';
import { DailyService } from '../services/DailyService';
import { DateService } from '../services/DateService';
import { dataOf } from './Dom';

/** @description 選取日期的心情選項與儲存互動 */
export class CalendarMoodPicker {
  /**
   * @description 渲染選取日期的心情選項，未來日期僅顯示提示
   * @param date YYYY-MM-DD
   * @returns 心情選項 HTML
   */
  static render(date: string): string {
    if (date > DateService.todayKey()) return '<p class="cal-hint">未來日期尚不能記錄心情</p>';
    const entry = DailyService.get(date);
    const options = MOOD_OPTIONS.map((option: MoodOption): string => `
      <button type="button" class="mood-btn ${entry.mood === option.value ? 'is-active' : ''}"
        style="--c:${option.color}" data-action="cal:mood" data-date="${date}" data-value="${option.value}"
        aria-pressed="${entry.mood === option.value}">${option.label}</button>`).join('');
    return `<div class="cal-mood-picker">
      <p class="cal-hint">${entry.mood === null ? '補上當日心情' : '修改當日心情'}・點選即儲存</p>
      <div class="mood-row" role="group" aria-label="${DateService.formatDisplay(date)}的心情">${options}</div>
    </div>`;
  }

  /**
   * @description 儲存按鈕對應日期的心情並更新月曆
   * @param ctx 應用上下文
   * @returns 事件處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return {
      actions: {
        'cal:mood': (el: HTMLElement): void => {
          const date = dataOf(el, 'date');
          if (!DailyService.setMoodForDate(date, Number(dataOf(el, 'value')))) return;
          ctx.refresh();
          ctx.toast('當日心情已儲存');
        },
      },
      inputs: {},
    };
  }
}
