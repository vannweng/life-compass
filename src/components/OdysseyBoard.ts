/**
 * @description 奧德賽計畫：三種平行人生（空白模板 + 引導提問）
 * @module components/OdysseyBoard
 */

import type { AppContext, Handlers } from '../models/AppContextModel';
import { ODYSSEY_TEMPLATES, ODYSSEY_YEAR_PROMPTS } from '../models/OdysseyModel';
import { ReflectionService } from '../services/ReflectionService';
import { IdeaService } from '../services/IdeaService';
import { escapeHtml } from '../services/TextService';
import { dataOf } from './Dom';
import { OdysseyClues } from './OdysseyClues';
import { OdysseyGuided, isEmptyPlan } from './OdysseyGuided';
import { renderOdysseyRating } from './OdysseyRating';

/** @description 可編輯的文字欄位 */
type OdysseyField = 'title' | 'year1' | 'year3' | 'year5';
/**
 * @description 判斷是否為文字欄位
 * @param v 字串
 * @returns 是否為 OdysseyField
 */
function isField(v: string): v is OdysseyField {
  return v === 'title' || v === 'year1' || v === 'year3' || v === 'year5';
}

/**
 * @description 奧德賽計畫看板
 */
export class OdysseyBoard {
  /**
   * @description 渲染看板
   * @param ctx 應用上下文
   * @returns HTML 字串
   */
  static render(ctx: AppContext): string {
    const type = ctx.ui.odysseyType;
    const tpl = ODYSSEY_TEMPLATES.find((t) => t.type === type) ?? ODYSSEY_TEMPLATES[0];
    const plan = ReflectionService.getOdyssey()[type];
    if (!tpl) return '';
    const tabs = ODYSSEY_TEMPLATES.map((t) => `<button class="btn btn--ghost odyssey-tab ${t.type === type ? 'is-active' : ''}" data-action="odyssey:tab" data-type="${t.type}" aria-pressed="${t.type === type}">${t.label}</button>`).join('');
    const years = (['year1', 'year3', 'year5'] as const).map((k) => `
      <label class="field-label" for="od-${k}">${ODYSSEY_YEAR_PROMPTS[k]}</label>
      <textarea class="textarea" id="od-${k}" style="min-height:64px" data-input="odyssey:${k}">${escapeHtml(plan[k])}</textarea>`).join('');
    const full = `<p style="font-weight:700;margin-bottom:8px">${tpl.guide}</p>
      <input class="field" id="od-title" data-input="odyssey:title" placeholder="${tpl.placeholder}" value="${escapeHtml(plan.title)}" />
      <button class="link-btn odyssey-save-idea" data-action="odyssey:idea">存成待試點子</button>
      ${years}${renderOdysseyRating(plan, 'like', '這個人生我有多喜歡？')}${renderOdysseyRating(plan, 'confidence', '我有多大信心做到？')}`;
    const step = ctx.ui.odysseyStep;
    const content = step !== null ? OdysseyGuided.step(step, plan, tpl) : isEmptyPlan(plan) ? OdysseyGuided.intro(tpl) : full;
    return `${OdysseyClues.render()}<section class="card" id="odyssey-board">
      <div class="card__head"><h3>三種人生</h3></div>
      <div class="odyssey-tabs">${tabs}</div>
      ${content}
    </section>`;
  }

  /**
   * @description 事件處理
   * @param ctx 應用上下文
   * @returns 處理器集合
   */
  static handlers(ctx: AppContext): Handlers {
    const inputs: Handlers['inputs'] = {};
    (['title', 'year1', 'year3', 'year5'] as const).forEach((k) => {
      inputs[`odyssey:${k}`] = (el) => {
        if (isField(k)) ReflectionService.updateOdyssey(ctx.ui.odysseyType, { [k]: el.value });
      };
    });
    return {
      actions: {
        ...OdysseyGuided.handlers(ctx).actions,
        'odyssey:tab': (el) => {
          const t = dataOf(el, 'type');
          if (t === 'current' || t === 'pivot' || t === 'wild') ctx.setUi({ odysseyType: t, odysseyStep: null });
        },
        'odyssey:rate': (el) => {
          const key = dataOf(el, 'key');
          if (key !== 'like' && key !== 'confidence') return;
          ReflectionService.updateOdyssey(ctx.ui.odysseyType, { [key]: Number(dataOf(el, 'value')) });
          ctx.refresh();
        },
        'odyssey:idea': () => {
          const title = ReflectionService.getOdyssey()[ctx.ui.odysseyType].title.trim();
          if (!title) return ctx.toast('先替這種人生寫一個名稱');
          IdeaService.add(title, 'odyssey');
          ctx.setUi({ exploreSection: 'explore', scrollTarget: 'idea-inbox' });
          ctx.toast('已放進待試點子');
        },
      },
      inputs,
    };
  }
}
