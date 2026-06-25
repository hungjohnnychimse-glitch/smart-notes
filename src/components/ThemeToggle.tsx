import { useUIStore } from '../store/uiStore';
import { Icon, type IconName } from './Icon';

const FACE: Record<string, { icon: IconName; label: string }> = {
  system: { icon: 'system', label: 'Giao diện: Tự động' },
  light: { icon: 'sun', label: 'Giao diện: Sáng' },
  dark: { icon: 'moon', label: 'Giao diện: Tối' },
};

export function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const cycleTheme = useUIStore((s) => s.cycleTheme);
  const face = FACE[theme];

  return (
    <button
      onClick={cycleTheme}
      aria-label={face.label}
      title={face.label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-accent active:scale-95"
    >
      <Icon name={face.icon} className="h-[22px] w-[22px]" />
    </button>
  );
}
