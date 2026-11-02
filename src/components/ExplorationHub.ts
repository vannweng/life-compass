/** @description 把能量線索、待試點子與小實驗串成同一張探索卡。 */
import { mergeHandlers, type AppContext, type Handlers } from '../models/AppContextModel';
import { EnergyInsight } from './EnergyInsight';
import { ExperimentList } from './ExperimentList';
import { IdeaInbox } from './IdeaInbox';

/** @description 探索主卡：發現線索、收下點子、實際試一步。 */
export class ExplorationHub {
  /** @description 渲染探索主卡。 @param ctx 應用上下文 @returns HTML 字串 */
  static render(ctx: AppContext): string {
    return `<section class="card exploration-hub" id="exploration-hub" tabindex="-1">
      <div class="card__head"><h3>探索自己</h3></div>
      ${EnergyInsight.renderSummary()}
      ${IdeaInbox.renderComposer()}
      ${ExperimentList.renderContent()}
      ${IdeaInbox.renderList(ctx)}
    </section>`;
  }

  /** @description 合併探索流程的事件。 @param ctx 應用上下文 @returns 處理器集合 */
  static handlers(ctx: AppContext): Handlers {
    return mergeHandlers(EnergyInsight.handlers(ctx), IdeaInbox.handlers(ctx), ExperimentList.handlers(ctx));
  }
}
