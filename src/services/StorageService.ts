/**
 * @description LocalStorage 封裝服務（未來可替換為 Capacitor Preferences / 雲端同步）
 * @module services/StorageService
 */

/** @description 所有儲存鍵值（v2 前綴，與舊版資料隔離） */
export const STORAGE_KEYS = {
  PROFILE: 'lc2_profile',
  DAILY_ENTRIES: 'lc2_daily_entries',
  GOOD_TIMES: 'lc2_good_times',
  GOALS: 'lc2_goals',
  ACTIONS: 'lc2_actions',
  ACTION_LOGS: 'lc2_action_logs',
  ACTION_FEEDBACK: 'lc2_action_feedback',
  WEEKLY_SUGGESTIONS: 'lc2_weekly_suggestions',
  IDEAS: 'lc2_ideas',
  EXPERIMENTS: 'lc2_experiments',
  REVIEWS: 'lc2_reviews',
  ODYSSEY: 'lc2_odyssey',
  MIGRATED: 'lc2_migrated_v1',
  APP_MEMORY: 'lc2_app_memory',
} as const;

/** @description 儲存鍵值型別 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * @description 本地儲存服務
 */
export class StorageService {
  /**
   * @description 讀取資料，失敗時回傳預設值
   * @param key 儲存鍵值
   * @param fallback 預設值
   * @returns 解析後的資料
   */
  static get<T>(key: StorageKey | string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch (error: unknown) {
      console.error(`[StorageService] read failed: ${key}`, error);
      return fallback;
    }
  }

  /**
   * @description 寫入資料
   * @param key 儲存鍵值
   * @param value 欲儲存的值
   * @returns 是否成功寫入
   */
  static set<T>(key: StorageKey, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error: unknown) {
      console.error(`[StorageService] write failed: ${key}`, error);
      return false;
    }
  }

  /**
   * @description 將相依資料一起寫入；任一筆失敗時，盡力還原本次變更。
   * @returns 是否全部成功寫入
   */
  static setMany(entries: ReadonlyArray<{ key: StorageKey; value: unknown }>): boolean {
    let previous: Array<{ key: StorageKey; raw: string | null }> = [];
    try {
      previous = entries.map(({ key }) => ({ key, raw: localStorage.getItem(key) }));
      entries.forEach(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)));
      return true;
    } catch (error: unknown) {
      try {
        previous.forEach(({ key, raw }) => {
          if (raw === null) localStorage.removeItem(key);
          else localStorage.setItem(key, raw);
        });
      } catch (rollbackError: unknown) {
        console.error('[StorageService] rollback failed', rollbackError);
      }
      console.error('[StorageService] batch write failed', error);
      return false;
    }
  }

  /**
   * @description 檢查鍵值是否存在
   * @param key 儲存鍵值
   * @returns 是否存在
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}
