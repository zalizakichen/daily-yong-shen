import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  createEmptyRelationPlacements,
  RELATION_ARROW_IDS,
  RELATION_POOL_LABELS,
  RELATION_PUZZLE_ERROR_HINT,
  validateRelationPlacements,
  type RelationArrowId,
  type RelationLabel,
} from "../data/wuXingRelationPuzzle";
import {
  getRingPosition,
  WU_XING_RING,
  type WuXingElement,
} from "../data/wuXingRing";

type Props = {
  counts: Record<WuXingElement, number>;
  interactive?: boolean;
  onInteraction?: () => void;
  relationPlacements?: Record<RelationArrowId, RelationLabel | null>;
  onRelationPlacementsChange?: (
    placements: Record<RelationArrowId, RelationLabel | null>,
  ) => void;
  showRelationPool?: boolean;
  className?: string;
};

export type WuXingRingDiagramHandle = {
  validateForNext: () => string | null;
  getRelationPlacements: () => Record<RelationArrowId, RelationLabel | null>;
};

type DragState = {
  label: RelationLabel;
  source: "pool" | RelationArrowId;
};

const RING_SIZE = 248;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 92;
const TOKEN_SIZE = 44;
const TOKEN_RADIUS = TOKEN_SIZE / 2;
const RELATION_TOKEN_SIZE = Math.round((TOKEN_SIZE * 2) / 3);
const COUNT_ON_LEFT: WuXingElement[] = ["金", "水"];

const RELATION_ARROWS: { id: RelationArrowId; from: WuXingElement; to: WuXingElement }[] =
  [
    { id: "水-木", from: "水", to: "木" },
    { id: "水-火", from: "水", to: "火" },
    { id: "土-水", from: "土", to: "水" },
  ];

function getElementCenter(
  element: WuXingElement,
  positions: { x: number; y: number }[],
): { x: number; y: number } {
  const index = WU_XING_RING.indexOf(element);
  return positions[index];
}

function getArrowEndpoints(
  from: { x: number; y: number },
  to: { x: number; y: number },
  radius = TOKEN_RADIUS,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;

  return {
    x1: from.x + ux * radius,
    y1: from.y + uy * radius,
    x2: to.x - ux * (radius + 4),
    y2: to.y - uy * (radius + 4),
  };
}

function getArrowMidpoint(
  from: { x: number; y: number },
  to: { x: number; y: number },
  radius = TOKEN_RADIUS,
) {
  const endpoints = getArrowEndpoints(from, to, radius);
  return {
    x: (endpoints.x1 + endpoints.x2) / 2,
    y: (endpoints.y1 + endpoints.y2) / 2,
  };
}

