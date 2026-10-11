/**
 * @description 日期工具服務（統一使用本地時區的 YYYY-MM-DD）
 * @module services/DateService
 */

/** @description 一天的毫秒數 */
export const MS_PER_DAY = 86_400_000;

/** @description 星期中文 */
const WEEKDAY_LABELS: readonly string[] = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * @description 日期工具
 */
export class DateService {
  /**
   * @description 轉為本地日期鍵值
   * @param date 日期物件
   * @returns YYYY-MM-DD
   */
  static toKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * @description 解析日期鍵值為本地午夜時間
   * @param key YYYY-MM-DD
   * @returns 日期物件
   */
  static fromKey(key: string): Date {
    const [y = '1970', m = '1', d = '1'] = key.split('-');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  /**
   * @description 今天的日期鍵值
   * @returns YYYY-MM-DD
   */
  static todayKey(): string {
    return this.toKey(new Date());
  }

  /**
   * @description 取得月份鍵值
   * @param date 日期物件，預設今天
   * @returns YYYY-MM
   */
  static monthKey(date: Date = new Date()): string {
    return this.toKey(date).slice(0, 7);
  }

  /**
   * @description 取得 ISO 週鍵值
   * @param date 日期物件，預設今天
   * @returns YYYY-Www
   */
  static weekKey(date: Date = new Date()): string {
    const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    const week = Math.ceil(((t.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  /**
   * @description 往前推 n 天（含今天）的日期鍵值清單，由舊到新
   * @param n 天數
   * @returns 日期鍵值陣列
   */
  static lastNDays(n: number): string[] {
    const today = new Date();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (n - 1 - i));
      return this.toKey(d);
    });
  }

  /**
   * @description 計算兩個日期鍵值相差天數（b - a）
   * @param a 起始日期鍵值
   * @param b 結束日期鍵值
   * @returns 天數
   */
  static diffDays(a: string, b: string): number {
    return Math.round((this.fromKey(b).getTime() - this.fromKey(a).getTime()) / MS_PER_DAY);
  }

  /**
   * @description 取得某月所有日期鍵值
   * @param monthKey YYYY-MM
   * @returns 日期鍵值陣列
   */
  static daysInMonth(monthKey: string): string[] {
    const [y = '1970', m = '1'] = monthKey.split('-');
    const count = new Date(Number(y), Number(m), 0).getDate();
    return Array.from({ length: count }, (_, i) => `${monthKey}-${String(i + 1).padStart(2, '0')}`);
  }

  /**
   * @description 顯示用日期文字
   * @param key YYYY-MM-DD
   * @returns 例如「10 月 4 日 週六」
   */
  static formatDisplay(key: string): string {
    const d = this.fromKey(key);
    return `${d.getMonth() + 1} 月 ${d.getDate()} 日 週${WEEKDAY_LABELS[d.getDay()] ?? ''}`;
  }

  /**
   * @description 目前時間 HH:mm
   * @returns 時間字串
   */
  static nowTime(): string {
    const n = new Date();
    return `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
  }
}
