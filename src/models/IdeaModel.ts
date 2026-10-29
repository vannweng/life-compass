/** @description 尚未確定、想先保留或試試的探索點子。 */

/** @description 點子來源。 */
export type IdeaSource = 'manual' | 'odyssey';

/** @description 點子在探索流程中的狀態。 */
export type IdeaStatus = 'open' | 'testing';

/** @description 待試點子資料。 */
export interface Idea {
  id: string;
  title: string;
  source: IdeaSource;
  status: IdeaStatus;
  experimentId: string | null;
  createdAt: string;
}
