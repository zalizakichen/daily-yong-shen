const MOBILE_LAYOUT = "(max-width: 420px), (display-mode: standalone)";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function isInsideScrollable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;

  let node: Element | null = target;
  while (node && node !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(node);
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 1
    ) {
      return true;
    }
    node = node.parentElement;
  }

  return false;
}

/** 防 iOS 橡皮筋，不锁 html/body 高度，避免 PWA 底边黑条 */
export function installScrollLock(): void {
  const mq = window.matchMedia(MOBILE_LAYOUT);

  const onTouchMove = (event: TouchEvent) => {
    if (!mq.matches || isEditableTarget(event.target)) return;
    if (isInsideScrollable(event.target)) return;
    event.preventDefault();
  };

  const sync = () => {
    document.removeEventListener("touchmove", onTouchMove);
    if (mq.matches) {
      document.addEventListener("touchmove", onTouchMove, { passive: false });
    }
  };

  sync();
  mq.addEventListener("change", sync);
}
