/** iOS PWA：CSS 视口单位常比真实屏幕矮，用 innerHeight 驱动布局与背景高度 */
export function bindViewportHeight(): void {
  const root = document.documentElement;

  const sync = () => {
    const height = window.visualViewport?.height ?? window.innerHeight;
    root.style.setProperty("--app-height", `${height}px`);
    root.style.setProperty("--app-width", `${window.innerWidth}px`);
  };

  sync();
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync, { passive: true });
}
