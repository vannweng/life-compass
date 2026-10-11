/**
 * @description 使用者個人設定資料模型
 * @module models/ProfileModel
 */

/** @description 主題模式 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * @description 羅盤（人生觀 / 工作觀）練習內容
 */
export interface CompassNote {
  /** 人生觀：你認為人生的意義是什麼 */
  life: string;
  /** 工作觀：你為什麼工作、工作對你代表什麼 */
  work: string;
}

/**
 * @description 使用者個人設定
 */
export interface UserProfile {
  name: string;
  /** 出生日期 YYYY-MM-DD */
  birthDate: string;
  /** 預期壽命（歲） */
  expectedAge: number;
  theme: ThemeMode;
  onboardingCompleted: boolean;
  /** 每日提醒時間 HH:mm */
  reminderTime: string;
  compass: CompassNote;
}

/** @description 預設預期壽命 */
export const DEFAULT_EXPECTED_AGE = 80;

/** @description 預設使用者設定 */
export const DEFAULT_PROFILE: UserProfile = {
  name: '探索者',
  birthDate: '1998-01-01',
  expectedAge: DEFAULT_EXPECTED_AGE,
  theme: 'dark',
  onboardingCompleted: false,
  reminderTime: '21:30',
  compass: { life: '', work: '' },
};
