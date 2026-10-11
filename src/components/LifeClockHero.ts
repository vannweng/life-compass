/**
 * @description 目標頁頂部餘生時鐘：把「剩餘時間」與「清單上還沒做的事」連在一起
 * @module components/LifeClockHero
 */

import type { UserProfile } from '../models/ProfileModel';
import { GoalService } from '../services/GoalService';
import { LifeClockService } from '../services/LifeClockService';

/**
 * @description 餘生時鐘 Hero
 */
export class LifeClockHero {
  /**
   * @description 渲染 Hero
   * @param profile 使用者設定
   * @returns HTML 字串
   */
  static render(profile: UserProfile): string {
    const s = LifeClockService.calculate(profile);
    const goals = GoalService.getAll();
    const todo = goals.filter((g) => g.status !== 'done').length;
    const done = goals.length - todo;
    const perSummer = todo > 0 ? Math.max(1, Math.ceil(todo / Math.max(1, s.summersLeft))) : 0;
    const msg = goals.length === 0
      ? '先記錄幾天日常，方向會慢慢浮現。'
      : todo === 0 ? '清單完成了，寫下下一個願望吧。'
      : `清單剩 <b>${todo}</b> 件，每個夏天完成 <b>${perSummer}</b> 件就好。`;
    return `
      <section class="card clock-hero" id="life-clock-hero">
        <div class="clock-hero__headline"><span>你還有</span><b class="num">${s.summersLeft}</b><span>個夏天</span></div>
        <p class="clock-hero__msg">${msg}</p>
        <div class="clock-hero__stats">
          <div class="stat"><b>${s.weekendsLeft.toLocaleString()}</b><span>個週末</span></div>
          <div class="stat"><b>${s.worldCupsLeft}</b><span>屆世界盃</span></div>
          <div class="stat"><b>${done}</b><span>已完成目標</span></div>
        </div>
      </section>`;
  }
}
