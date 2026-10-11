/**
 * @description 奧德賽計畫（三種平行人生）資料模型：空白模板 + 引導提問
 * @module models/OdysseyModel
 */

/** @description 三種人生版本 */
export type OdysseyType = 'current' | 'pivot' | 'wild';

/**
 * @description 奧德賽版本模板（引導文字）
 */
export interface OdysseyTemplate {
  type: OdysseyType;
  label: string;
  guide: string;
  placeholder: string;
}

/**
 * @description 使用者填寫的一種人生版本
 */
export interface OdysseyPlan {
  type: OdysseyType;
  title: string;
  year1: string;
  year3: string;
  year5: string;
  /** 喜歡程度 0–5 */
  like: number;
  /** 信心程度 0–5 */
  confidence: number;
}

/** @description 三種版本的引導提問 */
export const ODYSSEY_TEMPLATES: readonly OdysseyTemplate[] = [
  { type: 'current', label: '延續現在', guide: '如果照現在的路走下去，5 年後的你在做什麼？', placeholder: '例如：在目前領域升職、深耕專業…' },
  { type: 'pivot', label: '換條路', guide: '如果現在這條路突然消失了，你會改做什麼？', placeholder: '例如：轉職做教學、開一間小店…' },
  { type: 'wild', label: '不設限', guide: '如果不用考慮錢和別人眼光，你最想過什麼生活？', placeholder: '例如：旅居海島、當插畫家…' },
];

/** @description 年度提問 */
export const ODYSSEY_YEAR_PROMPTS: Record<'year1' | 'year3' | 'year5', string> = {
  year1: '第 1 年：第一步會做什麼？',
  year3: '第 3 年：生活大概是什麼樣子？',
  year5: '第 5 年：你成為了什麼樣的人？',
};

/**
 * @description 建立空白奧德賽版本
 * @param type 版本類型
 * @returns 空白計畫
 */
export function createEmptyOdyssey(type: OdysseyType): OdysseyPlan {
  return { type, title: '', year1: '', year3: '', year5: '', like: 0, confidence: 0 };
}
