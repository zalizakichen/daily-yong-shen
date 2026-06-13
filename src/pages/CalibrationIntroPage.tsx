import TypewriterText from "../components/TypewriterText";
import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function CalibrationIntroPage({ onPrev, onNext }: Props) {
  return (
    <div className="page calibration-intro-page">

      <main className="page-main">
        <TypewriterText
          text={"请回答几个简单的问题\n帮助我校准你的气场"}
          className="typewriter-title typewriter-title--multiline"
        />
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
