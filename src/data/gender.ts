export type GenderValue = "unset" | "male" | "female";

export const GENDER_OPTIONS: { value: GenderValue; label: string }[] = [
  { value: "unset", label: "请选择" },
  { value: "male", label: "男" },
  { value: "female", label: "女" },
];

export function formatGender(gender: GenderValue): string {
  return GENDER_OPTIONS.find((item) => item.value === gender)?.label ?? "请选择";
}

export function loadGender(): GenderValue {
  const raw = localStorage.getItem("userGender");
  if (raw === "male" || raw === "female") return raw;
  return "unset";
}
