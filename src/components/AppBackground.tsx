import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const MOBILE_BG_QUERY = "(max-width: 520px), (display-mode: standalone)";

function useMobileBackground() {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_BG_QUERY).matches,
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

  if (mobile) {
    return createPortal(img, document.body);
  }

  return img;
}
