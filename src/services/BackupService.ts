/**
 * @description 資料備份服務：匯出／匯入本機資料為 JSON（不含介面記憶與草稿）
 * @module services/BackupService
 */

import { STORAGE_KEYS, StorageService, type StorageKey } from './StorageService';

/** @description 備份檔格式識別 */
const BACKUP_APP = 'life-compass';

/** @description 備份檔格式版本 */
const BACKUP_VERSION = 1;

/** @description 納入備份的資料鍵值（排除介面記憶與遷移旗標） */
const BACKUP_KEYS: readonly StorageKey[] = Object.values(STORAGE_KEYS)
  .filter((key) => key !== STORAGE_KEYS.APP_MEMORY && key !== STORAGE_KEYS.MIGRATED);

/**
 * @description 備份檔內容
 */
export interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  data: Partial<Record<StorageKey, unknown>>;
}

/**
 * @description 判斷是否為非 null 的物件
 * @param value 任意值
 * @returns 是否為物件
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * @description 備份服務
 */
export class BackupService {
  /**
   * @description 收集目前所有資料
   * @returns 備份檔物件
   */
  static collect(): BackupFile {
    const data: BackupFile['data'] = {};
    for (const key of BACKUP_KEYS) {
      const value = StorageService.get<unknown>(key, null);
      if (value !== null) data[key] = value;
    }
    return { app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: new Date().toISOString(), data };
  }

  /**
   * @description 下載備份檔
   * @returns 無
   */
  static download(): void {
    const blob = new Blob([JSON.stringify(this.collect(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `life-compass-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * @description 解析並驗證備份檔文字
   * @param text 檔案內容
   * @returns 可寫入的資料項目；格式不正確時回傳 null
   */
  static parse(text: string): Array<{ key: StorageKey; value: unknown }> | null {
    let json: unknown;
    try { json = JSON.parse(text); } catch { return null; }
    if (!isRecord(json) || json['app'] !== BACKUP_APP || !isRecord(json['data'])) return null;
    const data = json['data'];
    const entries = BACKUP_KEYS.filter((key) => data[key] !== undefined && data[key] !== null)
      .map((key) => ({ key, value: data[key] }));
    return entries.every((e) => typeof e.value === 'object') && entries.length > 0 ? entries : null;
  }

  /**
   * @description 以備份內容取代目前資料
   * @param entries 已驗證的資料項目
   * @returns 是否成功寫入
   */
  static restore(entries: Array<{ key: StorageKey; value: unknown }>): boolean {
    return StorageService.setMany(entries);
  }
}
