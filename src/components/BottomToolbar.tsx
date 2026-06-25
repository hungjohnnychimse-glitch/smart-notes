import { useState } from 'react';
import { Icon } from './Icon';

type Props = {
  onFormat: (command: string) => void;
  onFormatBlock: (tag: string) => void;
  onInsertLink: () => void;
  onChecklist: () => void;
  onCopy: () => void;
  onCopyMarkdown: () => void;
  onDownloadMarkdown: () => void;
  onShare: () => void;
};

const BTN =
  'flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-2 text-[15px] font-semibold text-ios-text active:bg-ios-search';

// onMouseDown + preventDefault keeps the editor selection/caret alive.
const hold = (fn: () => void) => (e: React.MouseEvent) => {
  e.preventDefault();
  fn();
};

export function BottomToolbar({
  onFormat,
  onFormatBlock,
  onInsertLink,
  onChecklist,
  onCopy,
  onCopyMarkdown,
  onDownloadMarkdown,
  onShare,
}: Props) {
  const [showFormat, setShowFormat] = useState(false);

  const paraStyles: { label: string; tag: string; cls: string }[] = [
    { label: 'Title', tag: 'h1', cls: 'text-xl font-bold' },
    { label: 'Heading', tag: 'h2', cls: 'text-base font-semibold' },
    { label: 'Body', tag: 'p', cls: 'text-[15px]' },
  ];
  const marks: { label: string; cmd: string; cls?: string }[] = [
    { label: 'B', cmd: 'bold', cls: 'font-bold' },
    { label: 'I', cmd: 'italic', cls: 'italic' },
    { label: 'U', cmd: 'underline', cls: 'underline' },
    { label: 'S', cmd: 'strikeThrough', cls: 'line-through' },
  ];
  const lists: { label: string; aria: string; run: () => void }[] = [
    { label: '•', aria: 'Bullet list', run: () => onFormat('insertUnorderedList') },
    { label: '1.', aria: 'Numbered list', run: () => onFormat('insertOrderedList') },
    { label: '☑︎', aria: 'Checklist', run: onChecklist },
  ];

  const cell =
    'flex h-10 flex-1 items-center justify-center rounded-lg bg-ios-search text-ios-text active:opacity-60';

  return (
    <div className="relative">
      {showFormat && (
        <>
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onMouseDown={() => setShowFormat(false)}
          />
          <div
            role="menu"
            aria-label="Text formatting"
            className="absolute bottom-full left-0 right-0 z-20 mb-1 space-y-2 rounded-2xl border border-ios-sep bg-ios-row p-3 shadow-xl"
          >
            <div className="flex gap-2">
              {paraStyles.map((p) => (
                <button
                  key={p.tag}
                  onMouseDown={hold(() => onFormatBlock(p.tag))}
                  className={`${cell} ${p.cls}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {marks.map((m) => (
                <button
                  key={m.cmd}
                  aria-label={m.cmd}
                  onMouseDown={hold(() => onFormat(m.cmd))}
                  className={`${cell} ${m.cls ?? ''}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {lists.map((l) => (
                <button
                  key={l.aria}
                  aria-label={l.aria}
                  onMouseDown={hold(l.run)}
                  className={`${cell} text-lg`}
                >
                  {l.aria === 'Checklist' ? (
                    <Icon name="checklist" className="h-5 w-5" />
                  ) : (
                    l.label
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-ios-sep bg-ios-bg/90 px-2 py-1 backdrop-blur">
        <button
          onMouseDown={hold(() => setShowFormat((v) => !v))}
          aria-label="Text format"
          aria-expanded={showFormat}
          className={`${BTN} ${showFormat ? 'text-accent' : ''}`}
        >
          <span className="text-base font-bold">A</span>
          <span className="text-xs font-bold">a</span>
        </button>
        <button onMouseDown={hold(onChecklist)} aria-label="Checklist" className={BTN}>
          <Icon name="checklist" className="h-[22px] w-[22px]" />
        </button>
        <button onMouseDown={hold(onInsertLink)} aria-label="Insert link" className={BTN}>
          <Icon name="link" className="h-[22px] w-[22px]" />
        </button>

        <span className="mx-1 h-6 w-px shrink-0 bg-ios-sep" aria-hidden />

        <button onMouseDown={hold(onCopy)} aria-label="Copy note" className={BTN}>
          <Icon name="copy" className="h-[22px] w-[22px]" />
        </button>
        <button
          onMouseDown={hold(onCopyMarkdown)}
          aria-label="Copy as Markdown"
          className={`${BTN} gap-0.5`}
        >
          <Icon name="markdown" className="h-[22px] w-[22px]" />
          <span className="text-[11px] font-bold">md</span>
        </button>
        <button
          onMouseDown={hold(onDownloadMarkdown)}
          aria-label="Download as Markdown file"
          className={`${BTN} gap-0.5`}
        >
          <Icon name="markdown" className="h-[22px] w-[22px]" />
          <span className="text-[11px] font-bold">↓</span>
        </button>
        <button onMouseDown={hold(onShare)} aria-label="Share note" className={BTN}>
          <Icon name="share" className="h-[22px] w-[22px]" />
        </button>
      </div>
    </div>
  );
}
