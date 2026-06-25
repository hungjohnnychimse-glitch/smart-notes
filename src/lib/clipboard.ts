import { htmlToMarkdown } from './markdownExport';
import { htmlToText } from './noteParser';

/**
 * Copy rich HTML + plain text together when the browser supports ClipboardItem,
 * so paste targets that understand HTML get formatting and others get clean text.
 */
export async function copyRich(html: string): Promise<void> {
  const text = htmlToText(html);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    return;
  }
  await navigator.clipboard.writeText(text);
}

export async function copyPlainText(html: string): Promise<void> {
  await navigator.clipboard.writeText(htmlToText(html));
}

export async function copyMarkdown(html: string): Promise<void> {
  await navigator.clipboard.writeText(htmlToMarkdown(html));
}

/** Share via Web Share API when available; otherwise copy plain text as fallback. */
export async function shareNote(title: string, html: string): Promise<void> {
  const text = htmlToText(html);
  if (navigator.share) {
    await navigator.share({ title: title || 'Note', text });
    return;
  }
  await navigator.clipboard.writeText(text);
}
