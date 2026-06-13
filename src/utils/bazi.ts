import { Solar } from "lunar-javascript";
import type { BirthdayValue } from "../components/DateWheelPicker";

export type BaziPillar = {
  label: string;
  stem: string;
  branch: string;
};

export type BaziResult = {
  pillars: BaziPillar[];
  dayStem: string;
};

export const SHICHEN_HOUR: Record<string, number> = {
  "zi-early": 0,
  chou: 1,
  yin: 3,
  mao: 5,
  chen: 7,
  si: 9,
  wu: 11,
  wei: 13,
  shen: 15,
  you: 17,
  xu: 19,
  hai: 21,
  "zi-late": 23,
};

export function calculateBazi(
  birthday: BirthdayValue,
  shichenId: string,
): BaziResult {
  const hour = SHICHEN_HOUR[shichenId] ?? 0;
  const solar = Solar.fromYmdHms(
    birthday.year,
    birthday.month,
    birthday.day,
    hour,
    0,
    0,
  );
  const eightChar = solar.getLunar().getEightChar();

  return {
    pillars: [
      {
        label: "年柱",
        stem: eightChar.getYearGan(),
        branch: eightChar.getYearZhi(),
      },
      {
        label: "月柱",
        stem: eightChar.getMonthGan(),
        branch: eightChar.getMonthZhi(),
      },
      {
        label: "日柱",
        stem: eightChar.getDayGan(),
        branch: eightChar.getDayZhi(),
      },
      {
        label: "时柱",
        stem: eightChar.getTimeGan(),
        branch: eightChar.getTimeZhi(),
      },
    ],
    dayStem: eightChar.getDayGan(),
  };
}
