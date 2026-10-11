/**
 * @description 新手引導：時間感 → 羅盤 → 第一筆好時光 → 開始
 * @module components/Onboarding
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ENERGY_OPTIONS } from '../models/GoodTimeModel';
import { GoodTimeService } from '../services/GoodTimeService';
import { LifeClockService } from '../services/LifeClockService';
import { ProfileService } from '../services/ProfileService';
import { escapeHtml } from '../services/TextService';
import { valueOf } from './Dom';

/** @description 引導總步數 */
const TOTAL_STEPS = 4;

/**
 * @description 新手引導彈窗
 */
export class Onboarding {
  /**
   * @description 渲染單步內容
   * @param step 步驟 1–4
   * @returns HTML 字串
   */
  private static body(step: number): string {
    const p = ProfileService.get();
    const s = LifeClockService.calculate(p);
    if (step === 1) {
      return `<p class="ob-big">先來看看，你擁有的時間</p>
        <label class="field-label" for="ob-birth">你的生日</label>
        <input class="field" type="date" id="ob-birth" data-input="ob:birth" value="${p.birthDate}" />
        <div class="ob-hint" id="ob-summers">你還有大約 <b class="num">${s.summersLeft}</b> 個夏天、<b class="num">${s.weekendsLeft.toLocaleString()}</b> 個週末。<br/>你想用它們做什麼？</div>`;
    }
    if (step === 2) {
      return `<p class="ob-big">兩個小問題，幫你找方向</p>
        <label class="field-label" for="ob-life">你覺得什麼樣的人生是有意義的？</label>
        <textarea class="textarea" id="ob-life" data-input="ob:life" placeholder="想到什麼寫什麼，之後都能改">${escapeHtml(p.compass.life)}</textarea>
        <label class="field-label" for="ob-work">你為什麼工作？工作對你代表什麼？</label>
        <textarea class="textarea" id="ob-work" data-input="ob:work" placeholder="錢、成就感、自由、被需要…">${escapeHtml(p.compass.work)}</textarea>`;
    }
    if (step === 3) {
      return `<p class="ob-big">最近一次覺得很有活力，是在做什麼？</p>
        <input class="field" id="ob-activity" placeholder="例如：和朋友聊天、畫畫、運動…" maxlength="60" />
        <p class="ob-hint">每天花 30 秒記下這種時刻，幾週後你會看見自己的規律。</p>`;
    }
    return `<p class="ob-big">最後，怎麼稱呼你？</p>
      <input class="field" id="ob-name" value="${escapeHtml(p.name)}" maxlength="12" />
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
        'ob:next': () => {
          if (step() === 3 && valueOf('ob-activity')) {
            GoodTimeService.add(valueOf('ob-activity'), ENERGY_OPTIONS[4]?.value ?? 2, false);
            ctx.clearDraft('ob-activity');
          }
          if (step() < TOTAL_STEPS) return ctx.setUi({ onboardingStep: step() + 1 });
          ProfileService.update({ name: valueOf('ob-name') || '探索者', onboardingCompleted: true });
          ctx.clearDraft('ob-name');
          ctx.setUi({ onboardingStep: null, tab: 'today' });
        },
      },
      inputs: {
        'ob:birth': (el) => {
          if (!el.value) return;
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