const WuXingRingDiagram = forwardRef<WuXingRingDiagramHandle, Props>(
  function WuXingRingDiagram(
    {
      counts,
      interactive = false,
      onInteraction,
      relationPlacements,
      onRelationPlacementsChange,
      showRelationPool = false,
      className = "",
    },
    ref,
  ) {
    const [internalPlacements, setInternalPlacements] = useState(
      createEmptyRelationPlacements,
    );
    const [dragging, setDragging] = useState<DragState | null>(null);
    const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(
      null,
    );

    const poolRef = useRef<HTMLDivElement>(null);
    const slotRefs = useRef<Partial<Record<RelationArrowId, HTMLDivElement>>>(
      {},
    );
    const draggingRef = useRef<DragState | null>(null);

    const ringPositions = useMemo(
      () =>
        WU_XING_RING.map((_, index) =>
          getRingPosition(index, RING_RADIUS, RING_CENTER),
        ),
      [],
    );

    const relationMidpoints = useMemo(
      () =>
        Object.fromEntries(
          RELATION_ARROWS.map(({ id, from, to }) => [
            id,
            getArrowMidpoint(
              getElementCenter(from, ringPositions),
              getElementCenter(to, ringPositions),
            ),
          ]),
        ) as Record<RelationArrowId, { x: number; y: number }>,
      [ringPositions],
    );

    const activePlacements =
      interactive && relationPlacements != null
        ? relationPlacements
        : internalPlacements;

    const commitPlacements = useCallback(
      (next: Record<RelationArrowId, RelationLabel | null>) => {
        if (onRelationPlacementsChange) {
          onRelationPlacementsChange(next);
        } else {
          setInternalPlacements(next);
        }
      },
      [onRelationPlacementsChange],
    );

    useImperativeHandle(
      ref,
      () => ({
        validateForNext: () => {
          if (!interactive) return null;
          const allPlaced = RELATION_ARROW_IDS.every(
            (id) => activePlacements[id] !== null,
          );
          if (!allPlaced) {
            return "请把「生」「克」放入箭头旁的圆圈中。";
          }
          if (!validateRelationPlacements(activePlacements)) {
            return RELATION_PUZZLE_ERROR_HINT;
          }
          return null;
        },
        getRelationPlacements: () => ({ ...activePlacements }),
      }),
      [interactive, activePlacements],
    );

    const showRelations = interactive || relationPlacements != null;
    const displayPlacements = interactive
      ? activePlacements
      : (relationPlacements ?? createEmptyRelationPlacements());
    const usesInteractiveLayout = interactive || showRelationPool;

    const assignToSlot = useCallback(
      (
        slot: RelationArrowId,
        label: RelationLabel,
        source: DragState["source"],
      ) => {
        const next = { ...activePlacements, [slot]: label };
        if (source !== "pool") {
          next[source] = null;
        }
        commitPlacements(next);
        onInteraction?.();
      },
      [activePlacements, commitPlacements, onInteraction],
    );

    const clearSlot = useCallback(
      (slot: RelationArrowId) => {
        commitPlacements({ ...activePlacements, [slot]: null });
        onInteraction?.();
      },
      [activePlacements, commitPlacements, onInteraction],
    );

    const hitTestDropTarget = useCallback(
      (clientX: number, clientY: number): RelationArrowId | "pool" | null => {
        for (const id of RELATION_ARROW_IDS) {
          const node = slotRefs.current[id];
          if (!node) continue;
          const rect = node.getBoundingClientRect();
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            return id;
          }
        }

        const poolNode = poolRef.current;
        if (poolNode) {
          const rect = poolNode.getBoundingClientRect();
          if (
            clientX >= rect.left &&
            clientX <= rect.right &&
            clientY >= rect.top &&
            clientY <= rect.bottom
          ) {
            return "pool";
          }
        }

        return null;
      },
      [],
    );

    const finishDrag = useCallback(
      (clientX: number, clientY: number) => {
        const activeDrag = draggingRef.current;
        if (!activeDrag) return;

        const target = hitTestDropTarget(clientX, clientY);
        if (target === "pool") {
          if (activeDrag.source !== "pool") {
            clearSlot(activeDrag.source);
          }
        } else if (target !== null) {
          assignToSlot(target, activeDrag.label, activeDrag.source);
        }

        draggingRef.current = null;
        setDragging(null);
        setDragPoint(null);
      },
      [assignToSlot, clearSlot, hitTestDropTarget],
    );

    useEffect(() => {
      draggingRef.current = dragging;
    }, [dragging]);

    useEffect(() => {
      if (!dragging) return;

      const handleMove = (event: PointerEvent) => {
        setDragPoint({ x: event.clientX, y: event.clientY });
      };

      const handleUp = (event: PointerEvent) => {
        finishDrag(event.clientX, event.clientY);
      };

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
      window.addEventListener("pointercancel", handleUp);

      return () => {
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        window.removeEventListener("pointercancel", handleUp);
      };
    }, [dragging, finishDrag]);

    const handlePointerDown = (
      event: ReactPointerEvent<HTMLButtonElement>,
      label: RelationLabel,
      source: DragState["source"],
    ) => {
      event.preventDefault();
      setDragging({ label, source });
      setDragPoint({ x: event.clientX, y: event.clientY });
      onInteraction?.();
    };

    const isDraggingFromSlot = (slot: RelationArrowId, label: RelationLabel) =>
      dragging?.source === slot && dragging.label === label;

    const renderLabelToken = (
      label: RelationLabel,
      source: DragState["source"],
    ) => (
      <button
        type="button"
        className={`wu-xing-token wu-xing-token--compact${
          source !== "pool" ? " wu-xing-token--placed" : ""
        }`}
        onPointerDown={(event) => handlePointerDown(event, label, source)}
        aria-label={`拖动${label}`}
      >
        {label}
      </button>
    );

    const renderStaticLabelToken = (label: RelationLabel) => (
      <span className="wu-xing-token wu-xing-token--compact wu-xing-token--placed">
        {label}
      </span>
    );

    return (
      <div
        className={`wu-xing-ring-diagram${usesInteractiveLayout ? " wu-xing-ring-diagram--interactive" : ""}${className ? ` ${className}` : ""}`}
      >
        <div className="wu-xing-ring-stage wu-xing-ring-stage--diagram">
          <div
            className="wu-xing-ring-inner"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            <svg
              className="wu-xing-ring-lines"
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              aria-hidden="true"
            >
              {WU_XING_RING.map((_, index) => {
                const from = ringPositions[index];
                const to = ringPositions[(index + 1) % WU_XING_RING.length];
                return (
                  <line
                    key={`sheng-${index}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className="wu-xing-line wu-xing-line--sheng"
                  />
                );
              })}
              {WU_XING_RING.map((_, index) => {
                const from = ringPositions[index];
                const to = ringPositions[(index + 2) % WU_XING_RING.length];
                return (
                  <line
                    key={`ke-${index}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className="wu-xing-line wu-xing-line--ke"
                  />
                );
              })}
            </svg>

            <div
              className="wu-xing-ring"
              style={{ width: RING_SIZE, height: RING_SIZE }}
              aria-label="五行生克图"
            >
              {WU_XING_RING.map((element, index) => {
                const position = ringPositions[index];
                return (
                  <div
                    key={element}
                    className="wu-xing-slot wu-xing-slot--labeled"
                    style={{
                      left: position.x,
                      top: position.y,
                      width: TOKEN_SIZE,
                      height: TOKEN_SIZE,
                    }}
                  >
                    <span className="wu-xing-token wu-xing-token--fixed">
                      {element}
                    </span>
                    <span
                      className={
                        COUNT_ON_LEFT.includes(element)
                          ? "wu-xing-element-count wu-xing-element-count--left"
                          : "wu-xing-element-count"
                      }
                    >{`+${counts[element]}`}</span>
                  </div>
                );
              })}
            </div>

            <svg
              className="wu-xing-ring-arrows"
              viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="wu-xing-relation-arrow"
                  markerWidth="6"
                  markerHeight="6"
                  refX="6"
                  refY="3"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <polygon points="0,0 6,3 0,6" className="wu-xing-arrow-head" />
                </marker>
              </defs>
              {RELATION_ARROWS.map(({ id, from, to }) => {
                const endpoints = getArrowEndpoints(
                  getElementCenter(from, ringPositions),
                  getElementCenter(to, ringPositions),
                );
                return (
                  <line
                    key={id}
                    x1={endpoints.x1}
                    y1={endpoints.y1}
                    x2={endpoints.x2}
                    y2={endpoints.y2}
                    className="wu-xing-line wu-xing-line--relation"
                    markerEnd="url(#wu-xing-relation-arrow)"
                  />
                );
              })}
            </svg>

            {showRelations &&
              RELATION_ARROWS.map(({ id }) => {
                const midpoint = relationMidpoints[id];
                const placed = displayPlacements[id];
                return (
                  <div
                    key={id}
                    ref={
                      interactive
                        ? (node) => {
                            if (node) slotRefs.current[id] = node;
                          }
                        : undefined
                    }
                    className={`wu-xing-slot wu-xing-slot--relation${placed ? " wu-xing-slot--filled" : " wu-xing-slot--empty"}`}
                    style={{
                      left: midpoint.x,
                      top: midpoint.y,
                      width: RELATION_TOKEN_SIZE,
                      height: RELATION_TOKEN_SIZE,
                    }}
                  >
                    {placed &&
                      (interactive
                        ? !isDraggingFromSlot(id, placed) &&
                          renderLabelToken(placed, id)
                        : renderStaticLabelToken(placed))}
                    {!placed && (
                      <span
                        className="wu-xing-slot-placeholder"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {(interactive || showRelationPool) && (
          <div
            className="wu-xing-pool"
            ref={interactive ? poolRef : undefined}
            aria-label="生克选项"
          >
            {RELATION_POOL_LABELS.map((label) =>
              interactive ? (
                renderLabelToken(label, "pool")
              ) : (
                <span
                  key={label}
                  className="wu-xing-token wu-xing-token--compact"
                >
                  {label}
                </span>
              ),
            )}
          </div>
        )}

        {interactive && dragging && dragPoint && (
          <div
            className="wu-xing-token wu-xing-token--compact wu-xing-token--ghost"
            style={{
              left: dragPoint.x,
              top: dragPoint.y,
            }}
            aria-hidden="true"
          >
            {dragging.label}
          </div>
        )}
      </div>
    );
  },
);

export default WuXingRingDiagram;
