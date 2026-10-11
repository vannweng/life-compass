/**
 * @description 個人中心：完整餘生時鐘、基本設定、主題、羅盤
 * @module components/ProfileModal
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import type { ThemeMode, UserProfile } from '../models/ProfileModel';
import { LifeClockService } from '../services/LifeClockService';
import { ProfileService } from '../services/ProfileService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon, valueOf } from './Dom';

/** @description 主題選項 */
const THEMES: ReadonlyArray<{ id: ThemeMode; label: string }> = [
  { id: 'dark', label: '深色' }, { id: 'light', label: '淺色' }, { id: 'system', label: '跟隨系統' },
];

/**
 * @description 個人中心彈窗
 */
export class ProfileModal {
  /**
   * @description 渲染彈窗
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(profile: UserProfile): string {
    const s = LifeClockService.calculate(profile);
    const themes = THEMES.map((t) => `<button class="${profile.theme === t.id ? 'is-active' : ''}" data-action="profile:theme" data-id="${t.id}">${t.label}</button>`).join('');
    return `<div class="modal-overlay" id="profile-modal"><div class="modal" role="dialog" aria-label="個人中心">
      <div class="modal__head"><h2>個人中心</h2><button class="icon-btn icon-btn--plain" data-action="profile:close" aria-label="關閉">${icon(ICONS.close)}</button></div>
      <div class="card" style="margin-bottom:12px"><p class="eyebrow">餘生時鐘</p>
        <p class="num" style="font-size:30px;font-weight:800;color:var(--warm)" data-live="seconds">${LifeClockService.secondsLeft(profile).toLocaleString()}</p>
        <p class="muted" style="font-size:13px">秒 ≈ ${s.daysLeft.toLocaleString()} 天 ≈ ${s.summersLeft} 個夏天</p></div>
      <label class="field-label" for="pf-name">暱稱</label>
      <input class="field" id="pf-name" data-input="profile:name" value="${escapeHtml(profile.name)}" maxlength="12" />
      <label class="field-label" for="pf-birth">出生日期</label>
      <input class="field" type="date" id="pf-birth" data-input="profile:birth" value="${profile.birthDate}" />
      <label class="field-label" for="pf-age">預期壽命：<b class="num" id="pf-age-val">${profile.expectedAge}</b> 歲</label>
      <input type="range" id="pf-age" data-input="profile:age" min="60" max="100" value="${profile.expectedAge}" style="width:100%;accent-color:var(--accent)" />
      <label class="field-label">外觀</label><div class="seg">${themes}</div>
      <label class="field-label" for="pf-life">我的人生觀</label>
      <textarea class="textarea" id="pf-life" data-input="profile:life" placeholder="你覺得什麼樣的人生是有意義的？">${escapeHtml(profile.compass.life)}</textarea>
      <label class="field-label" for="pf-work">我的工作觀</label>
      <textarea class="textarea" id="pf-work" data-input="profile:work" placeholder="你為什麼工作？工作對你代表什麼？">${escapeHtml(profile.compass.work)}</textarea>
      <button class="btn btn--primary btn--block" style="margin-top:16px" data-action="profile:close">完成</button></div></div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    const compass = (patch: Partial<UserProfile['compass']>): void => {
      ProfileService.update({ compass: { ...ProfileService.get().compass, ...patch } });
    };
    return {
      actions: {
        'profile:close': () => ctx.setUi({ showProfile: false }),
        'profile:theme': (el) => {
          const id = dataOf(el, 'id');
          const theme: ThemeMode = id === 'light' || id === 'system' ? id : 'dark';
          ProfileService.update({ theme });
          ProfileService.applyTheme(theme);
          ctx.refresh();
        },
      },
      inputs: {
        'profile:name': (el) => { ProfileService.update({ name: el.value.trim() || '探索者' }); },
        'profile:birth': (el) => { if (el.value) { ProfileService.update({ birthDate: el.value }); ctx.refresh(); } },
        'profile:age': (el) => {
          ProfileService.update({ expectedAge: Number(el.value) });
          const label = document.getElementById('pf-age-val');
          if (label) label.textContent = el.value;
        },
        'profile:life': (el) => compass({ life: el.value }),
        'profile:work': (el) => compass({ work: el.value }),
      },
    };
  }
}

/** @description 供其他模組讀取輸入值（保持匯出以利測試） */
export { valueOf as readField };
