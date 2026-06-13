import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

const SHICHEN_TABLE = [
  { zhi: "子", time: "23:00-00:59" },
  { zhi: "丑", time: "01:00-02:59" },
  { zhi: "寅", time: "03:00-04:59" },
  { zhi: "卯", time: "05:00-06:59" },
  { zhi: "辰", time: "07:00-08:59" },
  { zhi: "巳", time: "09:00-10:59" },
  { zhi: "午", time: "11:00-12:59" },
  { zhi: "未", time: "13:00-14:59" },
  { zhi: "申", time: "15:00-16:59" },
  { zhi: "酉", time: "17:00-18:59" },
  { zhi: "戌", time: "19:00-20:59" },
  { zhi: "亥", time: "21:00-22:59" },
];

export default function GanZhiHourPage({ onPrev, onNext }: Props) {
  return (
    <div className="page gan-zhi-hour-page">
      <main className="page-main page-main--learn">
        <article className="learn-article">
          <div className="day-master-block">
            <p className="day-master-desc">
              时干支：
              <br />
              时支即是出生时所在的时辰：
            </p>
            <div className="shichen-table-wrap">
              <table className="shichen-table shichen-table--horizontal">
                <tbody>
                  <tr>
                    {SHICHEN_TABLE.map((row) => (
                      <td key={row.zhi} className="shichen-table-zhi">
                        {row.zhi}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    {SHICHEN_TABLE.map((row) => (
                      <td key={row.zhi} className="shichen-table-time">
                        <span className="shichen-table-time-text">{row.time}</span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="day-master-desc">
              时干的取用规则类似月干，以日柱的天干推算，用的是“五鼠遁日诀”：
            </p>
            <p className="day-master-desc">
              甲己还生甲，乙庚丙作初。
              <br />
              丙辛从戊起，丁壬庚子居。
              <br />
              戊癸何方发？壬子是真途。
            </p>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
