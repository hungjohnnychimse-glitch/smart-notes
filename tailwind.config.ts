import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // iOS-style semantic colors, theme-switched via CSS vars (see globals.css).
        accent: 'var(--ios-accent)',
        paper: 'var(--ios-row)',
        'ios-bg': 'var(--ios-bg)',
        'ios-row': 'var(--ios-row)',
        'ios-row2': 'var(--ios-row-press)',
        'ios-sep': 'var(--ios-sep)',
        'ios-2nd': 'var(--ios-secondary)',
        'ios-search': 'var(--ios-search)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
