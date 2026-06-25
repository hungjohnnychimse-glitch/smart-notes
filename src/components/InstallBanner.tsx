import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { INSTALL_DISMISS_KEY, isIos, isStandalone } from '../lib/pwa';

function loadDismissed(): boolean {
  try {
    return localStorage.getItem(INSTALL_DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function saveDismissed(): void {
  try {
    localStorage.setItem(INSTALL_DISMISS_KEY, '1');
  } catch {
    // If storage is unavailable, we still allow the user to dismiss for now.
  }
}

export function InstallBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(loadDismissed());
  }, []);

  if (!isIos() || isStandalone() || dismissed) return null;

  return (
    <section className="mb-4 rounded-2xl border border-ios-sep bg-ios-row p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ios-search text-accent">
          <Icon name="share" className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-semibold leading-5 text-ios-text">
            Thêm Ghi chú vào Màn hình chính
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-ios-2nd">
            Trong Safari, chạm nút Chia sẻ rồi chọn “Thêm vào Màn hình chính”.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-ios-2nd">
            <span className="rounded-full bg-ios-search px-2.5 py-1">1. Chia sẻ</span>
            <span className="rounded-full bg-ios-search px-2.5 py-1">2. Thêm vào MH chính</span>
            <span className="rounded-full bg-ios-search px-2.5 py-1">3. Thêm</span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Ẩn hướng dẫn"
          onClick={() => {
            saveDismissed();
            setDismissed(true);
          }}
          className="rounded-full px-1.5 py-1 text-ios-2nd active:opacity-60"
        >
          ×
        </button>
      </div>
    </section>
  );
}
