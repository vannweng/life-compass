/**
 * @description 新手引導：時間感 → 人生意義 → 第一筆好時光（三步，全部可略過）
 * @module components/Onboarding
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ENERGY_OPTIONS } from '../models/GoodTimeModel';
import { isEnergyLevel } from '../models/GoodTimeModel';
import { GoodTimeService } from '../services/GoodTimeService';
import { LifeClockService } from '../services/LifeClockService';
import { ProfileService } from '../services/ProfileService';
import { escapeHtml } from '../services/TextService';
import { STORAGE_KEYS, StorageService } from '../services/StorageService';
import { DateService } from '../services/DateService';
import { createId } from '../services/TextService';

/** @description 引導總步數 */
const TOTAL_STEPS = 3;

/**
 * @description 將舊版記憶中的步驟（最多 5）收斂到目前的步數範圍
 * @param step 原始步驟
 * @returns 1–TOTAL_STEPS 之間的步驟
 */
function clampStep(step: number): number {
  return Math.min(Math.max(1, step), TOTAL_STEPS);
}

/**
 * @description 新手引導彈窗
 */
export class Onboarding {
  /**
   * @description 渲染單步內容
   * @param step 步驟 1–3
   * @returns HTML 字串
   */
  private static body(step: number): string {
    const p = ProfileService.get();
    const s = LifeClockService.calculate(p);
    if (step === 1) {
      return `<p class="ob-big">先來看看，你擁有的時間</p>
        <label class="field-label" for="ob-birth">你的生日（可略過）</label>
        <input class="field" type="date" id="ob-birth" data-input="ob:birth" max="${DateService.todayKey()}" value="${p.birthDate}" />
        <div class="ob-hint" id="ob-summers">你還有大約 <b class="num">${s.summersLeft}</b> 個夏天、<b class="num">${s.weekendsLeft.toLocaleString()}</b> 個週末。<br/>你想用它們做什麼？</div>`;
    }
    if (step === 2) {
      return `<label class="ob-big" for="ob-life">你覺得什麼樣的人生是有意義的？</label>
        <textarea class="textarea" id="ob-life" data-input="ob:life" placeholder="想到什麼寫什麼，之後都能改">${escapeHtml(p.compass.life)}</textarea>
        <p class="ob-hint">這是你的指南針。之後在「回顧」會回來問你：最近的行動，靠近它了嗎？</p>`;
    }
    return `<label class="ob-big" for="ob-activity">最近做了什麼？做完感覺如何？</label>
      <input class="field" id="ob-activity" placeholder="例如：和朋友聊天、畫畫、運動…" maxlength="60" />
      <label class="field-label" for="ob-energy">這件事帶給你的能量</label>
      <select class="field" id="ob-energy"><option value="">選擇感受</option>${ENERGY_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}</select>
      <p class="ob-hint">準備好了。每天花 30 秒記下這種時刻，幾週後你會看見自己的規律。</p>`;
  }

  /**
   * @description 渲染彈窗
   * @param rawStep 步驟
   * @returns HTML 字串
   */
  static render(rawStep: number): string {
    const step = clampStep(rawStep);
    const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => `<i class="${i < step ? 'is-on' : ''}"></i>`).join('');
    return `<div class="modal-overlay" id="onboarding"><div class="modal" role="dialog" aria-label="新手引導">
      <div class="ob-dots">${dots}</div>${this.body(step)}
      <div class="field-row" style="margin-top:18px">
        ${step > 1 ? '<button class="btn btn--ghost" data-action="ob:prev">上一步</button>' : ''}
        ${step < TOTAL_STEPS ? '<button class="btn btn--ghost" data-action="ob:skip">略過</button>' : '<button class="btn btn--ghost" data-action="ob:skip">先不記</button>'}
        <button class="btn btn--primary" style="flex:1" id="ob-next" data-action="ob:next">${step === TOTAL_STEPS ? '開始探索' : '下一步'}</button>
      </div></div></div>`;
  }

  /**
   * @description 完成引導：寫入設定與（選填的）第一筆紀錄
   * @param ctx 應用上下文
   * @param withEntry 是否保存第一筆紀錄
   * @returns 無
   */
  private static finish(ctx: AppContext, withEntry: boolean): void {
    const energyDraft = ctx.ui.drafts['ob-energy'];
    const energy = energyDraft === undefined || energyDraft === '' ? null : Number(energyDraft);
    const activity = ctx.ui.drafts['ob-activity']?.trim();
    if (withEntry && activity && !isEnergyLevel(energy)) {
      document.getElementById('ob-energy')?.focus();
      return ctx.toast('請選擇這件事帶給你的能量，或選「先不記」');
    }
    const entries = GoodTimeService.getAll();
    if (withEntry && activity && isEnergyLevel(energy)) entries.unshift({ id: createId('gt'), date: DateService.todayKey(),
      time: DateService.nowTime(), activity, energy, isFlow: false });
    const saved = StorageService.setMany([
      { key: STORAGE_KEYS.PROFILE, value: { ...ProfileService.get(), onboardingCompleted: true } },
      { key: STORAGE_KEYS.GOOD_TIMES, value: entries },
    ]);
    if (!saved) return ctx.toast('無法儲存，請再試一次');
    ctx.clearDraft('ob-activity', 'ob-energy');
    ctx.setUi({ onboardingStep: null, tab: 'today' });
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    const step = (): number => clampStep(ctx.ui.onboardingStep ?? 1);
    const compass = (patch: Partial<ReturnType<typeof ProfileService.get>['compass']>): void => {
      ProfileService.update({ compass: { ...ProfileService.get().compass, ...patch } });
    };
    return {
      actions: {
        'ob:prev': () => ctx.setUi({ onboardingStep: Math.max(1, step() - 1) }),
        'ob:skip': () => {
          if (step() === TOTAL_STEPS) return Onboarding.finish(ctx, false);
          ctx.setUi({ onboardingStep: step() + 1 });
        },
        'ob:next': () => {
          if (step() < TOTAL_STEPS) return ctx.setUi({ onboardingStep: step() + 1 });
          Onboarding.finish(ctx, true);
        },
      },
      inputs: {
        'ob:birth': (el) => {
          if (!el.value || el.value > DateService.todayKey()) return ctx.toast('生日需為今天或更早的日期');
          ProfileService.update({ birthDate: el.value });
          const s = LifeClockService.calculate(ProfileService.get());
          const box = document.getElementById('ob-summers');
          if (box) box.innerHTML = `你還有大約 <b class="num">${s.summersLeft}</b> 個夏天、<b class="num">${s.weekendsLeft.toLocaleString()}</b> 個週末。<br/>你想用它們做什麼？`;
        },
        'ob:life': (el) => compass({ life: el.value }),
      },
    };
  }
}
