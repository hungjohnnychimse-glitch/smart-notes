/** Trigger a browser download of text content as a file. */
export function downloadText(filename: string, text: string, mime = 'text/plain'): void {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Turn a note title into a filesystem-safe file name stem. */
export function safeFileName(title: string, fallback = 'note'): string {
  const stem = title
    .trim()
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .slice(0, 60)
    .trim();
  return stem || fallback;
}
