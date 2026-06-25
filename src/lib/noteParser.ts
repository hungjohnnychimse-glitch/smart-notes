/**
 * Derive a human title from note content.
 * Rule: first non-empty line/paragraph; fall back to "New Note" when empty.
 */
export function deriveTitle(contentText: string): string {
  const firstLine = contentText
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!firstLine) return 'New Note';
  return firstLine.length > 100 ? firstLine.slice(0, 100) : firstLine;
}

// Tags that should produce a line break in the extracted text, so the title
// (first line) and search text don't run blocks together ("ListMilkEggs").
const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'LI',
  'H1',
  'H2',
  'H3',
  'BLOCKQUOTE',
  'PRE',
  'TR',
  'UL',
  'OL',
]);

/** Strip HTML to plain text (with line breaks at block boundaries). */
export function htmlToText(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = html;

  let out = '';
  const walk = (node: Node) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.textContent ?? '';
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;
      const tag = (child as HTMLElement).tagName;
      if (tag === 'INPUT') return; // skip checklist checkboxes
      if (tag === 'BR') {
        out += '\n';
        return;
      }
      walk(child);
      if (BLOCK_TAGS.has(tag)) out += '\n';
    });
  };
  walk(root);

  return out
    .replace(/ /g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
