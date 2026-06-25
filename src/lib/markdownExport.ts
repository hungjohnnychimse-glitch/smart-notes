/**
 * Convert a note's stored HTML into Markdown. Walks the sanitized DOM the editor
 * produces (p, br, strong/em, ul/ol/li, a, blockquote, code/pre, h1-3).
 */
export function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return blocksToMd(doc.body).trim() + '\n';
}

function inline(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const inner = childrenInline(el);
  switch (el.tagName) {
    case 'BR':
      return '\n';
    case 'STRONG':
    case 'B':
      return `**${inner}**`;
    case 'EM':
    case 'I':
      return `*${inner}*`;
    case 'CODE':
      return `\`${inner}\``;
    case 'A': {
      const href = el.getAttribute('href') ?? '';
      return `[${inner}](${href})`;
    }
    default:
      return inner;
  }
}

function childrenInline(el: HTMLElement): string {
  return Array.from(el.childNodes).map(inline).join('');
}

function blocksToMd(root: HTMLElement): string {
  const out: string[] = [];

  for (const node of Array.from(root.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent?.trim();
      if (t) out.push(t);
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;

    const el = node as HTMLElement;
    switch (el.tagName) {
      case 'H1':
        out.push(`# ${childrenInline(el)}`);
        break;
      case 'H2':
        out.push(`## ${childrenInline(el)}`);
        break;
      case 'H3':
        out.push(`### ${childrenInline(el)}`);
        break;
      case 'UL':
        out.push(
          Array.from(el.querySelectorAll(':scope > li'))
            .map((li) => `- ${childrenInline(li as HTMLElement)}`)
            .join('\n'),
        );
        break;
      case 'OL':
        out.push(
          Array.from(el.querySelectorAll(':scope > li'))
            .map((li, idx) => `${idx + 1}. ${childrenInline(li as HTMLElement)}`)
            .join('\n'),
        );
        break;
      case 'BLOCKQUOTE':
        out.push(`> ${childrenInline(el)}`);
        break;
      case 'PRE':
        out.push('```\n' + (el.textContent ?? '') + '\n```');
        break;
      default:
        out.push(childrenInline(el));
    }
  }

  return out.filter((b) => b.length > 0).join('\n\n');
}
