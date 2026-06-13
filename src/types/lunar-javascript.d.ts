declare module "lunar-javascript" {
  export class Solar {
    static fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    getYear(): number;
  }

  export class Lunar {
    getEightChar(): EightChar;
    getMonthInGanZhi(): string;
    getDayInGanZhi(): string;
    getYearInGanZhi(): string;
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear;
    getGanZhi(): string;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYun(gender: number): Yun;
  }

  export class Yun {
    getDaYun(): DaYun[];
  }

  export class DaYun {
    getStartYear(): number;
    getEndYear(): number;
    getGanZhi(): string;
  }
}
