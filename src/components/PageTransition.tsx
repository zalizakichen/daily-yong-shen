import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FADE_OUT_MS } from "../constants/motion";

type Props = {
  pageKey: number;
  children: ReactNode;
};

export default function PageTransition({ pageKey, children }: Props) {
  const [visible, setVisible] = useState(true);
  const [content, setContent] = useState(children);
  const pageKeyRef = useRef(pageKey);
  const isFirstRender = useRef(true);
  const pendingChildren = useRef(children);

  pendingChildren.current = children;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      pageKeyRef.current = pageKey;
      setContent(children);
      return;
    }

    if (pageKey === pageKeyRef.current) {
      setContent(children);
      return;
    }

    setVisible(false);
    const timer = window.setTimeout(() => {
      pageKeyRef.current = pageKey;
      setContent(pendingChildren.current);
      setVisible(true);
    }, FADE_OUT_MS);

    return () => window.clearTimeout(timer);
  }, [pageKey, children]);

  return (
    <div
      className={`page-transition${visible ? " is-visible" : " is-exiting"}`}
    >
      {content}
    </div>
  );
}
