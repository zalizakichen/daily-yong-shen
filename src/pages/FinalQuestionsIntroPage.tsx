import TypewriterText from "../components/TypewriterText";
import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function FinalQuestionsIntroPage({ onPrev, onNext }: Props) {
  return (
    <div className="page final-questions-intro-page">

      <main className="page-main">
        <TypewriterText
          text={"最后两个问题\n让我的推荐更加有用"}
          className="typewriter-title typewriter-title--multiline"
        />
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
