import { useCallback, useEffect, useRef, useState } from 'react';
import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';
import { BottomToolbar } from './BottomToolbar';
import { handleSmartPaste } from '../lib/smartPaste';
import { copyRich, copyMarkdown, shareNote } from '../lib/clipboard';
import { insertChecklist, handleChecklistClick, handleChecklistKeydown } from '../lib/checklist';
import { htmlToMarkdown } from '../lib/markdownExport';
import { downloadText, safeFileName } from '../lib/download';
import { Icon } from './Icon';

const SAVE_DEBOUNCE_MS = 500;
const TOAST_MS = 1500;

function forceBlackLinks(root: HTMLElement | null): void {
  if (!root) return;
  root.querySelectorAll('a').forEach((a) => {
    const anchor = a as HTMLAnchorElement;
    anchor.style.color = '#000000';
    anchor.style.webkitTextFillColor = '#000000';
    anchor.style.textDecorationColor = '#000000';
    anchor.style.textDecorationLine = 'none';
  });
}

function stripUnderlines(root: HTMLElement | null): void {
  if (!root) return;

  root.querySelectorAll('u').forEach((node) => {
    const parent = node.parentNode;
    if (!parent) return;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
  });

  root.querySelectorAll('*').forEach((node) => {
    const el = node as HTMLElement;
    el.style.textDecorationLine = 'none';
    if (el.tagName === 'A') {
      el.style.color = '#000000';
      el.style.webkitTextFillColor = '#000000';
      el.style.textDecorationColor = '#000000';
    }
  });
}

