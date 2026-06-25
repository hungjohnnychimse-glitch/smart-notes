import { create } from 'zustand';
import { applyTheme, loadThemePref, saveThemePref, type ThemePref } from '../lib/theme';

type UIState = {
  selectedNoteId: string | null;
  search: string;
  theme: ThemePref;
  openNote: (id: string) => void;
  closeNote: () => void;
  setSearch: (q: string) => void;
  setTheme: (t: ThemePref) => void;
  cycleTheme: () => void;
};

const initialTheme = loadThemePref();
applyTheme(initialTheme);

const ORDER: ThemePref[] = ['system', 'light', 'dark'];

export const useUIStore = create<UIState>((set, get) => ({
  selectedNoteId: null,
  search: '',
  theme: initialTheme,
  openNote: (id) => set({ selectedNoteId: id }),
  closeNote: () => set({ selectedNoteId: null }),
  setSearch: (q) => set({ search: q }),
  setTheme: (t) => {
    saveThemePref(t);
    applyTheme(t);
    set({ theme: t });
  },
  cycleTheme: () => {
    const next = ORDER[(ORDER.indexOf(get().theme) + 1) % ORDER.length];
    get().setTheme(next);
  },
}));
