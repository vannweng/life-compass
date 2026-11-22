/**
 * @description 回顧頁「從實驗走向目標」：哪些值得升級、哪些要推進、哪些是放下的收穫
 * @module components/ReviewPipeline
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import type { Experiment } from '../models/ExperimentModel';
import { ExperimentService } from '../services/ExperimentService';
import { PipelineService } from '../services/PipelineService';
import { escapeHtml } from '../services/TextService';
import { ActionSources } from './ActionSources';
import { dataOf } from './Dom';

/**
 * @description 實驗與目標串接卡
 */
export class ReviewPipeline {
  /**
   * @description 渲染一組區塊
   * @param label 標籤
   * @param rows 列 HTML
   * @returns HTML 字串；無內容時為空字串
   */
  private static group(label: string, rows: string[]): string {
    return rows.length ? `<div class="pipeline-group"><p class="context-label">${label}</p>${rows.join('')}</div>` : '';
  }

  /**
   * @description 渲染「放下」的實驗：不適合也是探索收穫
   * @param e 實驗
   * @returns HTML 字串
   */
  private static letGoRow(e: Experiment): string {
    const note = e.learnings.trim();
    return `<div class="pipeline-row"><div class="row__main"><b>${escapeHtml(e.title)}</b>
      <span class="card__sub">${note ? escapeHtml(note) : '試過之後，知道它不太適合你。'}</span></div></div>`;
  }

  /**
   * @description 渲染卡片
   * @returns HTML 字串
   */
  static render(): string {
    const s = PipelineService.summary();
    if (!s.experimentCount && !s.goalCount) {
      return `<section class="card review-pipeline" id="review-pipeline"><div class="card__head"><h3>從實驗走向目標</h3></div>
        <p class="card__sub">先用一個小實驗試試看。覺得值得，再升級成人生清單的目標。</p>
        <button class="link-btn" data-action="source:explore">去建立小實驗</button></section>`;
    }
    const promotable = s.promotable.map((e) => `<div class="pipeline-row"><div class="row__main"><b>${escapeHtml(e.title)}</b>
      <span class="card__sub">做完後你想繼續，要把它變成目標嗎？</span></div>
      <button class="btn btn--primary" data-action="pipe:promote" data-id="${e.id}">加入人生清單</button></div>`);
    const focus = s.focusGoals.map((g) => `<div class="pipeline-row"><div class="row__main"><b>${escapeHtml(g.title)}</b>${ActionSources.evidence('goal', g.id)}</div>
      <button class="btn btn--ghost" data-action="source:goal" data-id="${g.id}">今天做一步</button></div>`);
    const body = [
      this.group('值得升級成目標', promotable),
      this.group('本月聚焦的目標', focus),
      this.group('試過、決定放下的（這也是收穫）', s.letGo.map((e) => this.letGoRow(e))),
    ].join('');
    const empty = body || `<p class="card__sub">目前沒有需要你決定的事。繼續做小實驗，做完留下感受，這裡就會出現下一步。</p>
      ${s.goalCount ? '<button class="link-btn" data-action="source:show-goal">到人生清單選本月聚焦</button>' : ''}`;
    return `<section class="card review-pipeline" id="review-pipeline"><div class="card__head"><h3>從實驗走向目標</h3></div>${empty}</section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    return { actions: {
      'pipe:promote': (el) => {
        if (ExperimentService.promote(dataOf(el, 'id'))) ctx.toast('已加入人生清單，可以到「目標」選本月聚焦');
        ctx.refresh();
      },
    }, inputs: {} };
  }
}
