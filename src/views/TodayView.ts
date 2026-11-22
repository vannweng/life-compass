/**
 * @description 今天分頁視圖：時間條 → 每日一問 → 心情隨筆 → 好時光 → 行動
 * @module views/TodayView
 */

import { NextStepGuide } from '../components/NextStepGuide';
import { MoodNoteCard } from '../components/MoodNoteCard';
import { TimeStrip } from '../components/TimeStrip';
import { TodayActions } from '../components/TodayActions';
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';
import { DateService } from '../services/DateService';
import { GoodTimeService } from '../services/GoodTimeService';
import { ENERGY_OPTIONS } from '../models/GoodTimeModel';
import { escapeHtml } from '../services/TextService';

/**
 * @description 今天分頁
 */
export class TodayView {
  /**
   * @description 渲染視圖
   * @param ctx 應用上下文
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(ctx: AppContext, profile: UserProfile): string {
    const date = DateService.todayKey();
    const clues = GoodTimeService.recent(7).slice(0, 3);
    return `<div class="view" id="view-today">
      ${NextStepGuide.render()}
      ${TimeStrip.render(profile)}
      ${TodayActions.render(date, ctx)}
      <aside class="today-context">
        <section class="today-clues">
          <h3>最近能量紀錄</h3>
          ${clues.length ? `<ul>${clues.map((entry) => `<li>
            <span>${escapeHtml(entry.activity)}</span>
            <span class="row__meta">${ENERGY_OPTIONS.find((option) => option.value === entry.energy)?.label ?? ''}</span>
          </li>`).join('')}</ul>` : '<p class="muted">記下一件事和做完的感受，這裡就會顯示你的能量紀錄。</p>'}
        </section>
        ${MoodNoteCard.render(date)}
      </aside>
    </div>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(
      NextStepGuide.handlers(ctx),
      TimeStrip.handlers(ctx),
      MoodNoteCard.handlers(ctx),
      TodayActions.handlers(ctx),
    );
  }
}
