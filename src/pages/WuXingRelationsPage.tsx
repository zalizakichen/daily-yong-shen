import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

export default function WuXingRelationsPage({ onPrev, onNext }: Props) {
  return (
    <div className="page wu-xing-relations-page">
      <main className="page-main page-main--learn">
        <article className="learn-article">
          <div className="day-master-block">
            <p className="day-master-desc">
              很棒！五行是华夏民族的集体记忆，它们之间的关系非常简单：
            </p>
            <p className="day-master-desc">
              相生：木生火，火生土，土生金，金生水，水生木
            </p>
            <p className="day-master-desc">
              相克：木克土，土克水，水克火，火克金，金克木
            </p>
            <p className="day-master-desc">
              先哲们认为宇宙的运行所伴随的是五行须臾不停的消长、流转，他们把人出生片刻对应的宇宙状态看作人的先天禀赋，这种禀赋的凝结即先哲口中的“命”。而这初禀之气的描述方式就是
            </p>
            <p className="learn-title learn-title--suffix">八字。</p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
