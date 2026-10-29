/** @description 從首頁時間卡進入的一生次頁。 */
import { LifeClockHero } from '../components/LifeClockHero';
import { LifeGrid } from '../components/LifeGrid';
import type { AppContext, Handlers } from '../models/AppContextModel';
import type { UserProfile } from '../models/ProfileModel';

/** @description 集中呈現剩餘時間，不占用主要導覽。 */
export class LifeView {
  /** @description 渲染一生頁。 @param profile 使用者設定 @returns HTML 字串 */
  static render(profile: UserProfile): string {
    return `<div class="view view--life" id="life-page" tabindex="-1">
      <div class="life-page__head"><button class="link-btn life-back" data-action="life:back">← 回到今天</button><h2>一生</h2></div>
      ${LifeClockHero.render(profile)}
      ${LifeGrid.renderGrid(profile)}
      <button class="btn btn--ghost btn--block life-goals" data-action="life:goals">看看我的人生清單</button>
      <p class="life-page__note">時間不是催促；只是提醒你，把今天留給真正重要的事。</p>
    </div>`;
  }

  /** @description 返回主要四分頁。 @param ctx 應用上下文 @returns 處理器集合 */
  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'life:back': () => ctx.setUi({ page: 'main', tab: 'today', scrollTarget: 'time-strip' }),
      'life:goals': () => ctx.setUi({ page: 'main', tab: 'goals', scrollTarget: 'goal-library' }),
    }, inputs: {} };
  }
}
