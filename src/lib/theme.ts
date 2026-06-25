export type ThemePref = 'light' | 'dark' | 'system';

const KEY = 'smart-notes-theme';

export function loadThemePref(): ThemePref {
  const v = localStorage.getItem(KEY);
  return v === 'light' || v === 'dark' ? v : 'system';
}

export function saveThemePref(pref: ThemePref): void {
  if (pref === 'system') localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, pref);
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/** Resolve a preference to an effective theme and toggle the `dark` class. */
export function applyTheme(pref: ThemePref): void {
  const dark = pref === 'dark' || (pref === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
}
