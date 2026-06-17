/** 移动端 Safari 地址栏变化时，用 innerHeight 同步布局高度 */
export function bindViewportHeight(): void {
  const root = document.documentElement;

  const sync = () => {
    const height = window.visualViewport?.height ?? window.innerHeight;
    root.style.setProperty("--app-height", `${height}px`);
  };

  sync();
  window.addEventListener("resize", sync, { passive: true });
  window.addEventListener("orientationchange", sync, { passive: true });
  window.visualViewport?.addEventListener("resize", sync, { passive: true });
}
