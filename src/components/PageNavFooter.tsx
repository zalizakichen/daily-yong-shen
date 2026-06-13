type Props = {
  onPrev: () => void;
  onNext?: () => void;
  hideNext?: boolean;
};

export default function PageNavFooter({ onPrev, onNext, hideNext = false }: Props) {
  return (
    <footer className="page-footer page-footer--nav">
      <button
        type="button"
        className="nav-btn"
        onClick={onPrev}
        aria-label="上一页"
      >
        &lt;
      </button>
      {!hideNext && onNext ? (
        <button
          type="button"
          className="nav-btn"
          onClick={onNext}
          aria-label="下一页"
        >
          &gt;
        </button>
      ) : null}
    </footer>
  );
}
