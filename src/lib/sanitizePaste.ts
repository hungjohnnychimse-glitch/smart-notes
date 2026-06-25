import DOMPurify from 'dompurify';

/** Tags we keep when pasting rich HTML; everything else is stripped to text. */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
];

const ALLOWED_ATTR = ['href', 'src', 'alt'];

/** Only these URL schemes survive on <a href>. */
const SAFE_HREF = /^(https?:|mailto:|tel:)/i;

/** Only http(s) or inline base64 images survive on <img src>. */
const SAFE_IMG_SRC = /^(https?:|data:image\/)/i;

/**
 * Clean HTML coming from the clipboard (websites, Google Docs, Notion, ChatGPT).
 * Removes scripts/styles/inline handlers and junk attributes, keeps structure.
 */
export function sanitizePastedHtml(html: string): string {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta'],
    KEEP_CONTENT: true,
  });

  const doc = new DOMParser().parseFromString(clean, 'text/html');

  // Convert leftover block containers to paragraphs.
  doc.querySelectorAll('div').forEach((div) => {
    const p = doc.createElement('p');
    p.innerHTML = div.innerHTML;
    div.replaceWith(p);
  });

  // Harden links: drop unsafe schemes, force safe rel/target.
  doc.querySelectorAll('a').forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    if (!SAFE_HREF.test(href)) {
      a.replaceWith(...Array.from(a.childNodes));
      return;
    }
    a.setAttribute('rel', 'noopener noreferrer');
    a.setAttribute('target', '_blank');
  });

  // Drop images with unsafe sources (only http(s) and inline data:image survive).
  doc.querySelectorAll('img').forEach((img) => {
    if (!SAFE_IMG_SRC.test(img.getAttribute('src') ?? '')) img.remove();
  });

  return doc.body.innerHTML.trim();
}
