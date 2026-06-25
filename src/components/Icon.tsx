import type { ReactNode } from 'react';

export type IconName =
  | 'pin'
  | 'pinSlash'
  | 'trash'
  | 'share'
  | 'link'
  | 'copy'
  | 'markdown'
  | 'checklist'
  | 'sun'
  | 'moon'
  | 'system'
  | 'ellipsis'
  | 'pencil'
  | 'compose'
  | 'search'
  | 'mic'
  | 'chevronLeft'
  | 'docText';

// SF Symbols-style monochrome glyphs (stroke = currentColor). Filled bits set
// their own fill/stroke so they override the stroke default on the <svg>.
const fill = { fill: 'currentColor', stroke: 'none' } as const;

const glyphs: Record<IconName, ReactNode> = {
  pin: (
    <>
      <path d="M9 3.5h6l-.7 5 2.7 2.7v1.3H7v-1.3l2.7-2.7-.7-5z" />
      <path d="M12 12.5V21" />
    </>
  ),
  pinSlash: (
    <>
      <path d="M9 3.5h6l-.7 5 2.7 2.7v1.3H7v-1.3l2.7-2.7-.7-5z" />
      <path d="M12 12.5V21" />
      <path d="M4 4l16 16" />
    </>
  ),
  trash: (
    <>
      <path d="M4 6.5h16" />
      <path d="M9 6.5V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5" />
      <path d="M6.5 6.5 7.5 20a2 2 0 0 0 2 1.9h5a2 2 0 0 0 2-1.9l1-13.5" />
      <path d="M10 10.5v6.5M14 10.5v6.5" />
    </>
  ),
  share: (
    <>
      <path d="M12 15.5V4" />
      <path d="M8 7.5 12 3.5l4 4" />
      <path d="M6 11.5v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
    </>
  ),
  link: (
    <>
      <path d="M10 13.2a4.5 4.5 0 0 0 6.4 0l2.7-2.7a4.5 4.5 0 0 0-6.4-6.4l-1.5 1.5" />
      <path d="M14 10.8a4.5 4.5 0 0 0-6.4 0l-2.7 2.7a4.5 4.5 0 0 0 6.4 6.4l1.5-1.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.2" />
      <path d="M5 15H4.5a2 2 0 0 1-2-2V4.5a2 2 0 0 1 2-2H13a2 2 0 0 1 2 2V5" />
    </>
  ),
  markdown: (
    <>
      <path d="M7 3.5h7L18 7.5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" />
      <path d="M12 10v5M9.6 12.6 12 15l2.4-2.4" />
    </>
  ),
  checklist: (
    <>
      <path d="M3.5 6l1.3 1.3L7.5 4.6" />
      <path d="M3.5 12l1.3 1.3L7.5 10.6" />
      <path d="M3.5 18l1.3 1.3L7.5 16.6" />
      <path d="M10.5 6H20M10.5 12H20M10.5 18H20" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.2M12 19.3v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />,
  system: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 0 0 18z" {...fill} />
    </>
  ),
  ellipsis: (
    <>
      <circle cx="5.5" cy="12" r="1.7" {...fill} />
      <circle cx="12" cy="12" r="1.7" {...fill} />
      <circle cx="18.5" cy="12" r="1.7" {...fill} />
    </>
  ),
  pencil: <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z" />,
  compose: (
    <>
      <path d="M19 9.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8.5" />
      <path d="M17.5 3.5a2 2 0 0 1 2.9 2.8L13 14l-3.5.9.9-3.5 7.1-7.9z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20.5 20.5 16 16" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
      <path d="M12 18v3M9 21h6" />
    </>
  ),
  chevronLeft: <path d="M15 5.5 8.5 12l6.5 6.5" />,
  docText: (
    <>
      <path d="M7 3.5h7L18.5 8v12.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M13.5 3.5V8H18M8.5 12h7M8.5 15.5h7M8.5 8.5h2" />
    </>
  ),
};

export function Icon({
  name,
  className = '',
  strokeWidth = 1.8,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {glyphs[name]}
    </svg>
  );
}
