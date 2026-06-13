export type WuXingElement = "木" | "火" | "土" | "金" | "水";

export const WU_XING_RING: WuXingElement[] = ["木", "火", "土", "金", "水"];

export const FIXED_SLOT_ELEMENTS: Partial<Record<number, WuXingElement>> = {
  0: "木",
  1: "火",
  3: "金",
};

export const PUZZLE_SLOTS = [2, 4] as const;
export type PuzzleSlot = (typeof PUZZLE_SLOTS)[number];

export const PUZZLE_PIECES: WuXingElement[] = ["土", "水"];

export const CORRECT_PUZZLE: Record<PuzzleSlot, WuXingElement> = {
  2: "土",
  4: "水",
};

export function validateWuXingRing(
  placements: Record<PuzzleSlot, WuXingElement | null>,
): boolean {
  return (
    placements[2] === CORRECT_PUZZLE[2] && placements[4] === CORRECT_PUZZLE[4]
  );
}

export function getRingPosition(
  index: number,
  radius: number,
  center: number,
): { x: number; y: number } {
  const angleDeg = -90 + index * 72;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(angleRad),
    y: center + radius * Math.sin(angleRad),
  };
}

export function isPuzzleSlot(index: number): index is PuzzleSlot {
  return index === 2 || index === 4;
}
