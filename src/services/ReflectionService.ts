/**
 * @description 回顧與奧德賽計畫儲存服務
 * @module services/ReflectionService
 */

import { createEmptyOdyssey, type OdysseyPlan, type OdysseyType } from '../models/OdysseyModel';
import type { Review, ReviewType } from '../models/ReviewModel';
import { STORAGE_KEYS, StorageService } from './StorageService';

/** @description 回顧表：`${type}:${periodKey}` → Review */
type ReviewMap = Record<string, Review>;

/** @description 奧德賽表 */
type OdysseyMap = Record<OdysseyType, OdysseyPlan>;

/**
 * @description 回顧 / 奧德賽服務
 */
export class ReflectionService {
  /**
   * @description 取得回顧
   * @param type 回顧類型
   * @param periodKey 期間鍵值
   * @param size 題數
   * @returns 回顧資料
   */
  static getReview(type: ReviewType, periodKey: string, size: number): Review {
    const map = StorageService.get<ReviewMap>(STORAGE_KEYS.REVIEWS, {});
    return map[`${type}:${periodKey}`] ?? { type, periodKey, answers: Array.from({ length: size }, () => ''), updatedAt: '' };
  }

  /** 首次隨機選一題；換題排除當前題目，並保留每題原有回答。 */
  static pickQuestion(type: ReviewType, periodKey: string, size: number, shuffle = false): number {
    if (size < 1) return 0;
    const review = this.getReview(type, periodKey, size);
    const saved = review.questionIndex;
    const valid = typeof saved === 'number' && Number.isInteger(saved) && saved >= 0 && saved < size;
    const answered = review.answers.findIndex((answer, index) => index < size && answer.trim() !== '');
    const current = valid ? saved : answered >= 0 ? answered : Math.floor(Math.random() * size);
    const candidates = Array.from({ length: size }, (_, index) => index).filter((index) => index !== current);
    const selected = shuffle && candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] ?? current : current;
    if (saved !== selected) {
      const map = StorageService.get<ReviewMap>(STORAGE_KEYS.REVIEWS, {});
      map[`${type}:${periodKey}`] = { ...review, questionIndex: selected };
      StorageService.set(STORAGE_KEYS.REVIEWS, map);
    }
    return selected;
  }

  /**
   * @description 儲存回顧中的單一答案
   * @param type 回顧類型
   * @param periodKey 期間鍵值
   * @param index 題目索引
   * @param value 答案
   * @param size 題數
   * @returns 無
   */
  static saveAnswer(type: ReviewType, periodKey: string, index: number, value: string, size: number): void {
    const map = StorageService.get<ReviewMap>(STORAGE_KEYS.REVIEWS, {});
    const review = this.getReview(type, periodKey, size);
    const answers = [...review.answers];
    answers[index] = value;
    map[`${type}:${periodKey}`] = { ...review, answers, updatedAt: new Date().toISOString() };
    StorageService.set(STORAGE_KEYS.REVIEWS, map);
  }

  /**
   * @description 取得三種奧德賽計畫
   * @returns 奧德賽表
   */
  static getOdyssey(): OdysseyMap {
    const stored = StorageService.get<Partial<OdysseyMap>>(STORAGE_KEYS.ODYSSEY, {});
    return {
      current: stored.current ?? createEmptyOdyssey('current'),
      pivot: stored.pivot ?? createEmptyOdyssey('pivot'),
      wild: stored.wild ?? createEmptyOdyssey('wild'),
    };
  }

  /**
   * @description 更新某個奧德賽計畫
   * @param type 版本
   * @param patch 欲更新欄位
   * @returns 無
   */
  static updateOdyssey(type: OdysseyType, patch: Partial<OdysseyPlan>): void {
    const map = this.getOdyssey();
    map[type] = { ...map[type], ...patch, type };
    StorageService.set(STORAGE_KEYS.ODYSSEY, map);
  }
}
