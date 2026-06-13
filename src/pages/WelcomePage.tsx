import { useEffect, useRef, useState } from "react";
import TypewriterText from "../components/TypewriterText";

type Props = {
  userName: string;
  onUserNameChange: (name: string) => void;
  onNext: () => void;
};

export default function WelcomePage({
  userName,
  onUserNameChange,
  onNext,
}: Props) {
  const [draft, setDraft] = useState(userName);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!isComposingRef.current) {
      setDraft(userName);
    }
  }, [userName]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    if (!isComposingRef.current) {
      onUserNameChange(next);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (
    event: React.CompositionEvent<HTMLInputElement>,
  ) => {
    isComposingRef.current = false;
    const next = event.currentTarget.value;
    setDraft(next);
    onUserNameChange(next);
  };

  return (
    <div className="page welcome-page">

      <main className="page-main">
        <TypewriterText text="我要怎么称呼你？" />
        <label className="name-input-wrap">
          <input
            type="text"
            className="name-input"
            value={draft}
            onChange={handleChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="输入你的名字"
            autoComplete="nickname"
            enterKeyHint="done"
          />
          <span className="name-input-line" />
        </label>
      </main>

      <footer className="page-footer">
        <button
          type="button"
          className="next-btn"
          onClick={onNext}
          aria-label="下一页"
        >
          &gt;
        </button>
      </footer>
    </div>
  );
}
