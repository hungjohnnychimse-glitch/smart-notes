import { sanitizePastedHtml } from './sanitizePaste';
import { checklistHtml, checklistItemHtml } from './checklist';

const URL_RE = /\b((?:https?:\/\/|www\.)[^\s<]+[^\s<.,;:!?)])/gi;
const EMAIL_RE = /\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi;
const PHONE_RE = /(?<!\d)(\+?\d[\d\s().-]{6,}\d)(?!\d)/g;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Wrap bare URLs, emails and phone numbers in (escaped, sanitized-later) anchors. */
function linkify(escaped: string): string {
  return escaped
    .replace(URL_RE, (m) => {
      const href = m.startsWith('http') ? m : `https://${m}`;
      return `<a href="${href}">${m}</a>`;
    })
    .replace(EMAIL_RE, (m) => `<a href="mailto:${m}">${m}</a>`)
    .replace(PHONE_RE, (m) => {
      const tel = m.replace(/[\s().-]/g, '');
      return `<a href="tel:${tel}">${m}</a>`;
    });
}

type Kind = 'bullet' | 'ordered' | 'check' | 'text' | 'blank';

function classify(line: string): { kind: Kind; content: string; checked?: boolean } {
  const t = line.trim();
  if (!t) return { kind: 'blank', content: '' };

  let m: RegExpMatchArray | null;
  if ((m = t.match(/^\[([ xX])\]\s+(.*)$/))) {
    return { kind: 'check', content: m[2], checked: m[1].toLowerCase() === 'x' };
  }
  if ((m = t.match(/^[-*•]\s+(.*)$/))) {
    return { kind: 'bullet', content: m[1] };
  }
  if ((m = t.match(/^\d+[.)]\s+(.*)$/))) {
    return { kind: 'ordered', content: m[1] };
  }
  return { kind: 'text', content: t };
}

/**
 * Turn plain clipboard text into structured HTML: detect bullet/numbered/checklist
 * blocks, linkify URLs/emails/phones, preserve intentional line breaks.
 */
export function convertPlainTextToSmartHtml(text: string): string {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;

  const renderInline = (s: string) => linkify(escapeHtml(s));

  while (i < lines.length) {
    const { kind } = classify(lines[i]);

    if (kind === 'blank') {
      i++;
      continue;
    }

    if (kind === 'bullet' || kind === 'ordered' || kind === 'check') {
      const items: string[] = [];
      while (i < lines.length) {
        const c = classify(lines[i]);
        if (c.kind !== kind) break;
        if (kind === 'check') {
          items.push(checklistItemHtml(renderInline(c.content), Boolean(c.checked)));
        } else {
          items.push(`<li>${renderInline(c.content)}</li>`);
        }
        i++;
      }
      if (kind === 'check') out.push(checklistHtml(items.join('')));
      else out.push(`<${kind === 'ordered' ? 'ol' : 'ul'}>${items.join('')}</${kind === 'ordered' ? 'ol' : 'ul'}>`);
      continue;
    }

    // Plain text run: one <div> per line (matches contenteditable's Enter and
    // keeps each line a separate block, so only the FIRST line becomes the
    // iOS-style big title — not the whole paste).
    while (i < lines.length && classify(lines[i]).kind === 'text') {
      out.push(`<div>${renderInline(lines[i].trim())}</div>`);
      i++;
    }
  }

  return out.join('');
}

/** Insert HTML at the current caret position inside a contenteditable. */
export function insertHtmlAtCursor(html: string): void {
  // Never touch the selection for an empty insert — that would delete the
  // current selection (e.g. select-all) and replace it with nothing.
  if (!html) return;

  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    document.execCommand('insertHTML', false, html);
    return;
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();

  const frag = range.createContextualFragment(html);
  const lastNode = frag.lastChild;
  range.insertNode(frag);

  if (lastNode) {
    range.setStartAfter(lastNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

/** Read an image file as a base64 data URL for inline embedding. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Clipboard paste handler: images → inline base64 <img>,
 * HTML → sanitized, plain text → smart-structured HTML.
 */
export function handleSmartPaste(event: ClipboardEvent): void {
  const clipboard = event.clipboardData;
  if (!clipboard) return;

  const html = clipboard.getData('text/html');
  const text = clipboard.getData('text/plain');
  const images = Array.from(clipboard.files ?? []).filter((f) =>
    f.type.startsWith('image/'),
  );

  // Prefer images only when there is no meaningful text/html alongside them
  // (rich editors often ship an <img> in the HTML payload already).
  if (images.length > 0 && !html && !text) {
    event.preventDefault();
    void Promise.all(images.map(fileToDataUrl)).then((urls) => {
      insertHtmlAtCursor(
        urls
          .map((url) => `<img src="${url}" alt="" />`)
          .join(''),
      );
    });
    return;
  }

  // Prefer rich HTML, but only when it survives sanitization with real content.
  // Some sources (password managers, terminals) ship a bare <meta> wrapper as
  // text/html while the actual value lives in text/plain — that would sanitize
  // to nothing, so we must fall back to the plain text instead of wiping.
  if (html) {
    const clean = sanitizePastedHtml(html);
    if (clean) {
      event.preventDefault();
      insertHtmlAtCursor(clean);
      return;
    }
  }

  if (text) {
    const smart = convertPlainTextToSmartHtml(text);
    if (smart) {
      event.preventDefault();
      insertHtmlAtCursor(smart);
    }
    // If it produced nothing (whitespace only), let the browser paste natively.
  }
}
