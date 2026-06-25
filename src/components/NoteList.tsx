import { useMemo, useRef, useState } from 'react';
import { useNotesStore } from '../store/notesStore';
import { useUIStore } from '../store/uiStore';
import { NoteCard } from './NoteCard';
import { SearchBar } from './SearchBar';
import { EmptyState } from './EmptyState';
import { ThemeToggle } from './ThemeToggle';
import { NotesMenu } from './NotesMenu';
import { Icon } from './Icon';
import { InstallBanner } from './InstallBanner';
import type { Note } from '../types/note';

function matches(note: Note, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    note.title.toLowerCase().includes(needle) ||
    note.contentText.toLowerCase().includes(needle)
  );
}

function Group({
  notes,
  onOpen,
  onTogglePin,
  onDelete,
}: {
  notes: Note[];
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ul className="overflow-hidden rounded-[10px] bg-ios-row">
      {notes.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onOpen={onOpen}
          onTogglePin={onTogglePin}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

export function NoteList() {
  const notes = useNotesStore((s) => s.notes);
  const createNote = useNotesStore((s) => s.createNote);
  const togglePin = useNotesStore((s) => s.togglePin);
  const deleteNote = useNotesStore((s) => s.deleteNote);

  const search = useUIStore((s) => s.search);
  const openNote = useUIStore((s) => s.openNote);

  const filtered = useMemo(
    () =>
      notes
        .filter((n) => matches(n, search))
        .sort((a, b) => {
          if (!search) return 0;
          const q = search.toLowerCase();
          const at = a.title.toLowerCase().includes(q) ? 0 : 1;
          const bt = b.title.toLowerCase().includes(q) ? 0 : 1;
          return at - bt;
        }),
    [notes, search],
  );

  const pinned = filtered.filter((n) => n.pinned);
  const others = filtered.filter((n) => !n.pinned);
  const showSections = !search && pinned.length > 0;

  const label = (text: string) => (
    <h2 className="mb-1.5 ml-4 mt-3 text-[13px] font-normal uppercase tracking-wide text-ios-2nd">
      {text}
    </h2>
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  function onScroll() {
    setScrolled((scrollRef.current?.scrollTop ?? 0) > 36);
  }

  // While searching, the large title collapses and the compact bar hides.
  const compactTitle = scrolled && !searchActive;
  const barSolid = scrolled || searchActive;

  async function handleCreate() {
    const id = await createNote();
    openNote(id);
  }

  return (
    <div className="flex h-full flex-col">
      {/* Persistent nav bar: right controls always visible; compact centered
          title + hairline fade in once the large title scrolls away. */}
      <div
        className="relative z-20 flex h-11 items-center justify-between transition-colors duration-200"
        style={{
          backgroundColor: barSolid ? 'color-mix(in srgb, var(--ios-bg) 80%, transparent)' : 'transparent',
          backdropFilter: barSolid ? 'blur(12px)' : 'none',
          borderBottom: barSolid ? '0.5px solid var(--ios-sep)' : '0.5px solid transparent',
        }}
      >
        <span className="w-16" aria-hidden />
        <span
          className="pointer-events-none absolute inset-x-0 text-center text-[17px] font-semibold transition-opacity duration-200"
          style={{ opacity: compactTitle ? 1 : 0 }}
        >
          Ghi chú
        </span>
        <div
          className="flex items-center transition-opacity duration-200"
          style={{
            opacity: searchActive ? 0 : 1,
            pointerEvents: searchActive ? 'none' : 'auto',
          }}
        >
          <ThemeToggle />
          <NotesMenu />
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="-mx-1 flex-1 overflow-y-auto px-1 pb-24"
      >
        {/* Large title collapses to height 0 while searching. */}
        <div
          className="overflow-hidden transition-all duration-300"
          style={{
            maxHeight: searchActive ? 0 : 56,
            opacity: searchActive ? 0 : 1,
          }}
        >
          <h1 className="pt-1 text-[34px] font-bold leading-tight tracking-tight">
            Ghi chú
          </h1>
        </div>

        <SearchBar active={searchActive} onActiveChange={setSearchActive} />

        <InstallBanner />

        {filtered.length === 0 ? (
          <EmptyState searching={Boolean(search)} />
        ) : showSections ? (
          <>
            {label('Đã ghim')}
            <Group
              notes={pinned}
              onOpen={openNote}
              onTogglePin={togglePin}
              onDelete={deleteNote}
            />
            {label('Ghi chú')}
            <Group
              notes={others}
              onOpen={openNote}
              onTogglePin={togglePin}
              onDelete={deleteNote}
            />
          </>
        ) : (
          <Group
            notes={filtered}
            onOpen={openNote}
            onTogglePin={togglePin}
            onDelete={deleteNote}
          />
        )}
      </div>

      {/* Bottom toolbar: centered note count + compose button (iOS Notes style). */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ios-sep bg-ios-bg/85 backdrop-blur">
        <div className="relative mx-auto flex h-12 max-w-md items-center justify-center px-4">
          <span className="text-[13px] text-ios-2nd">
            {notes.length === 0 ? 'Không có ghi chú' : `${notes.length} ghi chú`}
          </span>
          <button
            onClick={() => void handleCreate()}
            aria-label="Tạo ghi chú mới"
            className="absolute right-3 flex h-11 w-11 items-center justify-center text-accent active:opacity-60"
          >
            <Icon name="compose" className="h-[26px] w-[26px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
