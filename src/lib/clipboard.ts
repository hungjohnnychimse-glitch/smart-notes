import { htmlToMarkdown } from './markdownExport';
import { htmlToText } from './noteParser';

async function writePlainTextFallback(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', 'true');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('Clipboard copy failed');
}

/**
 * Copy rich HTML + plain text together when the browser supports ClipboardItem,
 * so paste targets that understand HTML get formatting and others get clean text.
 */
export async function copyRich(html: string): Promise<void> {
  const text = htmlToText(html);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch {
      // Fall through to a plain-text copy fallback; some iPhone/Safari paths
      // expose ClipboardItem but still reject writes.
    }
  }
  await writePlainTextFallback(text);
}

export async function copyPlainText(html: string): Promise<void> {
  await writePlainTextFallback(htmlToText(html));
}

export async function copyMarkdown(html: string): Promise<void> {
  await writePlainTextFallback(htmlToMarkdown(html));
}

/** Share via Web Share API when available; otherwise copy plain text as fallback. */
export async function shareNote(title: string, html: string): Promise<void> {
  const text = htmlToText(html);
  if (navigator.share) {
    await navigator.share({ title: title || 'Note', text });
    return;
  }
  await writePlainTextFallback(text);
}
