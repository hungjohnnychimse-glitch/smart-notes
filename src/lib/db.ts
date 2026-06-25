import Dexie, { type Table } from 'dexie';
import type { Note } from '../types/note';

export class NotesDB extends Dexie {
  notes!: Table<Note, string>;

  constructor() {
    super('SmartNotesDB');
    this.version(1).stores({
      // Indexed fields only; contentHtml/contentText are stored but not indexed.
      notes: 'id, title, updatedAt, createdAt, pinned, deleted',
    });
  }
}

export const db = new NotesDB();
