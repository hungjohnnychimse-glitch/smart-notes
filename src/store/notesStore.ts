import { create } from 'zustand';
import { db } from '../lib/db';
import { deriveTitle, htmlToText } from '../lib/noteParser';
import type { Note } from '../types/note';

function uid(): string {
  return (
    crypto.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
  );
}

/** Sort: pinned first, then most-recently updated. */
function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  });
}

type NotesState = {
  notes: Note[];
  loaded: boolean;
  loadNotes: () => Promise<void>;
  createNote: () => Promise<string>;
  updateNoteContent: (id: string, contentHtml: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNote: (id: string) => Note | undefined;
  exportData: () => Note[];
  importNotes: (incoming: unknown) => Promise<{ added: number; skipped: number }>;
};

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  loaded: false,

  async loadNotes() {
    const all = await db.notes.filter((n) => !n.deleted).toArray();
    set({ notes: sortNotes(all), loaded: true });
  },

  async createNote() {
    const now = Date.now();
    const note: Note = {
      id: uid(),
      title: 'New Note',
      contentHtml: '',
      contentText: '',
      pinned: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.notes.add(note);
    set({ notes: sortNotes([note, ...get().notes]) });
    return note.id;
  },

  async updateNoteContent(id, contentHtml) {
    const contentText = htmlToText(contentHtml);
    const patch: Partial<Note> = {
      contentHtml,
      contentText,
      title: deriveTitle(contentText),
      updatedAt: Date.now(),
    };
    await db.notes.update(id, patch);
    set({
      notes: sortNotes(
        get().notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      ),
    });
  },

  async togglePin(id) {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const patch: Partial<Note> = { pinned: !note.pinned, updatedAt: Date.now() };
    await db.notes.update(id, patch);
    set({
      notes: sortNotes(
        get().notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      ),
    });
  },

  async deleteNote(id) {
    // Soft delete keeps the door open for a future "Recently Deleted" view.
    await db.notes.update(id, { deleted: true, updatedAt: Date.now() });
    set({ notes: get().notes.filter((n) => n.id !== id) });
  },

  getNote(id) {
    return get().notes.find((n) => n.id === id);
  },

  exportData() {
    return get().notes;
  },

  async importNotes(incoming) {
    if (!Array.isArray(incoming)) {
      throw new Error('Invalid file: expected an array of notes.');
    }
    const existingIds = new Set(get().notes.map((n) => n.id));
    const toAdd: Note[] = [];

    for (const raw of incoming) {
      if (!raw || typeof raw !== 'object') continue;
      const r = raw as Record<string, unknown>;
      const html = typeof r.contentHtml === 'string' ? r.contentHtml : '';
      const text =
        typeof r.contentText === 'string' ? r.contentText : htmlToText(html);
      if (!html && !text) continue;

      const now = Date.now();
      // Re-id on conflict so imports never clobber existing notes.
      let id = typeof r.id === 'string' ? r.id : uid();
      if (existingIds.has(id)) id = uid();
      existingIds.add(id);

      toAdd.push({
        id,
        contentHtml: html,
        contentText: text,
        title:
          typeof r.title === 'string' && r.title ? r.title : deriveTitle(text),
        pinned: Boolean(r.pinned),
        createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
        updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : now,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : undefined,
      });
    }

    if (toAdd.length) await db.notes.bulkAdd(toAdd);
    await get().loadNotes();
    return { added: toAdd.length, skipped: incoming.length - toAdd.length };
  },
}));
