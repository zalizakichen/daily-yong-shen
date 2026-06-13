import TypewriterText from "../components/TypewriterText";

type Props = {
  onDirectStart: () => void;
  onLearnFirst: () => void;
};

export default function YongShenQuestionPage({
  onDirectStart,
  onLearnFirst,
}: Props) {
  return (
    <div className="page question-page">

      <main className="page-main">
        <TypewriterText text="你知道什么是用神吗？" />
        <div className="option-group">
          <button type="button" className="option-btn" onClick={onDirectStart}>
            是的，直接开始
          </button>
          <button type="button" className="option-btn" onClick={onLearnFirst}>
            不，先教教我
          </button>
        </div>
      </main>
    </div>
  );
}
