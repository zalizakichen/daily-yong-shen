function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function readViewportHeight(): number {
  const vv = window.visualViewport;
  const candidates = [
    window.innerHeight,
    document.documentElement.clientHeight,
    vv ? Math.round(vv.height + vv.offsetTop) : 0,
  ];
  return Math.max(...candidates);
}

function measureBackgroundGap(): number {
  const bg = document.querySelector<HTMLElement>(".page-bg");
  if (!bg) return 0;

  const bottom = bg.getBoundingClientRect().bottom;
  const viewportBottom = window.visualViewport
    ? window.visualViewport.offsetTop + window.visualViewport.height
    : window.innerHeight;

  return Math.max(0, Math.ceil(viewportBottom - bottom));
}

function applyBackgroundBleed(root: HTMLElement, gap: number): void {
  const bleed = Math.max(gap + 12, isStandalonePwa() ? 40 : 0);
  root.style.setProperty("--pwa-bottom-bleed", `${bleed}px`);

  const bg = document.querySelector<HTMLElement>(".page-bg");
  if (!bg) return;

  bg.style.bottom = `-${bleed}px`;
  bg.style.height = `calc(var(--app-height, 100vh) + ${bleed}px)`;
}

function syncBackgroundBleed(root: HTMLElement): void {
  if (!isStandalonePwa()) return;

  const gap = measureBackgroundGap();
  applyBackgroundBleed(root, gap);

  if (gap > 2) {
    requestAnimationFrame(() => {
      const nextGap = measureBackgroundGap();
      if (nextGap > 2) applyBackgroundBleed(root, nextGap);
    });
  }
}

let syncViewport: (() => void) | null = null;

export function resyncViewportHeight(): void {
  syncViewport?.();
}

/** iOS PWA：CSS 视口高度不可靠，用 innerHeight + 实测底边缝隙补偿 */
export function bindViewportHeight(): void {
  const root = document.documentElement;
  const standalone = isStandalonePwa();

  if (standalone) {
    root.classList.add("pwa-standalone");
  }

  const sync = () => {
    root.style.setProperty("--app-height", `${readViewportHeight()}px`);
    root.style.setProperty("--app-width", `${window.innerWidth}px`);
    syncBackgroundBleed(root);
  };

  sync();
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync, { passive: true });
  window.visualViewport?.addEventListener("scroll", sync, { passive: true });
  window.addEventListener("load", sync, { passive: true });

  const bg = document.querySelector<HTMLImageElement>(".page-bg");
  if (bg && !bg.complete) {
    bg.addEventListener("load", sync, { once: true });
  }

  requestAnimationFrame(sync);
  setTimeout(sync, 120);
  setTimeout(sync, 400);

  syncViewport = sync;
}
