/**
 * @description 旅程服務：依累積的能量紀錄決定「下一步引導」
 * @module services/JourneyService
 */

import type { TabId } from '../models/TabModel';
import type { UserProfile } from '../models/ProfileModel';
import { ReflectionService } from './ReflectionService';
import { DateService } from './DateService';
import { GoodTimeService } from './GoodTimeService';

/** @description 開始出現初步線索所需筆數（與探索頁一致） */
export const CLUE_ENTRIES = 3;

/** @description 規律較可靠所需筆數 */
export const PATTERN_ENTRIES = 7;

/**
 * @description 下一步引導內容
 */
export interface JourneyGuide {
  /** 目前階段名稱 */
  stage: string;
  /** 主要訊息 */
  message: string;
  /** 補充說明 */
  hint: string;
  /** 進度 0–1 */
  progress: number;
  /** 行動按鈕（無則不顯示） */
  cta: { label: string; tab: TabId; section?: 'odyssey' } | null;
}

/**
 * @description 旅程服務
 */
export class JourneyService {
  /**
   * @description 依紀錄量與今天是否已記錄，產生引導內容
   * @returns 下一步引導
   */
  static guide(): JourneyGuide {
    const total = GoodTimeService.getAll().length;
    const doneToday = GoodTimeService.byDate(DateService.todayKey()).length > 0;
    const progress = Math.min(1, total / PATTERN_ENTRIES);
    if (total === 0) {
      return { stage: '看見', message: '從記下今天的第一件事開始', progress,
        hint: '不用想太多：剛做完什麼、做完是充能還是耗能？30 秒就好。', cta: null };
    }
    if (total < CLUE_ENTRIES) {
      return { stage: '看見', message: doneToday ? '今天記下了，很好' : '今天有什麼值得記一筆的嗎？', progress,
        hint: `再記 ${CLUE_ENTRIES - total} 筆，就能看到第一批線索。`, cta: null };
    }
    if (total < PATTERN_ENTRIES) {
      return { stage: '理解', message: '已經有初步線索了', progress,
        hint: `先去看看哪些事讓你充能。再記 ${PATTERN_ENTRIES - total} 筆，規律會更可靠。`,
        cta: { label: '看我的線索', tab: 'explore' } };
    }
    return { stage: '想像', message: '線索夠多了，可以開始想像不同的路', progress,
      hint: '用你發現的充能線索，試著寫下三種可能的人生，再回頭看哪一種最靠近你說的有意義。',
      cta: { label: '想像三種人生', tab: 'explore', section: 'odyssey' } };
  }

  /**
   * @description 「三種人生」是否仍鎖定：紀錄不足、尚未手動略過，且還沒寫過任何內容
   * @param profile 使用者設定
   * @returns 是否鎖定
   */
  static odysseyLocked(profile: UserProfile): boolean {
    if (profile.odysseyUnlocked || GoodTimeService.getAll().length >= PATTERN_ENTRIES) return false;
    const plans = Object.values(ReflectionService.getOdyssey());
    return !plans.some((p) => p.title || p.year1 || p.year3 || p.year5 || p.like || p.confidence);
  }

  /**
   * @description 距離解鎖還差幾筆紀錄
   * @returns 剩餘筆數（最小 0）
   */
  static entriesToOdyssey(): number {
    return Math.max(0, PATTERN_ENTRIES - GoodTimeService.getAll().length);
  }
}
