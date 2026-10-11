/** @description 在 UI 重繪後安全回填未送出的表單，不解析草稿 HTML。 */

/** @description 表單草稿的 DOM 呈現。 */
export class FormDrafts {
  /**
   * @description 回填可見欄位，選單僅接受現有選項
   * @param root 表單所在的應用根節點
   * @param drafts 欄位 ID 對應的草稿值
   * @returns 無
   */
  static restore(root: HTMLElement, drafts: Record<string, string>): void {
    const fields = root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input[id], textarea[id], select[id]');
    for (const field of fields) {
      const value = drafts[field.id];
      if (value === undefined) continue;
      if (field instanceof HTMLSelectElement && !Array.from(field.options).some((option: HTMLOptionElement): boolean => option.value === value)) continue;
      field.value = value;
    }
  }
}
