export type DirectionValue =
  | "east"
  | "southeast"
  | "south"
  | "southwest"
  | "west"
  | "northwest"
  | "north"
  | "northeast";

export const DIRECTION_OPTIONS: { value: DirectionValue; label: string }[] = [
  { value: "east", label: "东" },
  { value: "southeast", label: "东南" },
  { value: "south", label: "南" },
  { value: "southwest", label: "西南" },
  { value: "west", label: "西" },
  { value: "northwest", label: "西北" },
  { value: "north", label: "北" },
  { value: "northeast", label: "东北" },
];

export function formatDirection(direction: DirectionValue): string {
  return (
    DIRECTION_OPTIONS.find((item) => item.value === direction)?.label ?? "东"
  );
}

export function loadDirection(): DirectionValue {
  const raw = localStorage.getItem("travelDirection");
  const valid = DIRECTION_OPTIONS.map((item) => item.value);
  if (valid.includes(raw as DirectionValue)) {
    return raw as DirectionValue;
  }
  return "east";
}
