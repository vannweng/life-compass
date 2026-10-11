/** @description 比對新舊畫面，只更新變動的 DOM 節點。 */
export class DomReconciler {
  /**
   * @description 將 HTML 套用到既有根節點，保留未變動的元素與焦點
   * @param root 目前畫面的根節點
   * @param html 下一個畫面的 HTML
   * @returns 無
   */
  static update(root: HTMLElement, html: string): void {
    const template = document.createElement('template');
    template.innerHTML = html;
    this.updateChildren(root, template.content);
  }

  /**
   * @description 取得元素的穩定識別碼
   * @param node 待檢查節點
   * @returns 識別碼，或無識別碼時的 null
   */
  private static key(node: Node): string | null {
    if (!(node instanceof Element)) return null;
    if (node.id) return `id:${node.id}`;
    const key = node.getAttribute('data-key');
    return key ? `key:${key}` : null;
  }

  /**
   * @description 判斷兩節點能否沿用同一個 DOM 實體
   * @param current 現有節點
   * @param next 新畫面節點
   * @returns 是否可沿用
   */
  private static matches(current: Node, next: Node): boolean {
    if (current.nodeType !== next.nodeType) return false;
    if (current instanceof Element && next instanceof Element) {
      return current.tagName === next.tagName && this.key(current) === this.key(next);
    }
    return true;
  }

  /**
   * @description 同步元素屬性與表單當前值
   * @param current 現有元素
   * @param next 新畫面元素
   * @returns 無
   */
  private static updateElement(current: Element, next: Element): void {
    for (const attr of Array.from(current.attributes)) {
      if (!next.hasAttribute(attr.name)) current.removeAttribute(attr.name);
    }
    for (const attr of Array.from(next.attributes)) {
      if (current.getAttribute(attr.name) !== attr.value) current.setAttribute(attr.name, attr.value);
    }
    this.updateChildren(current, next);
    if (current instanceof HTMLInputElement && next instanceof HTMLInputElement) {
      if (current.value !== next.value) current.value = next.value;
      if (current.checked !== next.checked) current.checked = next.checked;
    } else if (current instanceof HTMLTextAreaElement && next instanceof HTMLTextAreaElement) {
      if (current.value !== next.value) current.value = next.value;
    } else if (current instanceof HTMLSelectElement && next instanceof HTMLSelectElement) {
      if (current.value !== next.value) current.value = next.value;
    }
  }

  /**
   * @description 比對節點文字或其子元素
   * @param current 現有節點
   * @param next 新畫面節點
   * @returns 無
   */
  private static updateNode(current: Node, next: Node): void {
    if (current instanceof Element && next instanceof Element) {
      this.updateElement(current, next);
    } else if (current.nodeValue !== next.nodeValue) {
      current.nodeValue = next.nodeValue;
    }
  }

  /**
   * @description 按順序調和子節點；有 ID 的元素可跨位置沿用
   * @param current 現有父節點
   * @param next 新畫面父節點
   * @returns 無
   */
  private static updateChildren(current: Node, next: Node): void {
    let cursor: Node | null = current.firstChild;
    for (const desired of Array.from(next.childNodes)) {
      if (!cursor) {
        current.appendChild(desired.cloneNode(true));
        continue;
      }
      if (!this.matches(cursor, desired)) {
        const key = this.key(desired);
        let match: Node | null = null;
        if (key) {
          for (let sibling = cursor.nextSibling; sibling; sibling = sibling.nextSibling) {
            if (this.matches(sibling, desired)) { match = sibling; break; }
          }
        }
        if (match) {
          current.insertBefore(match, cursor);
          cursor = match;
        } else {
          current.insertBefore(desired.cloneNode(true), cursor);
          continue;
        }
      }
      this.updateNode(cursor, desired);
      cursor = cursor.nextSibling;
    }
    while (cursor) {
      const following = cursor.nextSibling;
      current.removeChild(cursor);
      cursor = following;
    }
  }
}
