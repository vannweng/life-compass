/** @description 待試點子：低負擔記錄，一鍵轉成小實驗。 */
import type { AppContext, Handlers } from '../models/AppContextModel';
import { IdeaService } from '../services/IdeaService';
import { escapeHtml } from '../services/TextService';
import { ICONS, dataOf, icon, valueOf } from './Dom';

/** @description 顯示並操作尚未確定的探索點子。 */
export class IdeaInbox {
  /** @description 渲染探索卡唯一的新增入口。 @returns HTML 字串 */
  static renderComposer(): string {
    return `<div class="idea-add"><input class="field" id="idea-title" data-enter-action="idea:add" placeholder="最近有點想試什麼？" maxlength="80" />
      <button class="btn btn--primary" data-action="idea:add">記下</button></div>`;
  }

  /** @description 渲染仍待嘗試的點子。 @param ctx 應用上下文 @returns HTML 字串 */
  static renderList(ctx: AppContext): string {
    const ideas = IdeaService.open();
    const rows = ideas.map((idea) => {
      const confirming = ctx.ui.activeIdeaId === idea.id;
      const step = ctx.ui.drafts['idea-step'] ?? IdeaService.suggestStep(idea.title);
      return `<div class="idea-row" data-key="${idea.id}">
      <div class="row idea-row__main"><div class="row__main"><div class="row__title">${escapeHtml(idea.title)}</div>
        <div class="row__meta">${idea.source === 'odyssey' ? '來自三種可能的人生' : '還沒確定，先保留'}</div></div>
      ${confirming ? '' : `<button class="btn btn--primary" data-action="idea:prepare" data-id="${idea.id}">試試看</button>
      <button class="btn btn--ghost bare-delete-btn" data-action="idea:remove" data-id="${idea.id}" aria-label="刪除">${icon(ICONS.trash, 16)}</button>`}</div>
      ${confirming ? `<div class="idea-step-confirm"><label class="field-label" for="idea-step">今天先做哪一步？</label>
        <div class="idea-step-confirm__line"><input class="field" id="idea-step" data-enter-action="idea:start" value="${escapeHtml(step)}" maxlength="120" />
          <button class="btn btn--primary" data-action="idea:start" data-id="${idea.id}">開始</button>
          <button class="mini-btn mini-btn--plain" data-action="idea:cancel" aria-label="取消">${icon(ICONS.close, 16)}</button></div></div>` : ''}
    </div>`;
    }).join('');
    return `<div class="exploration-block exploration-ideas" id="idea-inbox" tabindex="-1">
      <div class="exploration-block__head"><p class="eyebrow">先放著的點子</p>${ideas.length ? `<span class="tag">${ideas.length}</span>` : ''}</div>
      ${rows || '<p class="exploration-empty">有新的好奇時，先寫名稱就好。</p>'}
    </div>`;
  }

  /** @description 提供新增、確認第一步與刪除事件。 @param ctx 應用上下文 @returns 處理器集合 */
  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'idea:add': () => {
        const title = valueOf('idea-title');
        if (!title) return ctx.toast('先寫下一個想試的點子');
        IdeaService.add(title);
        ctx.clearDraft('idea-title');
        ctx.refresh();
      },
      'idea:prepare': (el) => {
        const id = dataOf(el, 'id');
        const idea = IdeaService.open().find((item) => item.id === id);
        if (!idea) return;
        ctx.clearDraft('idea-step');
        ctx.ui.drafts['idea-step'] = IdeaService.suggestStep(idea.title);
        ctx.setUi({ activeIdeaId: id });
      },
      'idea:cancel': () => {
        ctx.clearDraft('idea-step');
        ctx.setUi({ activeIdeaId: null });
      },
      'idea:start': (el) => {
        const id = dataOf(el, 'id') || ctx.ui.activeIdeaId;
        if (!id) return;
        const result = IdeaService.startExperiment(id, valueOf('idea-step'));
        if (!result) return;
        ctx.clearDraft('idea-step');
        ctx.setUi({ page: 'main', tab: 'today', activeIdeaId: null, scrollTarget: `action-${result.actionId}` });
        ctx.toast('已建立小實驗，今天先做這一步');
      },
      'idea:remove': (el) => {
        const id = dataOf(el, 'id');
        IdeaService.remove(id);
        if (ctx.ui.activeIdeaId === id) ctx.clearDraft('idea-step');
        ctx.setUi({ activeIdeaId: ctx.ui.activeIdeaId === id ? null : ctx.ui.activeIdeaId });
      },
    }, inputs: {} };
  }
}
