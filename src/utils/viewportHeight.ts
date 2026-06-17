function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readViewportHeight(): number {
  const vv = window.visualViewport;
  return Math.max(
    window.innerHeight,
    document.documentElement.clientHeight,
    vv ? Math.round(vv.height + vv.offsetTop) : 0,
  );
}

let syncViewport: (() => void) | null = null;

export function resyncViewportHeight(): void {
  syncViewport?.();
}

/** 浏览器模式用 innerHeight；主屏幕 PWA 交给 CSS 100% 填满，避免测矮 */
export function bindViewportHeight(): void {
  const root = document.documentElement;
  const standalone = isStandalonePwa();

  if (standalone) {
    root.classList.add("pwa-standalone");
  }

  const sync = () => {
    if (!standalone) {
      root.style.setProperty("--app-height", `${readViewportHeight()}px`);
      root.style.setProperty("--app-width", `${window.innerWidth}px`);
    } else {
      root.style.removeProperty("--app-height");
      root.style.removeProperty("--app-width");
    }
  };

  sync();
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync, { passive: true });

  syncViewport = sync;
}

export { isStandalonePwa };
