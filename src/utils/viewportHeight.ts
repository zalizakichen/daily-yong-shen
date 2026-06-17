const MOBILE_LAYOUT =
  "(max-width: 520px), (display-mode: standalone)";

/** 仅桌面端同步高度；移动端/PWA 用 CSS 100dvh，避免 innerHeight 测矮出黑边 */
export function bindViewportHeight(): void {
  const root = document.documentElement;
  const mobileMq = window.matchMedia(MOBILE_LAYOUT);

  const sync = () => {
    if (mobileMq.matches) {
      root.style.removeProperty("--app-height");
      return;
    }
    const height = window.visualViewport?.height ?? window.innerHeight;
    root.style.setProperty("--app-height", `${height}px`);
  };

  sync();
  mobileMq.addEventListener("change", sync);
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync, { passive: true });
}
