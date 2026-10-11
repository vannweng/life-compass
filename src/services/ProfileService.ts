/**
 * @description 使用者設定與主題服務
 * @module services/ProfileService
 */

import { DEFAULT_PROFILE, type ThemeMode, type UserProfile } from '../models/ProfileModel';
import { STORAGE_KEYS, StorageService } from './StorageService';

/**
 * @description 使用者設定服務
 */
export class ProfileService {
  /**
   * @description 讀取設定（自動補齊缺少欄位）
   * @returns 使用者設定
   */
  static get(): UserProfile {
    const stored = StorageService.get<Partial<UserProfile>>(STORAGE_KEYS.PROFILE, {});
    return { ...DEFAULT_PROFILE, ...stored, compass: { ...DEFAULT_PROFILE.compass, ...stored.compass } };
  }

  /**
   * @description 部分更新設定
   * @param patch 欲更新欄位
   * @returns 更新後設定
   */
  static update(patch: Partial<UserProfile>): UserProfile {
    const next = { ...this.get(), ...patch };
    StorageService.set(STORAGE_KEYS.PROFILE, next);
    return next;
  }

  /**
   * @description 套用主題到根節點
   * @param theme 主題模式
   * @returns 無
   */
  static applyTheme(theme: ThemeMode): void {
    const resolved = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.setAttribute('data-theme', resolved);
  }
}
