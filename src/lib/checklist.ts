/**
 * Interactive checklist support for the contenteditable editor.
 *
 * DOM shape (also produced by smartPaste for `[ ]` / `[x]` lines):
 *   <ul class="checklist">
 *     <li data-checked="false"><input type="checkbox" contenteditable="false"><span>text</span></li>
 *   </ul>
 *
 * The checkbox is `contenteditable="false"` so the caret stays in the text span.
 * We mirror the checked state onto the `checked` attribute and `data-checked` so
 * it survives being serialized to innerHTML and reloaded.
 */

/** Build one checklist `<li>` from already-escaped inner HTML. */
export function checklistItemHtml(inner: string, checked: boolean): string {
  return (
    `<li data-checked="${checked}">` +
    `<input type="checkbox"${checked ? ' checked' : ''} contenteditable="false" aria-label="Toggle checklist item">` +
    `<span>${inner}</span></li>`
  );
}

export function checklistHtml(items: string): string {
  return `<ul class="checklist">${items}</ul>`;
}

function createItem(): HTMLLIElement {
  const li = document.createElement('li');
  li.setAttribute('data-checked', 'false');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.contentEditable = 'false';
  input.setAttribute('aria-label', 'Toggle checklist item');
  li.append(input, document.createElement('span'));
  return li;
}

function placeCaretInSpan(li: HTMLLIElement, atEnd = false): void {
  const span = li.querySelector('span');
  if (!span) return;
  const range = document.createRange();
  range.selectNodeContents(span);
  range.collapse(!atEnd);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function currentChecklistItem(): HTMLLIElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const node = sel.anchorNode;
  const el = node instanceof HTMLElement ? node : node?.parentElement ?? null;
  const li = el?.closest('li');
  if (li && li.parentElement?.classList.contains('checklist')) {
    return li as HTMLLIElement;
  }
  return null;
}

/** Insert a fresh single-item checklist at the caret and focus its text span. */
export function insertChecklist(): void {
  const ul = document.createElement('ul');
  ul.className = 'checklist';
  const li = createItem();
  ul.append(li);

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  range.insertNode(ul);
  placeCaretInSpan(li);
}

/** Toggle a checkbox when clicked. Returns true if the click was a checkbox. */
export function handleChecklistClick(e: MouseEvent): boolean {
  const t = e.target as HTMLElement;
  if (
    t instanceof HTMLInputElement &&
    t.type === 'checkbox' &&
    t.parentElement?.matches('li')
  ) {
    const li = t.parentElement;
    li.setAttribute('data-checked', String(t.checked));
    if (t.checked) t.setAttribute('checked', '');
    else t.removeAttribute('checked');
    return true;
  }
  return false;
}

/**
 * Enter → new item (or exit checklist on an empty item).
 * Backspace on an empty item → remove it.
 * Returns true when the event was handled (caller should persist).
 */
export function handleChecklistKeydown(e: KeyboardEvent): boolean {
  const li = currentChecklistItem();
  if (!li) return false;

  const span = li.querySelector('span');
  const text = span?.textContent ?? '';

  if (e.key === 'Enter') {
    e.preventDefault();
    const ul = li.parentElement!;
    if (text.trim() === '') {
      // Empty item → leave the checklist with a normal paragraph.
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      ul.after(p);
      li.remove();
      if (!ul.children.length) ul.remove();
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    } else {
      const next = createItem();
      li.after(next);
      placeCaretInSpan(next);
    }
    return true;
  }

  if (e.key === 'Backspace' && text === '') {
    e.preventDefault();
    const ul = li.parentElement!;
    const prev = li.previousElementSibling as HTMLLIElement | null;
    li.remove();
    if (prev) {
      placeCaretInSpan(prev, true);
    } else if (!ul.children.length) {
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      ul.replaceWith(p);
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    return true;
  }

  return false;
}
