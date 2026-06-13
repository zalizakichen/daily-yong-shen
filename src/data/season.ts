export type SeasonValue = "spring" | "summer" | "autumn" | "winter" | "transition";

export const SEASON_OPTIONS: { value: SeasonValue; label: string }[] = [
  { value: "spring", label: "春" },
  { value: "summer", label: "夏" },
  { value: "autumn", label: "秋" },
  { value: "winter", label: "冬" },
  { value: "transition", label: "四季更替时" },
];

export function formatSeason(season: SeasonValue): string {
  return SEASON_OPTIONS.find((item) => item.value === season)?.label ?? "春";
}

export function loadSeason(): SeasonValue {
  const raw = localStorage.getItem("comfortSeason");
  if (
    raw === "spring" ||
    raw === "summer" ||
    raw === "autumn" ||
    raw === "winter" ||
    raw === "transition"
  ) {
    return raw;
  }
  return "spring";
}
