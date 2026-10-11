/**
 * @description 歷史日曆：點選日期查看當天紀錄
 * @module components/HistoryCalendar
 */

import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import { MOOD_OPTIONS, type MoodOption } from '../models/DailyEntryModel';
import { ENERGY_OPTIONS, type EnergyOption, type GoodTimeEntry } from '../models/GoodTimeModel';
import { DailyService } from '../services/DailyService';
import { DateService } from '../services/DateService';
import { GoodTimeService } from '../services/GoodTimeService';
import { InsightService } from '../services/InsightService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon } from './Dom';
import { MoodTree } from './MoodTree';
import { CalendarMoodPicker } from './CalendarMoodPicker';

/**
 * @description 位移月份
 * @param monthKey YYYY-MM
 * @param delta 月數位移
 * @returns 新月份鍵值
 */
function shiftMonth(monthKey: string, delta: number): string {
  const [y = '1970', m = '1'] = monthKey.split('-');
  return DateService.monthKey(new Date(Number(y), Number(m) - 1 + delta, 1));
}

/**
 * @description 歷史日曆
 */
export class HistoryCalendar {
  /**
   * @description 渲染選取日期的詳細內容
   * @param date YYYY-MM-DD
   * @returns HTML 字串
   */
  private static detail(date: string): string {
    const e = DailyService.get(date);
    const mood = MOOD_OPTIONS.find((option: MoodOption): boolean => option.value === e.mood);
    const question = DailyService.questionFor(date);
    const gts = GoodTimeService.byDate(date);
    if (!InsightService.isRecorded(date)) return `<div class="day-detail muted">${DateService.formatDisplay(date)}：沒有紀錄</div>`;
    return `<div class="day-detail"><b>${DateService.formatDisplay(date)}</b>
      ${mood || e.note ? `<p class="history-day-summary">
        ${mood ? `<span class="history-mood" style="--mood-color:${mood.color}">心情：${mood.label}</span>` : ''}
        ${e.note ? `<span>${escapeHtml(e.note)}</span>` : ''}</p>` : ''}
      ${e.answer ? `<div class="history-answer"><p class="history-answer__question">${escapeHtml(question.shortText)}</p>
        <p class="history-answer__text"><span>答：</span>${escapeHtml(e.answer)}</p></div>` : ''}
      ${gts.length ? `<div class="history-energy-list">${gts.map((g: GoodTimeEntry): string => `<div class="history-energy-item">
        <span class="history-energy-item__bullet" aria-hidden="true">·</span><time class="history-energy-item__time num">${g.time}</time>
        <span class="tag">${ENERGY_OPTIONS.find((option: EnergyOption): boolean => option.value === g.energy)?.label ?? '持平'}</span>
        <span class="history-energy-item__activity">${escapeHtml(g.activity)}</span>
        ${g.isFlow ? '<span class="tag tag--love">心流</span>' : ''}</div>`).join('')}</div>` : ''}</div>`;
  }

  /**
   * @description 渲染無底色的日期，有紀錄時顯示 CSS 心情小樹
   * @param date YYYY-MM-DD
   * @param today 今天的日期
   * @param selectedDate 目前選取日期
   * @returns 日期按鈕 HTML 字串
   */
  private static day(date: string, today: string, selectedDate: string): string {
    const entry = DailyService.get(date);
    const mood = MOOD_OPTIONS.find((option: MoodOption): boolean => option.value === entry.mood);
    const recorded = InsightService.isRecorded(date);
    const label = `${DateService.formatDisplay(date)}，${recorded ? mood ? `心情：${mood.label}` : '有紀錄，未選心情' : '沒有紀錄'}`;
    return `<button class="cal-day ${recorded ? 'is-rec' : ''} ${date === today ? 'is-today' : ''}
      ${date === selectedDate ? 'is-sel' : ''} ${date > today ? 'is-future' : ''}"
      data-action="cal:select" data-date="${date}" aria-label="${escapeHtml(label)}" aria-pressed="${date === selectedDate}"
      ${date === today ? 'aria-current="date"' : ''}>
      ${recorded ? MoodTree.render(mood) : ''}<span class="cal-day__number">${Number(date.slice(8))}</span></button>`;
  }

  /**
   * @description 渲染日曆
   * @param ctx 應用上下文
   * @returns HTML 字串
   */
  static render(ctx: AppContext): string {
    const { calendarMonth: month, selectedDate } = ctx.ui;
    const days = DateService.daysInMonth(month);
    const offset = DateService.fromKey(days[0] ?? `${month}-01`).getDay();
    const today = DateService.todayKey();
    const blanks = Array.from({ length: offset }, () => '<span class="cal-day is-blank"></span>').join('');
    const cells = days.map((date: string): string => this.day(date, today, selectedDate)).join('');
    const dow = ['日', '一', '二', '三', '四', '五', '六'].map((w) => `<span class="cal-dow">${w}</span>`).join('');
    return `<section class="card" id="history-calendar" tabindex="-1" aria-label="過去紀錄">
      <div class="card__head"><h3>過去紀錄</h3></div>
      <div class="cal-head"><button class="mini-btn" data-action="cal:prev" aria-label="上個月">${icon('m15 6-6 6 6 6', 16)}</button>
        <h3>${month.replace('-', ' 年 ')} 月</h3>
        <button class="mini-btn" data-action="cal:next" aria-label="下個月">${icon(ICONS.arrow, 16)}</button></div>
      <div class="cal-grid">${dow}${blanks}${cells}</div>
      <p class="cal-hint">有紀錄的日期會長出小樹，顏色代表當天心情</p>${this.detail(selectedDate)}
      ${CalendarMoodPicker.render(selectedDate)}</section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(CalendarMoodPicker.handlers(ctx), {
      actions: {
        'cal:prev': () => ctx.setUi({ calendarMonth: shiftMonth(ctx.ui.calendarMonth, -1) }),
        'cal:next': () => ctx.setUi({ calendarMonth: shiftMonth(ctx.ui.calendarMonth, 1) }),
        'cal:select': (el) => ctx.setUi({ selectedDate: dataOf(el, 'date') }),
      },
      inputs: {},
    });
  }
}
