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
import gravityIcons from '@iconify-json/gravity-ui/icons.json';

export function icon(path: string, size = 20): string {
  const item = (gravityIcons.icons as Record<string, { body: string }>)[path];
  if (item) return `<svg width="${size}" height="${size}" viewBox="0 0 16 16" aria-hidden="true">${item.body}</svg>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;
}

/** @description 常用圖示路徑 */
export const ICONS = {
  plus: 'plus',
  close: 'xmark',
  check: 'M5 12.5 10 17l9-10',
  trash: 'trash-bin',
  refresh: 'arrows-rotate-right',
  flame: 'flame',
  star: 'star',
  arrow: 'arrow-right',
  user: 'person',
  flask: 'flask',
  bolt: 'thunderbolt',
} as const;
