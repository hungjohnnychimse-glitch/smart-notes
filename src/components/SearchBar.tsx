import { useUIStore } from '../store/uiStore';
import { Icon } from './Icon';

type Props = {
  active: boolean;
  onActiveChange: (active: boolean) => void;
};

export function SearchBar({ active, onActiveChange }: Props) {
  const search = useUIStore((s) => s.search);
  const setSearch = useUIStore((s) => s.setSearch);

  function cancel() {
    setSearch('');
    onActiveChange(false);
    (document.activeElement as HTMLElement | null)?.blur?.();
  }

  return (
    <div className="mb-4 flex items-center">
      <div className="relative flex-1">
        <Icon
          name="search"
          strokeWidth={2.2}
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ios-2nd"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => onActiveChange(true)}
          placeholder="Search"
          aria-label="Search notes"
          className="h-9 w-full rounded-[10px] bg-ios-search pl-8 pr-9 text-[17px] text-ios-text outline-none placeholder:text-ios-2nd"
        />
        {/* Mic affordance (decorative), shown only on an empty field like iOS. */}
        {!search && (
          <Icon
            name="mic"
            className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ios-2nd"
          />
        )}
      </div>
      {/* Cancel slides in from the right while searching (iOS behaviour). */}
      <button
        onClick={cancel}
        aria-hidden={!active}
        tabIndex={active ? 0 : -1}
        className="overflow-hidden whitespace-nowrap text-[17px] text-accent transition-all duration-300"
        style={{
          maxWidth: active ? 72 : 0,
          opacity: active ? 1 : 0,
          marginLeft: active ? 8 : 0,
        }}
      >
        Cancel
      </button>
    </div>
  );
}
