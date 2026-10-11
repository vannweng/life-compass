/**
 * @description 字串與 ID 工具服務（純函式，無 DOM 依賴）
 * @module services/TextService
 */

/** @description HTML 跳脫對照 */
const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * @description 跳脫 HTML 特殊字元，防止 XSS
 * @param value 原始字串
 * @returns 安全字串
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] ?? ch);
}

/**
 * @description 產生唯一 ID
 * @param prefix ID 前綴
 * @returns 唯一識別碼
 */
export function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * @description 正規化活動名稱，用於分組統計
 * @param text 活動名稱
 * @returns 正規化後字串
 */
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}