export function NoteEditor({ noteId }: { noteId: string }) {
  const note = useNotesStore((s) => s.notes.find((n) => n.id === noteId));
  const updateNoteContent = useNotesStore((s) => s.updateNoteContent);
  const togglePin = useNotesStore((s) => s.togglePin);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const closeNote = useUIStore((s) => s.closeNote);

  const editorRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [toast, setToast] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  // Seed editor once per note; avoid clobbering the caret on each keystroke.
  useEffect(() => {
    if (editorRef.current && note) {
      editorRef.current.innerHTML = note.contentHtml;
      stripUnderlines(editorRef.current);
      forceBlackLinks(editorRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const flush = useCallback(() => {
    if (!editorRef.current) return;
    stripUnderlines(editorRef.current);
    forceBlackLinks(editorRef.current);
    void updateNoteContent(noteId, editorRef.current.innerHTML).then(() =>
      setStatus('saved'),
    );
  }, [noteId, updateNoteContent]);

  const handleInput = useCallback(() => {
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
  }, [flush]);

  // Flush pending changes when leaving the editor.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  function handleFormat(command: string) {
    if (command === 'underline') {
      stripUnderlines(editorRef.current);
      forceBlackLinks(editorRef.current);
      handleInput();
      return;
    }
    document.execCommand(command);
    editorRef.current?.focus();
    stripUnderlines(editorRef.current);
    handleInput();
  }

  function handleFormatBlock(tag: string) {
    document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
    stripUnderlines(editorRef.current);
    handleInput();
  }

  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      handleSmartPaste(e.nativeEvent);
      stripUnderlines(editorRef.current);
      forceBlackLinks(editorRef.current);
      handleInput();
    },
    [handleInput],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (handleChecklistKeydown(e.nativeEvent)) handleInput();
    },
    [handleInput],
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (handleChecklistClick(e.nativeEvent)) handleInput();
    },
    [handleInput],
  );

  const handleChecklist = useCallback(() => {
    insertChecklist();
    handleInput();
  }, [handleInput]);

  async function runClipboard(action: () => Promise<void>, ok: string) {
    try {
      await action();
      flash(ok);
    } catch {
      flash('Thao tác thất bại');
    }
  }

  const html = () => editorRef.current?.innerHTML ?? '';
  const handleCopy = () => void runClipboard(() => copyRich(html()), 'Đã sao chép');
  const handleCopyMarkdown = () =>
    void runClipboard(() => copyMarkdown(html()), 'Đã sao chép Markdown');
  const handleShare = () =>
    void runClipboard(() => shareNote(note?.title ?? '', html()), 'Đã chia sẻ');
  const handleDownloadMarkdown = () => {
    downloadText(`${safeFileName(note?.title ?? 'note')}.md`, htmlToMarkdown(html()), 'text/markdown');
    flash('Đã tải .md');
  };

  function handleInsertLink() {
    const url = window.prompt('Địa chỉ liên kết (https://...)');
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      window.alert('Chỉ cho phép liên kết http/https.');
      return;
    }
    document.execCommand('createLink', false, url);
    stripUnderlines(editorRef.current);
    forceBlackLinks(editorRef.current);
    handleInput();
  }

  function handleBack() {
    flush();
    closeNote();
  }

  function handleDelete() {
    if (!window.confirm('Xóa ghi chú này?')) return;
    void deleteNote(noteId);
    closeNote();
  }

  if (!note) return null;

  return (
    <div className="flex h-full flex-col bg-ios-row">
      <header className="flex items-center justify-between py-1">
        <button
          onClick={handleBack}
          aria-label="Quay lại"
          className="-ml-1 flex min-h-[44px] items-center text-[17px] text-accent active:opacity-60"
        >
          <Icon name="chevronLeft" className="h-6 w-6" strokeWidth={2.2} />
          Ghi chú
        </button>
        <span className="text-[13px] text-ios-2nd" aria-live="polite">
          {status === 'saving' ? 'Đang lưu…' : 'Đã lưu'}
        </span>
        {focused ? (
          // While editing, the actions menu is replaced by a Done button that
          // dismisses the keyboard (iOS Notes behaviour). preventDefault keeps
          // the native focus from changing so we can blur explicitly.
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              editorRef.current?.blur();
              flush();
            }}
            className="flex min-h-[44px] items-center px-1 text-[17px] font-semibold text-accent active:opacity-60"
          >
            Xong
          </button>
        ) : (
          <div className="relative text-accent">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Tùy chọn khác"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="flex h-11 w-9 items-center justify-center active:opacity-60"
            >
              <Icon name="ellipsis" className="h-[22px] w-[22px]" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-xl border border-ios-sep bg-ios-row p-1 shadow-lg"
                >
                  <button
                    role="menuitem"
                    onClick={() => {
                      void togglePin(noteId);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] text-ios-text active:bg-ios-search"
                  >
                    {note.pinned ? 'Bỏ ghim' : 'Ghim'}
                    <Icon
                      name={note.pinned ? 'pinSlash' : 'pin'}
                      className="h-[18px] w-[18px]"
                    />
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      handleShare();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] text-ios-text active:bg-ios-search"
                  >
                    Chia sẻ
                    <Icon name="share" className="h-[18px] w-[18px]" />
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      handleDelete();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[15px] text-red-500 active:bg-ios-search"
                  >
                    Xóa
                    <Icon name="trash" className="h-[18px] w-[18px]" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </header>

      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-label="Nội dung ghi chú"
        data-placeholder="Bắt đầu viết…"
        onInput={handleInput}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        onClick={onClick}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        suppressContentEditableWarning
        className="note-body flex-1 overflow-y-auto py-2 pb-16 text-[17px] leading-relaxed outline-none [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6"
      />

      {toast && (
        <div
          role="status"
          className="pointer-events-none fixed bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-neutral-900/90 px-4 py-2 text-sm text-white shadow-lg dark:bg-neutral-100/90 dark:text-neutral-900"
        >
          {toast}
        </div>
      )}

      <BottomToolbar
        onFormat={handleFormat}
        onFormatBlock={handleFormatBlock}
        onInsertLink={handleInsertLink}
        onChecklist={handleChecklist}
        onCopy={handleCopy}
        onCopyMarkdown={handleCopyMarkdown}
        onDownloadMarkdown={handleDownloadMarkdown}
        onShare={handleShare}
      />
    </div>
  );
}
