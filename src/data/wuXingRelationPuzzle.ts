export type RelationLabel = "生" | "克";

export const RELATION_POOL_LABELS: RelationLabel[] = ["生", "克"];

export const RELATION_ARROW_IDS = ["水-木", "水-火", "土-水"] as const;
export type RelationArrowId = (typeof RELATION_ARROW_IDS)[number];

export const CORRECT_RELATION_LABELS: Record<RelationArrowId, RelationLabel> = {
  "水-木": "生",
  "水-火": "克",
  "土-水": "克",
};

export const RELATION_PUZZLE_ERROR_HINT = "提示：水生木，水克火，土克水";

export function createEmptyRelationPlacements(): Record<
  RelationArrowId,
  RelationLabel | null
> {
  return {
    "水-木": null,
    "水-火": null,
    "土-水": null,
  };
}

export const CORRECT_RELATION_PLACEMENTS: Record<
  RelationArrowId,
  RelationLabel
> = {
  "水-木": CORRECT_RELATION_LABELS["水-木"],
  "水-火": CORRECT_RELATION_LABELS["水-火"],
  "土-水": CORRECT_RELATION_LABELS["土-水"],
};

export function validateRelationPlacements(
  placements: Record<RelationArrowId, RelationLabel | null>,
): boolean {
  return RELATION_ARROW_IDS.every(
    (id) => placements[id] === CORRECT_RELATION_LABELS[id],
  );
}
