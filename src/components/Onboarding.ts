/**
 * @description 新手引導：時間感 → 羅盤 → 第一筆好時光 → 開始
 * @module components/Onboarding
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ENERGY_OPTIONS } from '../models/GoodTimeModel';
import { isEnergyLevel } from '../models/GoodTimeModel';
import { GoodTimeService } from '../services/GoodTimeService';
import { LifeClockService } from '../services/LifeClockService';
import { ProfileService } from '../services/ProfileService';
import { escapeHtml } from '../services/TextService';
import { valueOf } from './Dom';
import { STORAGE_KEYS, StorageService } from '../services/StorageService';
import { DateService } from '../services/DateService';
import { createId } from '../services/TextService';

/** @description 引導總步數 */
const TOTAL_STEPS = 5;

/**
 * @description 新手引導彈窗
 */
export class Onboarding {
  /**
   * @description 渲染單步內容
   * @param step 步驟 1–5
   * @returns HTML 字串
   */
  private static body(step: number): string {
    const p = ProfileService.get();
    const s = LifeClockService.calculate(p);
    if (step === 1) {
      return `<p class="ob-big">先來看看，你擁有的時間</p>
        <label class="field-label" for="ob-birth">你的生日</label>
        <input class="field" type="date" id="ob-birth" data-input="ob:birth" max="${DateService.todayKey()}" value="${p.birthDate}" />
        <div class="ob-hint" id="ob-summers">你還有大約 <b class="num">${s.summersLeft}</b> 個夏天、<b class="num">${s.weekendsLeft.toLocaleString()}</b> 個週末。<br/>你想用它們做什麼？</div>`;
    }
    if (step === 2) {
      return `<label class="ob-big" for="ob-life">你覺得什麼樣的人生是有意義的？</label>
        <textarea class="textarea" id="ob-life" data-input="ob:life" placeholder="想到什麼寫什麼，之後都能改">${escapeHtml(p.compass.life)}</textarea>`;
    }
    if (step === 3) {
      return `<label class="ob-big" for="ob-work">工作對你代表什麼？</label>
        <textarea class="textarea" id="ob-work" data-input="ob:work" placeholder="錢、成就感、自由、被需要…">${escapeHtml(p.compass.work)}</textarea>`;
    }
    if (step === 4) {
      return `<label class="ob-big" for="ob-activity">最近做了什麼？做完感覺如何？</label>
        <input class="field" id="ob-activity" placeholder="例如：和朋友聊天、畫畫、運動…" maxlength="60" />
        <label class="field-label" for="ob-energy">這件事帶給你的能量</label>
        <select class="field" id="ob-energy"><option value="">選擇感受</option>${ENERGY_OPTIONS.map((option) => `<option value="${option.value}">${option.label}</option>`).join('')}</select>
        <p class="ob-hint">每天花 30 秒記下這種時刻，幾週後你會看見自己的規律。</p>`;
    }
    return `<p class="ob-big">最後，怎麼稱呼你？</p>
      <input class="field" id="ob-name" data-input="ob:name" aria-label="名字（必填）" aria-describedby="ob-name-error" placeholder="例如：K寶" required data-enter-action="ob:next" maxlength="12" />
      <p id="ob-name-error" role="alert" hidden style="color:var(--danger);margin-top:8px">請填寫名字</p>
      <p class="ob-hint">準備好了。從「今天」開始，每天只要 30 秒。</p>`;
  }

  /**
   * @description 渲染彈窗
   * @param step 步驟
   * @returns HTML 字串
   */
  static render(step: number): string {
    const dots = Array.from({ length: TOTAL_STEPS }, (_, i) => `<i class="${i < step ? 'is-on' : ''}"></i>`).join('');
    return `<div class="modal-overlay" id="onboarding"><div class="modal" role="dialog" aria-label="新手引導">
      <div class="ob-dots">${dots}</div>${this.body(step)}
      <div class="field-row" style="margin-top:18px">
        ${step > 1 ? '<button class="btn btn--ghost" data-action="ob:prev">上一步</button>' : ''}
        ${step >= 2 && step <= 4 ? '<button class="btn btn--ghost" data-action="ob:skip">略過</button>' : ''}
        <button class="btn btn--primary" style="flex:1" id="ob-next" data-action="ob:next">${step === TOTAL_STEPS ? '開始探索' : '下一步'}</button>
      </div></div></div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    const step = (): number => ctx.ui.onboardingStep ?? 1;
    const compass = (patch: Partial<ReturnType<typeof ProfileService.get>['compass']>): void => {
      ProfileService.update({ compass: { ...ProfileService.get().compass, ...patch } });
    };
    return {
      actions: {
        'ob:prev': () => ctx.setUi({ onboardingStep: Math.max(1, step() - 1) }),
        'ob:skip': () => {
          if (step() === 4) ctx.clearDraft('ob-activity', 'ob-energy');
          ctx.setUi({ onboardingStep: Math.min(TOTAL_STEPS, step() + 1) });
        },
        'ob:next': () => {
          const energyDraft = ctx.ui.drafts['ob-energy'];
          const energy = energyDraft === undefined || energyDraft === '' ? null : Number(energyDraft);
          if (step() === 4 && valueOf('ob-activity') && !isEnergyLevel(energy)) {
            document.getElementById('ob-energy')?.focus();
            return ctx.toast('請選擇這件事帶給你的能量，或略過這一步');
          }
          if (step() < TOTAL_STEPS) return ctx.setUi({ onboardingStep: step() + 1 });
          const name = valueOf('ob-name').trim();
          if (!name) {
            const field = document.getElementById('ob-name');
            const error = document.getElementById('ob-name-error');
            field?.setAttribute('aria-invalid', 'true');
            if (error) error.hidden = false;
            field?.focus();
            return;
          }
          const activity = ctx.ui.drafts['ob-activity']?.trim();
          const entries = GoodTimeService.getAll();
          if (activity && !isEnergyLevel(energy)) {
            ctx.setUi({ onboardingStep: 4 });
            return ctx.toast('請補選這件事帶給你的能量');
          }
          if (activity && isEnergyLevel(energy)) entries.unshift({ id: createId('gt'), date: DateService.todayKey(),
            time: DateService.nowTime(), activity, energy, isFlow: false });
          const saved = StorageService.setMany([
            { key: STORAGE_KEYS.PROFILE, value: { ...ProfileService.get(), name, onboardingCompleted: true } },
            { key: STORAGE_KEYS.GOOD_TIMES, value: entries },
          ]);
          if (!saved) return ctx.toast('無法儲存，請再試一次');
          ctx.clearDraft('ob-name', 'ob-activity', 'ob-energy');
          ctx.setUi({ onboardingStep: null, tab: 'today' });
        },
      },
      inputs: {
        'ob:name': (el) => {
          el.removeAttribute('aria-invalid');
          const error = document.getElementById('ob-name-error');
          if (error) error.hidden = true;
        },
        'ob:birth': (el) => {
          if (!el.value || el.value > DateService.todayKey()) return ctx.toast('生日需為今天或更早的日期');
          ProfileService.update({ birthDate: el.value });
          const s = LifeClockService.calculate(ProfileService.get());
          const box = document.getElementById('ob-summers');
          if (box) box.innerHTML = `你還有大約 <b class="num">${s.summersLeft}</b> 個夏天、<b class="num">${s.weekendsLeft.toLocaleString()}</b> 個週末。<br/>你想用它們做什麼？`;
        },
        'ob:life': (el) => compass({ life: el.value }),
        'ob:work': (el) => compass({ work: el.value }),
      },
    };
  }
}
