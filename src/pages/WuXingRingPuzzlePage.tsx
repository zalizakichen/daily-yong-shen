import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import PageNavFooter from "../components/PageNavFooter";
import {
  FIXED_SLOT_ELEMENTS,
  getRingPosition,
  isPuzzleSlot,
  PUZZLE_PIECES,
  PUZZLE_SLOTS,
  validateWuXingRing,
  WU_XING_RING,
  type PuzzleSlot,
  type WuXingElement,
} from "../data/wuXingRing";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  placements: Record<PuzzleSlot, WuXingElement | null>;
  onPlacementsChange: (
    placements: Record<PuzzleSlot, WuXingElement | null>,
  ) => void;
};

type DragState = {
  element: WuXingElement;
  source: "pool" | PuzzleSlot;
};

const RING_SIZE = 248;
const RING_CENTER = RING_SIZE / 2;
const RING_RADIUS = 92;
const TOKEN_SIZE = 44;
const ERROR_HINT = "提示：木生火，金生水";

export default function WuXingRingPuzzlePage({
  onPrev,
  onNext,
  placements,
  onPlacementsChange,
}: Props) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const poolRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Partial<Record<PuzzleSlot, HTMLDivElement>>>({});
  const draggingRef = useRef<DragState | null>(null);

  const ringPositions = useMemo(
    () =>
      WU_XING_RING.map((_, index) =>
        getRingPosition(index, RING_RADIUS, RING_CENTER),
      ),
    [],
  );

  const poolPieces = useMemo(
    () =>
      PUZZLE_PIECES.filter(
        (element) =>
          !PUZZLE_SLOTS.some((slot) => placements[slot] === element),
      ),
    [placements],
  );

  const visiblePoolPieces = useMemo(
    () =>
      poolPieces.filter(
        (element) =>
          !(dragging?.source === "pool" && dragging.element === element),
      ),
    [poolPieces, dragging],
  );

  const clearElementFromSlots = useCallback(
    (
      current: Record<PuzzleSlot, WuXingElement | null>,
      element: WuXingElement,
    ) => {
      const next = { ...current };
      for (const slot of PUZZLE_SLOTS) {
        if (next[slot] === element) {
          next[slot] = null;
        }
      }
      return next;
    },
    [],
  );

  const assignToSlot = useCallback(
    (slot: PuzzleSlot, element: WuXingElement) => {
      const cleared = clearElementFromSlots(placements, element);
      onPlacementsChange({ ...cleared, [slot]: element });
      setError(null);
    },
    [clearElementFromSlots, onPlacementsChange, placements],
  );

  const returnElementToPool = useCallback(
    (element: WuXingElement) => {
      onPlacementsChange(clearElementFromSlots(placements, element));
      setError(null);
    },
    [clearElementFromSlots, onPlacementsChange, placements],
  );

  const hitTestDropTarget = useCallback(
    (clientX: number, clientY: number): PuzzleSlot | "pool" | null => {
      for (const slot of PUZZLE_SLOTS) {
        const node = slotRefs.current[slot];
        if (!node) continue;
        const rect = node.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          return slot;
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
        returnElementToPool(activeDrag.element);
      } else if (target !== null) {
        assignToSlot(target, activeDrag.element);
      }

      draggingRef.current = null;
      setDragging(null);
      setDragPoint(null);
    },
    [assignToSlot, hitTestDropTarget, returnElementToPool],
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
    element: WuXingElement,
    source: DragState["source"],
  ) => {
    event.preventDefault();
    setDragging({ element, source });
    setDragPoint({ x: event.clientX, y: event.clientY });
    setError(null);
  };

  const handleNext = () => {
    const allPlaced = PUZZLE_SLOTS.every((slot) => placements[slot] !== null);
    if (!allPlaced) {
      setError("请先把“土”和“水”放入圆环。");
      return;
    }
    if (!validateWuXingRing(placements)) {
      setError(ERROR_HINT);
      return;
    }
    onNext();
  };

  const isDraggingFromSlot = (slot: PuzzleSlot, element: WuXingElement) =>
    dragging?.source === slot && dragging.element === element;

  const renderToken = (
    element: WuXingElement,
    source: DragState["source"],
    className = "",
  ) => (
    <button
      type="button"
      className={`wu-xing-token${
        source !== "pool" ? " wu-xing-token--placed" : ""
      }${className ? ` ${className}` : ""}`}
      onPointerDown={(event) => handlePointerDown(event, element, source)}
      aria-label={`拖动${element}`}
    >
      {element}
    </button>
  );

  return (
    <div className="page wu-xing-ring-page">
      <main className="page-main page-main--learn page-main--wu-xing-ring">
        <p className="wu-xing-ring-instruction day-master-desc">
          凭借你刻在基因里的直觉，把“土”和“水”放入正确的位置，使圆环上的五行满足相邻相生、相间相克的关系。
        </p>

        <div className="wu-xing-ring-stage">
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
          >
            {WU_XING_RING.map((element, index) => {
              const position = ringPositions[index];
              const fixed = FIXED_SLOT_ELEMENTS[index];
              const puzzleSlot = isPuzzleSlot(index) ? index : null;
              const placed = puzzleSlot ? placements[puzzleSlot] : null;

              return (
                <div
                  key={element}
                  ref={
                    puzzleSlot
                      ? (node) => {
                          if (node) slotRefs.current[puzzleSlot] = node;
                        }
                      : undefined
                  }
                  className={`wu-xing-slot${puzzleSlot ? " wu-xing-slot--drop" : ""}${placed ? " wu-xing-slot--filled" : ""}${puzzleSlot && !placed ? " wu-xing-slot--empty" : ""}`}
                  style={{
                    left: position.x,
                    top: position.y,
                    width: TOKEN_SIZE,
                    height: TOKEN_SIZE,
                  }}
                >
                  {fixed && (
                    <span className="wu-xing-token wu-xing-token--fixed">
                      {fixed}
                    </span>
                  )}
                  {puzzleSlot &&
                    placed &&
                    !isDraggingFromSlot(puzzleSlot, placed) &&
                    renderToken(placed, puzzleSlot)}
                  {puzzleSlot && !placed && (
                    <span className="wu-xing-slot-placeholder" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="wu-xing-pool" ref={poolRef} aria-label="待放入的五行">
          {visiblePoolPieces.map((element) => renderToken(element, "pool"))}
        </div>

        {error && (
          <p className="wu-xing-ring-error" role="alert">
            {error}
          </p>
        )}
      </main>

      {dragging && dragPoint && (
        <div
          className="wu-xing-token wu-xing-token--ghost"
          style={{
            left: dragPoint.x,
            top: dragPoint.y,
          }}
          aria-hidden="true"
        >
          {dragging.element}
        </div>
      )}

      <PageNavFooter onPrev={onPrev} onNext={handleNext} />
    </div>
  );
}
