# Smart Notes

A fast, offline-first notes PWA. Mobile-first, installable to the Home Screen,
smart copy/paste, and local storage via IndexedDB. Inspired-by (not copied from)
the clean, minimal feel of mobile notes apps.

## Tech stack

- React 18 + Vite + TypeScript
- TailwindCSS (dark mode via `class`)
- Dexie.js (IndexedDB) for note storage
- Zustand for state
- DOMPurify for paste sanitization
- `vite-plugin-pwa` for manifest + service worker

## Scripts

```bash
npm install      # install dependencies
npm run dev      # start dev server
npm run build    # type-check + production build (dist/)
npm run preview  # preview the production build
npm run lint     # type-check only (tsc --noEmit)
```

## Features

- Create / edit / delete / pin notes; pinned notes float to the top
- Realtime search over title and body (title matches rank first)
- Debounced auto-save (500ms) with a "Saving…/Saved" indicator
- Rich-text editor: bold, italic, bullet/numbered lists, links
- **Smart paste** — pasted content is cleaned and structured:
  - HTML from websites / Google Docs / Notion / ChatGPT is sanitized to a safe
    tag whitelist; junk styles, scripts and unsafe links are removed
  - Plain text is auto-structured: bullet (`-`, `*`, `•`), numbered (`1.`),
    and checklist (`[ ]`, `[x]`) lines become real lists; URLs, emails and
    phone numbers become clickable links; intentional line breaks are kept
- **Smart copy / share**
  - Copy as rich HTML + clean text (via `ClipboardItem`, falls back to text)
  - Copy as Markdown
  - Download a note as a `.md` file
  - Share via the Web Share API (falls back to copying text)
- Interactive checklists (tick/untick, Enter for new item, Backspace to remove)
- Export all notes to JSON / import from JSON (re-ids on conflict, never clobbers)
- Install-app button (uses the `beforeinstallprompt` event when available)
- Light / Dark / System theme toggle (persisted in `localStorage`)
- Offline support + Add to Home Screen (PWA)

## Add to Home Screen

### iPhone (Safari)
1. Open the app in Safari.
2. Tap the **Share** button.
3. Choose **Add to Home Screen**.
4. Tap **Add**.

### Android (Chrome)
1. Open the app in Chrome.
2. Tap the three-dot menu.
3. Choose **Add to Home Screen** / **Install app**.

## Project structure

```text
src/
  app/         App.tsx, main.tsx
  components/  NoteList, NoteCard, SearchBar, EmptyState, NoteEditor,
               BottomToolbar, NotesMenu, ThemeToggle, Icon
  lib/         db, noteParser, dateFormat, sanitizePaste, smartPaste,
               clipboard, markdownExport, checklist, download, pwa, theme
  store/       notesStore, uiStore
  types/       note.ts
  styles/      globals.css
public/
  icons/       icon-192.png, icon-512.png, maskable-icon.png
```

## Data model

```ts
type Note = {
  id: string;
  title: string;       // derived from first non-empty line
  contentHtml: string; // rich text
  contentText: string; // plain text for search
  pinned: boolean;
  archived?: boolean;
  deleted?: boolean;   // soft delete
  createdAt: number;
  updatedAt: number;
  tags?: string[];
};
```

Notes are stored in IndexedDB (`SmartNotesDB`); deleting is a soft delete so a
"Recently Deleted" view can be added later. The service worker precaches the app
shell only — note data never leaves IndexedDB.

## Test checklist

- [x] Create a new note
- [x] Edit a note
- [x] Auto-save works
- [x] Refresh does not lose notes (IndexedDB)
- [x] Delete a note
- [x] Pin a note (pinned float to top)
- [x] Search notes
- [x] Pasting plain text keeps intentional line breaks
- [x] Pasting a bullet list converts correctly
- [x] Pasting a numbered list converts correctly
- [x] Pasted links become clickable
- [x] Pasting from a website strips junk styles/scripts
- [x] Pasting from ChatGPT keeps readable formatting
- [x] Copy clean text
- [x] Copy / download Markdown
- [x] Export / import JSON
- [x] Dark mode works
- [x] App opens offline (production build)
- [x] Add to Home Screen works (served over HTTPS)
- [x] Looks good on small iPhone screens

## Roadmap (post-MVP)

Folders & tags, cloud sync, login, end-to-end encryption, AI features
(summarize / rewrite / semantic search), OCR, and voice notes. See
`../smart_notes_agent_prompt.md` section 15 for the full roadmap.
