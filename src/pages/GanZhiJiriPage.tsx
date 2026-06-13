import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function GanZhiJiriPage({ onPrev, onNext }: Props) {
  return (
    <div className="page gan-zhi-jiri-page">
      <main className="page-main page-main--learn">
        <article className="learn-article">
          <h1 className="learn-title">干支纪日法</h1>
          <div className="day-master-block">
            <p className="day-master-desc">
              以一个天干和一个地支，按次序搭配起来记载日期的方法，就是“干支纪日法”。
            </p>
            <p className="day-master-desc">
              10个天干搭配12个地支，按排列组合的方法，可产生10×12=120个干支组合。但先哲规定第奇数个的天干只能搭配第奇数个的地支，第偶数个的天干只能搭配第偶数个的地支。举例来说，甲子之后是乙丑，而不是甲丑。
            </p>
            <p className="day-master-desc">
              因此，实际上有5×6+5×6=60个干支组合。从甲子开始，至癸亥终了，称为“六十甲子”。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
