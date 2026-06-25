import { useEffect, useState } from 'react';
import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';
import { NoteList } from '../components/NoteList';
import { NoteEditor } from '../components/NoteEditor';

// iOS UINavigationController-style push/pop timing.
const NAV_MS = 360;
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';

export function App() {
  const loadNotes = useNotesStore((s) => s.loadNotes);
  const selectedNoteId = useUIStore((s) => s.selectedNoteId);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  // Keep the editor mounted through its slide-out, and drive the open/close anim.
  const [editorId, setEditorId] = useState<string | null>(selectedNoteId);
  const [open, setOpen] = useState(Boolean(selectedNoteId));

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme, setTheme]);

  useEffect(() => {
    if (selectedNoteId) {
      setEditorId(selectedNoteId);
      // Mount first at translateX(100%), then flip to open on the next frame.
      const r = requestAnimationFrame(() => setOpen(true));
      return () => cancelAnimationFrame(r);
    }
    setOpen(false);
    const t = setTimeout(() => setEditorId(null), NAV_MS);
    return () => clearTimeout(t);
  }, [selectedNoteId]);

  return (
    <div className="relative mx-auto h-full max-w-md overflow-hidden">
      {/* Underlying list: parallax-shifts left and dims while a note is open. */}
      <div
        className="absolute inset-0 px-4"
        style={{
          transform: open ? 'translateX(-23%)' : 'translateX(0)',
          transition: `transform ${NAV_MS}ms ${EASE}`,
        }}
      >
        <NoteList />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{
            opacity: open ? 0.18 : 0,
            transition: `opacity ${NAV_MS}ms ${EASE}`,
          }}
        />
      </div>

      {/* Editor: slides in from the right over the list. */}
      {editorId && (
        <div
          className="absolute inset-0 bg-ios-row px-4 shadow-[-8px_0_24px_rgba(0,0,0,0.12)]"
          style={{
            transform: open ? 'translateX(0)' : 'translateX(100%)',
            transition: `transform ${NAV_MS}ms ${EASE}`,
          }}
        >
          <NoteEditor noteId={editorId} />
        </div>
      )}
    </div>
  );
}
