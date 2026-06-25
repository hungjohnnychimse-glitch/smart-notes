import { useRef, useState } from 'react';
import { useNotesStore } from '../store/notesStore';
import { useCanInstall, promptInstall } from '../lib/pwa';
import { Icon } from './Icon';

function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function NotesMenu() {
  const [open, setOpen] = useState(false);
  const exportData = useNotesStore((s) => s.exportData);
  const importNotes = useNotesStore((s) => s.importNotes);
  const canInstall = useCanInstall();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(exportData(), `smart-notes-${stamp}.json`);
    setOpen(false);
  }

  async function handleImportFile(file: File) {
    try {
      const parsed = JSON.parse(await file.text());
      const { added, skipped } = await importNotes(parsed);
      window.alert(`Imported ${added} note(s)${skipped ? `, skipped ${skipped}` : ''}.`);
    } catch (err) {
      window.alert(`Import failed: ${(err as Error).message}`);
    } finally {
      setOpen(false);
    }
  }

  const item =
    'block w-full rounded-lg px-3 py-2 text-left text-[15px] text-ios-text active:bg-ios-search';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-full text-accent active:opacity-60"
      >
        <Icon name="ellipsis" className="h-6 w-6" />
      </button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <div
            className="fixed inset-0 z-10"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-ios-sep bg-ios-row p-1 shadow-lg"
          >
            {canInstall && (
              <button
                role="menuitem"
                className={item}
                onClick={() => {
                  void promptInstall();
                  setOpen(false);
                }}
              >
                Install app
              </button>
            )}
            <button role="menuitem" className={item} onClick={handleExport}>
              Export JSON
            </button>
            <button
              role="menuitem"
              className={item}
              onClick={() => fileRef.current?.click()}
            >
              Import JSON
            </button>
          </div>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleImportFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
