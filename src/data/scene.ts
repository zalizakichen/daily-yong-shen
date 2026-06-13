export type SceneValue = "home" | "office" | "field" | "campus";

export const SCENE_OPTIONS: { value: SceneValue; label: string }[] = [
  { value: "home", label: "居家" },
  { value: "office", label: "办公室" },
  { value: "field", label: "外勤" },
  { value: "campus", label: "校园" },
];

export function formatScene(scene: SceneValue): string {
  return SCENE_OPTIONS.find((item) => item.value === scene)?.label ?? "居家";
}

export function loadScene(): SceneValue {
  const raw = localStorage.getItem("timeScene");
  const valid = SCENE_OPTIONS.map((item) => item.value);
  if (valid.includes(raw as SceneValue)) {
    return raw as SceneValue;
  }
  return "home";
}
