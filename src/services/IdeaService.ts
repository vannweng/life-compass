/** @description 待試點子的建立、保存與轉成小實驗。 */
import type { Idea, IdeaSource } from '../models/IdeaModel';
import { DateService } from './DateService';
import { ActionService } from './ActionService';
import { ExperimentService } from './ExperimentService';
import { STORAGE_KEYS, StorageService } from './StorageService';
import { createId } from './TextService';

/** @description 管理尚未確定是否值得投入的點子。 */
export class IdeaService {
  /** @description 取得全部點子。 @returns 點子陣列 */
  static getAll(): Idea[] {
    return StorageService.get<Idea[]>(STORAGE_KEYS.IDEAS, []);
  }

  /** @description 取得仍待嘗試的點子。 @returns 開放點子陣列 */
  static open(): Idea[] {
    return this.getAll().filter((idea) => idea.status === 'open');
  }

  /**
   * @description 新增點子；相同的開放點子只保留一筆。
   * @param title 點子名稱
   * @param source 點子來源
   * @returns 新增或既有點子
   */
  static add(title: string, source: IdeaSource = 'manual'): Idea {
    const clean = title.trim();
    const existing = this.open().find((idea) => idea.title.toLocaleLowerCase() === clean.toLocaleLowerCase());
    if (existing) return existing;
    const idea: Idea = { id: createId('idea'), title: clean, source, status: 'open', experimentId: null, createdAt: DateService.todayKey() };
    StorageService.set(STORAGE_KEYS.IDEAS, [idea, ...this.getAll()]);
    return idea;
  }

  /**
   * @description 依點子文字提供一個可立即確認的小步驟。
   * @param title 點子名稱
   * @returns 建議的第一步
   */
  static suggestStep(title: string): string {
    const clean = title.trim();
    if (/^(去|做|讀|看|寫|整理|運動|散步|聯絡|約|練習|試|煮|畫|拍)/u.test(clean)) return clean;
    if (/(課|體驗|活動)$/u.test(clean)) return `找一個可參加的：${clean}`;
    if (clean.includes('學')) return `找一個「${clean}」的入門方式`;
    return `花 5 分鐘查查看：${clean}`;
  }

  /**
   * @description 把點子轉成可驗證的小實驗，並保留來源關聯。
   * @param id 點子 ID
   * @param step 已確認的第一步
   * @returns 新實驗與今日行動 ID，找不到或已轉換則為 null
   */
  static startExperiment(id: string, step: string): { experimentId: string; actionId: string } | null {
    const idea = this.getAll().find((item) => item.id === id);
    if (!idea || idea.status !== 'open') return null;
    const experiment = ExperimentService.add(idea.title, '先做一小步，看看實際感受。', 'experience', null, null, idea.id);
    const action = ActionService.add(step.trim() || this.suggestStep(idea.title), 'once', null, experiment.hypothesis, experiment.id);
    ExperimentService.update(experiment.id, { status: 'doing' });
    StorageService.set(STORAGE_KEYS.IDEAS, this.getAll().map((item) => item.id === id
      ? { ...item, status: 'testing', experimentId: experiment.id } : item));
    return { experimentId: experiment.id, actionId: action.id };
  }

  /** @description 刪除一筆點子。 @param id 點子 ID @returns 無 */
  static remove(id: string): void {
    StorageService.set(STORAGE_KEYS.IDEAS, this.getAll().filter((idea) => idea.id !== id));
  }
}
