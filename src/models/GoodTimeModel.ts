/**
 * @description 好時光日誌（能量紀錄）資料模型
 * @module models/GoodTimeModel
 */

/** @description 能量值 -2（極耗能）~ +2（高充能） */
export type EnergyLevel = -2 | -1 | 0 | 1 | 2;

/**
 * @description 能量選項設定
 */
export interface EnergyOption {
  value: EnergyLevel;
  label: string;
  color: string;
}

/**
 * @description 好時光紀錄
 */
export interface GoodTimeEntry {
  id: string;
  /** 日期 YYYY-MM-DD */
  date: string;
  /** 時間 HH:mm */
  time: string;
  activity: string;
  energy: EnergyLevel;
  /** 是否進入心流（全神貫注、忘記時間） */
  isFlow: boolean;
}

/** @description 能量選項 */
export const ENERGY_OPTIONS: readonly EnergyOption[] = [
  { value: -2, label: '極耗能', color: '#F87171' },
  { value: -1, label: '微消耗', color: '#FB923C' },
  { value: 0, label: '持平', color: '#94A3B8' },
  { value: 1, label: '微充能', color: '#34D399' },
  { value: 2, label: '高充能', color: '#A3E635' },
];

/**
 * @description 判斷任意數值是否為合法能量值
 * @param value 待檢查數值
 * @returns 是否為 EnergyLevel
 */
export function isEnergyLevel(value: unknown): value is EnergyLevel {
  return value === -2 || value === -1 || value === 0 || value === 1 || value === 2;
}
