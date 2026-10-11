/**
 * @description 舊版（v1）資料遷移服務：只執行一次，不刪除舊資料
 * @module services/MigrationService
 */

import type { MoodValue } from '../models/DailyEntryModel';
import type { Experiment } from '../models/ExperimentModel';
import { isEnergyLevel, type GoodTimeEntry } from '../models/GoodTimeModel';
import { isLifeStage, type Goal } from '../models/GoalModel';
import { DailyService } from './DailyService';
import { DateService } from './DateService';
import { GoalService } from './GoalService';
import { ProfileService } from './ProfileService';
import { ReflectionService } from './ReflectionService';
import { STORAGE_KEYS, StorageService } from './StorageService';

/** @description 舊版願望項目 */
interface LegacyItem { id: string; title: string; category?: string; isCompleted?: boolean; inMonthly?: boolean; completedDate?: string; quadrant?: string }
/** @description 舊版個人設定 */
interface LegacyProfile { name?: string; birthYear?: number; expectedAge?: number; theme?: 'light' | 'dark' | 'system'; onboardingCompleted?: boolean }
/** @description 舊版好時光 */
interface LegacyGoodTime { id: string; activity: string; energy: number; isFlow?: boolean; timestamp?: string; date?: string }
/** @description 舊版原型測試 */
interface LegacyProto { id: string; title: string; hypothesis?: string; type?: 'interview' | 'experience'; status?: string; learnings?: string }

/** @description 舊分類 → 新分類 */
const CATEGORY_MAP: Record<string, string> = { experience: 'experience', achievement: 'career', learning: 'growth', relationship: 'relationship' };
/** @description 舊心情文字 → 分數 */
const MOOD_MAP: Record<string, MoodValue> = { 沉重: 1, 疲憊: 2, 普通: 3, 平靜: 4, 充實: 5 };

/**
 * @description 資料遷移服務
 */
export class MigrationService {
  /**
   * @description 若尚未遷移則執行一次
   * @returns 是否有執行遷移
   */
  static runOnce(): boolean {
    if (StorageService.has(STORAGE_KEYS.MIGRATED)) return false;
    this.migrateProfile();
    this.migrateGoals();
    this.migrateGoodTimes();
    this.migrateExperiments();
    this.migrateDailyAndReview();
    StorageService.set(STORAGE_KEYS.MIGRATED, new Date().toISOString());
    return true;
  }

  /** @description 遷移個人設定 @returns 無 */
  private static migrateProfile(): void {
    const old = StorageService.get<LegacyProfile | null>('bucket_list_user_profile', null);
    if (!old) return;
    ProfileService.update({
      name: old.name ?? '探索者',
      birthDate: `${old.birthYear ?? 1998}-01-01`,
      expectedAge: old.expectedAge ?? 80,
      theme: old.theme ?? 'dark',
      onboardingCompleted: old.onboardingCompleted ?? false,
    });
  }

  /** @description 遷移願望為目標，本月聚焦最多 3 項 @returns 無 */
  private static migrateGoals(): void {
    const items = StorageService.get<LegacyItem[]>('bucket_list_items', []);
    if (items.length === 0) return;
    const month = DateService.monthKey();
    let focusCount = 0;
    const goals: Goal[] = items.map((it) => {
      const focus = it.inMonthly === true && !it.isCompleted && focusCount < 3;
      if (focus) focusCount++;
      return {
        id: `goal_${it.id}`, title: it.title, category: CATEGORY_MAP[it.category ?? ''] ?? 'experience',
        stage: isLifeStage(it.quadrant) ? it.quadrant : 'q4',
        status: it.isCompleted ? 'done' : focus ? 'active' : 'idea',
        focusMonths: focus ? [month] : [], createdAt: DateService.todayKey(),
        completedDate: it.completedDate ?? null, note: '',
      };
    });
    GoalService.saveAll(goals);
  }

  /** @description 遷移好時光 @returns 無 */
  private static migrateGoodTimes(): void {
    const list = StorageService.get<LegacyGoodTime[]>('bucket_list_good_time_entries', []);
    const entries: GoodTimeEntry[] = list.filter((e) => isEnergyLevel(e.energy)).map((e) => ({
      id: e.id, activity: e.activity, energy: isEnergyLevel(e.energy) ? e.energy : 0, isFlow: Boolean(e.isFlow),
      date: e.date ?? DateService.todayKey(), time: (e.timestamp ?? '00:00').slice(0, 5),
    }));
    if (entries.length) StorageService.set(STORAGE_KEYS.GOOD_TIMES, entries);
  }

  /** @description 遷移原型測試為實驗 @returns 無 */
  private static migrateExperiments(): void {
    const list = StorageService.get<LegacyProto[]>('bucket_list_prototype_items', []);
    const exps: Experiment[] = list.map((p) => ({
      id: p.id, title: p.title, hypothesis: p.hypothesis ?? '', type: p.type ?? 'experience',
      status: p.status === 'completed' ? 'done' : p.status === 'in_progress' ? 'doing' : 'planned',
      verdict: 'pending', learnings: p.learnings ?? '', sourceGoodTimeId: null, promotedGoalId: null, createdAt: DateService.todayKey(),
    }));
    if (exps.length) StorageService.set(STORAGE_KEYS.EXPERIMENTS, exps);
  }

  /** @description 遷移未分日期的隨筆與月覆盤到今天 / 本月 @returns 無 */
  private static migrateDailyAndReview(): void {
    const note = StorageService.get<string>('daily_note_text', '');
    const mood = MOOD_MAP[StorageService.get<string>('daily_selected_mood', '')] ?? null;
    if (note || mood) DailyService.update(DateService.todayKey(), { note, mood });
    const month = DateService.monthKey();
    ['monthly_review_1', 'monthly_review_2'].forEach((key, i) => {
      const text = StorageService.get<string>(key, '');
      if (text) ReflectionService.saveAnswer('month', month, i, text, 3);
    });
  }
}
