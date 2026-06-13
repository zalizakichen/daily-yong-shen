import PageNavFooter from "../components/PageNavFooter";

type Props = {
  onPrev: () => void;
  onNext: () => void;
};

type SpanCell = {
  text: string;
  colSpan: number;
};

const STEM_NAMES = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const STEM_YIN_YANG = ["+", "-", "+", "-", "+", "-", "+", "-", "+", "-"];
const STEM_WU_XING: SpanCell[] = [
  { text: "木", colSpan: 2 },
  { text: "火", colSpan: 2 },
  { text: "土", colSpan: 2 },
  { text: "金", colSpan: 2 },
  { text: "水", colSpan: 2 },
];

const BRANCH_NAMES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
];
const BRANCH_YIN_YANG = ["+", "-", "+", "-", "+", "-", "+", "-", "+", "-", "+", "-"];
const BRANCH_WU_XING: SpanCell[] = [
  { text: "水", colSpan: 1 },
  { text: "土", colSpan: 1 },
  { text: "木", colSpan: 2 },
  { text: "土", colSpan: 1 },
  { text: "火", colSpan: 2 },
  { text: "土", colSpan: 1 },
  { text: "金", colSpan: 2 },
  { text: "土", colSpan: 1 },
  { text: "水", colSpan: 1 },
];

function SpanRow({ label, cells }: { label: string; cells: SpanCell[] }) {
  return (
    <tr>
      <th className="gan-zhi-relation-row-label">{label}</th>
      {cells.map((cell, index) => (
        <td key={`${label}-${index}`} colSpan={cell.colSpan}>
          {cell.text}
        </td>
      ))}
    </tr>
  );
}

function ValueRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr>
      <th className="gan-zhi-relation-row-label">{label}</th>
      {values.map((value, index) => (
        <td key={`${label}-${index}`}>{value}</td>
      ))}
    </tr>
  );
}

export default function GanZhiWuXingPage({ onPrev, onNext }: Props) {
  return (
    <div className="page gan-zhi-wu-xing-page">
      <main className="page-main page-main--learn page-main--learn-scroll">
        <article className="learn-article">
          <h1 className="learn-title">干支与五行的关系</h1>
          <div className="day-master-block">
            <p className="day-master-desc">
              现在我们了解了八字的排法，那要如何从八字当中看出一个人与生俱来的初禀之气呢？
            </p>
            <p className="day-master-desc">
              其实，天干地支还具有阴阳和五行的内涵，干支与阴阳五行的基本关系可以表述为：
            </p>
            <div className="gan-zhi-relation-table-wrap">
              <table className="gan-zhi-relation-table gan-zhi-relation-table--horizontal gan-zhi-relation-table--stem">
                <tbody>
                  <ValueRow label="天干" values={STEM_NAMES} />
                  <ValueRow label="阴阳" values={STEM_YIN_YANG} />
                  <SpanRow label="五行" cells={STEM_WU_XING} />
                </tbody>
              </table>
            </div>
            <div className="gan-zhi-relation-table-wrap">
              <table className="gan-zhi-relation-table gan-zhi-relation-table--horizontal gan-zhi-relation-table--branch">
                <tbody>
                  <ValueRow label="地支" values={BRANCH_NAMES} />
                  <ValueRow label="阴阳" values={BRANCH_YIN_YANG} />
                  <SpanRow label="五行" cells={BRANCH_WU_XING} />
                </tbody>
              </table>
            </div>
          </div>
        </article>
      </main>

      <PageNavFooter onPrev={onPrev} onNext={onNext} />
    </div>
  );
}
