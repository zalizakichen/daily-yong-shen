type Props = {
  onBack: () => void;
};

export default function BackNavFooter({ onBack }: Props) {
  return (
    <footer className="page-footer page-footer--nav page-footer--back-only">
      <button
        type="button"
        className="nav-btn"
        onClick={onBack}
        aria-label="返回"
      >
        &lt;
      </button>
    </footer>
  );
}
