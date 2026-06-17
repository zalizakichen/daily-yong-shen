import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { resyncViewportHeight } from "../utils/viewportHeight";

const MOBILE_BG_QUERY = "(max-width: 520px), (display-mode: standalone)";

function isStandalonePwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function useMobileBackground() {
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== "undefined" &&
      (window.matchMedia(MOBILE_BG_QUERY).matches || isStandalonePwa()),
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BG_QUERY);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return mobile;
}

export default function AppBackground() {
  const mobile = useMobileBackground();
  const img = <img className="page-bg" src="/background.png" alt="" aria-hidden="true" />;

  useEffect(() => {
    resyncViewportHeight();
    const t1 = window.setTimeout(resyncViewportHeight, 50);
    const t2 = window.setTimeout(resyncViewportHeight, 300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mobile]);

  if (mobile) {
    return createPortal(img, document.body);
  }

  return img;
}
