import { useRef, useState } from 'react';
import { formatNoteDate } from '../lib/dateFormat';
import { Icon } from './Icon';
import type { Note } from '../types/note';

type Props = {
  note: Note;
  onOpen: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
};

const ACTION_W = 150; // two 75px swipe action buttons

/** One iOS-style note row with swipe-left-to-reveal Pin / Delete actions. */
export function NoteCard({ note, onOpen, onTogglePin, onDelete }: Props) {
  const [tx, setTx] = useState(0);
  const txRef = useRef(0);
  const baseRef = useRef(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<'h' | 'v' | null>(null);
  const moved = useRef(false);

  // Keep a ref in sync so pointer handlers read the live offset, not a stale closure.
  const setX = (v: number) => {
    txRef.current = v;
    setTx(v);
  };

  const preview =
    note.contentText.split('\n').slice(1).join(' ').trim() || 'Không có nội dung';

  function onPointerDown(e: React.PointerEvent) {
    start.current = { x: e.clientX, y: e.clientY };
    baseRef.current = txRef.current;
    axis.current = null;
    moved.current = false;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;

    if (!axis.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      if (axis.current === 'h') {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* pointer may not be capturable (e.g. synthetic events) */
        }
      }
    }
    if (axis.current !== 'h') return;

    moved.current = true;
    // Rubber-band resistance past the open/closed limits (iOS feel).
    const raw = baseRef.current + dx;
    let next = raw;
    if (raw < -ACTION_W) next = -ACTION_W + (raw + ACTION_W) * 0.25;
    else if (raw > 0) next = raw * 0.25;
    setX(next);
  }

  function onPointerUp() {
    if (axis.current === 'h') {
      // Snap to the nearest detent; the spring easing gives a slight overshoot.
      setX(txRef.current <= -ACTION_W / 2 ? -ACTION_W : 0);
    }
    start.current = null;
    axis.current = null;
  }

  function handleTap() {
    if (moved.current) return; // a swipe, not a tap
    if (txRef.current !== 0) {
      setX(0); // tapping an open row closes it
      return;
    }
    onOpen(note.id);
  }

  return (
    <li className="relative overflow-hidden bg-ios-row [&:last-child_.row-fg]:border-b-0">
      {/* Swipe actions behind the row (only while open/dragging) */}
      <div
        className="absolute inset-y-0 right-0 flex"
        style={{ visibility: tx < 0 ? 'visible' : 'hidden' }}
      >
        <button
          onClick={() => {
            onTogglePin(note.id);
            setX(0);
          }}
          aria-label={note.pinned ? 'Bỏ ghim ghi chú' : 'Ghim ghi chú'}
          className="flex w-[75px] flex-col items-center justify-center gap-1 bg-[#ff9f0a] text-xs font-medium text-white"
        >
          <Icon name={note.pinned ? 'pinSlash' : 'pin'} className="h-6 w-6" />
          {note.pinned ? 'Bỏ ghim' : 'Ghim'}
        </button>
        <button
          onClick={() => onDelete(note.id)}
          aria-label="Xóa ghi chú"
          className="flex w-[75px] flex-col items-center justify-center gap-1 bg-[#ff3b30] text-xs font-medium text-white"
        >
          <Icon name="trash" className="h-6 w-6" />
          Xóa
        </button>
      </div>

      {/* Foreground row */}
      <div
        role="button"
        tabIndex={0}
        aria-label={`Mở ghi chú: ${note.title || 'Ghi chú mới'}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpen(note.id);
          }
        }}
        style={{
          transform: `translateX(${tx}px)`,
          transition: start.current
            ? 'none'
            : 'transform 0.32s cubic-bezier(0.25, 1.25, 0.5, 1)',
        }}
        className="row-fg relative ml-4 cursor-default select-none border-b border-ios-sep bg-ios-row py-2.5 pr-4 active:bg-ios-row2"
      >
        <p className="truncate text-[17px] font-semibold leading-tight">
          {note.title || 'Ghi chú mới'}
        </p>
        <p className="mt-0.5 flex gap-1.5 truncate text-[15px] text-ios-2nd">
          <span className="shrink-0">{formatNoteDate(note.updatedAt)}</span>
          <span className="truncate">{preview}</span>
        </p>
      </div>
    </li>
  );
}
