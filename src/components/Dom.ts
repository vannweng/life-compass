/**
 * @description DOM 小工具（組件層共用）
 * @module components/Dom
 */

/**
 * @description 讀取指定 ID 表單元素的值
 * @param id 元素 ID
 * @returns 去除前後空白的值，找不到則為空字串
 */
export function valueOf(id: string): string {
  const el = document.getElementById(id);
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    return el.value.trim();
  }
  return '';
}

/**
 * @description 讀取元素 data 屬性
 * @param el 元素
 * @param name data 名稱（不含 data-）
 * @returns 屬性值或空字串
 */
export function dataOf(el: HTMLElement, name: string): string {
  return el.dataset[name] ?? '';
}

/**
 * @description 產生 SVG 圖示
 * @param path SVG path 資料
 * @param size 尺寸 px
 * @returns SVG 字串
 */
export function icon(path: string, size = 20): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
}

/** @description 常用圖示路徑 */
export const ICONS = {
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  check: 'M5 12.5 10 17l9-10',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
  refresh: 'M4 4v6h6M20 20v-6h-6M5.6 15a7 7 0 0 0 12.3 1.5M18.4 9A7 7 0 0 0 6.1 7.5',
  flame: 'M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-3s.5 2 2 2c0-3-1-5 1-8Z',
  star: 'm12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  arrow: 'M5 12h14m-6-6 6 6-6 6',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0',
  flask: 'M9 3h6M10 3v6L4.5 18.5A1.6 1.6 0 0 0 6 21h12a1.6 1.6 0 0 0 1.5-2.5L14 9V3',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
} as const;
