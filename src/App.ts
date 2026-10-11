/**
 * @description 應用程式外殼：狀態、渲染、事件委派、即時秒數
 * @module App
 */

import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { Onboarding } from './components/Onboarding';
import { ProfileModal } from './components/ProfileModal';
import { FormDrafts } from './components/FormDrafts';
import { mergeHandlers, type AppContext, type FieldElement, type Handlers, type UiState } from './models/AppContextModel';
import { DateService } from './services/DateService';
import { LifeClockService } from './services/LifeClockService';
import { MigrationService } from './services/MigrationService';
import { ProfileService } from './services/ProfileService';
import { AppMemoryService } from './services/AppMemoryService';
import { ExploreView } from './views/ExploreView';
import { GoalsView } from './views/GoalsView';
import { ReviewView } from './views/ReviewView';
import { TodayView } from './views/TodayView';

/**
 * @description 判斷事件目標是否為表單元素
 * @param t 事件目標
 * @returns 是否為 FieldElement
 */
function isField(t: EventTarget | null): t is FieldElement {
  return t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement;
}

/**
 * @description 應用程式主類別
 */
export class App {
  private readonly root: HTMLElement;
  private handlers: Handlers = { actions: {}, inputs: {} };
  private toastTimer = 0;
  private readonly ctx: AppContext;

  /**
   * @description 建立應用程式
   * @param root 掛載節點
   */
  constructor(root: HTMLElement) {
    this.root = root;
    const profile = ProfileService.get();
    const memory = AppMemoryService.load();
    const ui: UiState = {
      tab: 'today', goalStatusFilter: 'all', goalCategoryFilter: 'all', odysseyType: 'current',
      calendarMonth: DateService.monthKey(), selectedDate: DateService.todayKey(),
      showProfile: false, onboardingStep: profile.onboardingCompleted ? null : 1,
      draftEnergy: 0, draftFlow: false, showExperimentForm: false, experimentPreset: '',
      drafts: {}, scrollTarget: null,
      ...memory,
    };
    ui.onboardingStep = profile.onboardingCompleted ? null : memory.onboardingStep ?? 1;
    this.ctx = {
      ui,
      setUi: (patch) => { Object.assign(this.ctx.ui, patch); this.render(); },
      refresh: () => this.render(),
      toast: (m) => this.showToast(m),
      clearDraft: (...ids: string[]): void => {
        for (const id of ids) delete ui.drafts[id];
        AppMemoryService.save(ui);
      },
    };
  }

  /**
   * @description 啟動：遷移舊資料、套用主題、綁定事件、渲染
   * @returns 無
   */
  start(): void {
    MigrationService.runOnce();
    ProfileService.applyTheme(ProfileService.get().theme);
    this.root.addEventListener('click', (e) => this.onClick(e));
    this.root.addEventListener('input', (e) => this.onInput(e));
    this.render();
    window.setInterval(() => this.tickSeconds(), 1000);
  }

  /**
   * @description 處理委派點擊
   * @param e 點擊事件
   * @returns 無
   */
  private onClick(e: MouseEvent): void {
    const target = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-action]') : null;
    const name = target?.dataset['action'];
    if (target && name) {
      this.handlers.actions[name]?.(target);
      AppMemoryService.save(this.ctx.ui);
    }
  }

  /**
   * @description 處理委派輸入（不重繪，避免失去焦點）
   * @param e 輸入事件
   * @returns 無
   */
  private onInput(e: Event): void {
    if (!isField(e.target)) return;
    AppMemoryService.rememberDraft(this.ctx.ui, e.target.id, e.target.value);
    const name = e.target.dataset['input'];
    if (name) this.handlers.inputs[name]?.(e.target);
    AppMemoryService.save(this.ctx.ui);
  }

  /**
   * @description 每秒更新所有即時秒數
   * @returns 無
   */
  private tickSeconds(): void {
    const text = LifeClockService.secondsLeft(ProfileService.get()).toLocaleString();
    this.root.querySelectorAll('[data-live="seconds"]').forEach((n) => { n.textContent = text; });
  }

  /**
   * @description 顯示提示
   * @param message 訊息
   * @returns 無
   */
  private showToast(message: string): void {
    document.querySelector('.toast')?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => el.remove(), 2200);
  }

  /**
   * @description 渲染整個畫面並重建事件處理表（保留捲動位置與焦點）
   * @returns 無
   */
  private render(): void {
    const { ui } = this.ctx;
    const profile = ProfileService.get();
    const y = window.scrollY;
    const focused = document.activeElement;
    const focusId = isField(focused) ? focused.id : '';
    const view = { today: TodayView, explore: ExploreView, goals: GoalsView, review: ReviewView }[ui.tab];
    const body = ui.tab === 'explore' ? ExploreView.render(this.ctx) : view.render(this.ctx, profile);
    this.root.innerHTML = `${Header.render(profile)}<main>${body}</main>${BottomNav.render(ui.tab)}
      ${ui.showProfile ? ProfileModal.render(profile) : ''}${ui.onboardingStep ? Onboarding.render(ui.onboardingStep) : ''}`;
    this.handlers = mergeHandlers(
      Header.handlers(this.ctx), BottomNav.handlers(this.ctx), view.handlers(this.ctx),
      ProfileModal.handlers(this.ctx), Onboarding.handlers(this.ctx),
    );
    FormDrafts.restore(this.root, ui.drafts);
    AppMemoryService.save(ui);
    const target = ui.scrollTarget ? document.getElementById(ui.scrollTarget) : null;
    ui.scrollTarget = null;
    if (target) {
      target.scrollIntoView({ block: 'start' });
      target.focus({ preventScroll: true });
    } else {
      window.scrollTo(0, y);
      if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
    }
  }
}
