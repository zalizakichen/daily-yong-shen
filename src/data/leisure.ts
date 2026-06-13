export type LeisureValue = "social" | "outdoor" | "home";

export const LEISURE_OPTIONS: { value: LeisureValue; label: string }[] = [
  { value: "social", label: "聚会社交" },
  { value: "outdoor", label: "运动郊游" },
  { value: "home", label: "居家放松" },
];

export function formatLeisure(leisure: LeisureValue): string {
  return LEISURE_OPTIONS.find((item) => item.value === leisure)?.label ?? "聚会社交";
}

export function loadLeisure(): LeisureValue {
  const raw = localStorage.getItem("leisureStyle");
  const valid = LEISURE_OPTIONS.map((item) => item.value);
  if (valid.includes(raw as LeisureValue)) {
    return raw as LeisureValue;
  }
  return "social";
}
