import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import PageNavFooter from "../components/PageNavFooter";
import {
  FILL_POOL,
  FILL_SLOTS,
  GAN_SEQUENCE,
  isFillSlot,
  validateGanZhiFill,
  validateZhiPinyin,
  ZHI_SEQUENCE,
  type FillChar,
  type FillSlot,
  type SiPinyin,
  type YouPinyin,
} from "../data/ganZhiFill";

type Props = {
  onPrev: () => void;
  onNext: () => void;
  placements: Record<FillSlot, FillChar | null>;
  onPlacementsChange: (placements: Record<FillSlot, FillChar | null>) => void;
  siPinyin: SiPinyin | null;
  onSiPinyinChange: (value: SiPinyin | null) => void;
  youPinyin: YouPinyin | null;
  onYouPinyinChange: (value: YouPinyin | null) => void;
};

type DragState = {
  element: FillChar;
  source: "pool" | FillSlot;
};

const GAN_ERROR_HINT = "提示：戊己庚辛壬癸";
const PINYIN_ERROR = "提示：巳读 sì，酉读 yǒu";

const SI_PINYIN_OPTIONS: SiPinyin[] = ["jǐ", "sì"];
const YOU_PINYIN_OPTIONS: YouPinyin[] = ["yǒu", "jiǔ"];

export default function GanZhiFillPage({
  onPrev,
  onNext,
  placements,
  onPlacementsChange,
  siPinyin,
  onSiPinyinChange,
  youPinyin,
  onYouPinyinChange,
}: Props) {
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const poolRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<Partial<Record<FillSlot, HTMLElement>>>({});
  const draggingRef = useRef<DragState | null>(null);

  const poolPieces = useMemo(
    () =>
      FILL_POOL.filter(
        (element) => !FILL_SLOTS.some((slot) => placements[slot] === element),
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
    (current: Record<FillSlot, FillChar | null>, element: FillChar) => {
      const next = { ...current };
      for (const slot of FILL_SLOTS) {
        if (next[slot] === element) {
          next[slot] = null;
        }
      }
      return next;
    },
    [],
  );

  const assignToSlot = useCallback(
    (slot: FillSlot, element: FillChar) => {
      const cleared = clearElementFromSlots(placements, element);
      onPlacementsChange({ ...cleared, [slot]: element });
      setError(null);
    },
    [clearElementFromSlots, onPlacementsChange, placements],
  );

  const returnElementToPool = useCallback(
    (element: FillChar) => {
      onPlacementsChange(clearElementFromSlots(placements, element));
      setError(null);
    },
    [clearElementFromSlots, onPlacementsChange, placements],
  );

  const hitTestDropTarget = useCallback(
    (clientX: number, clientY: number): FillSlot | "pool" | null => {
      for (const slot of FILL_SLOTS) {
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
    element: FillChar,
    source: DragState["source"],
  ) => {
    event.preventDefault();
    setDragging({ element, source });
    setDragPoint({ x: event.clientX, y: event.clientY });
    setError(null);
  };

  const handleNext = () => {
    const allGanPlaced = FILL_SLOTS.every((slot) => placements[slot] !== null);
    if (!allGanPlaced) {
      setError("请先把天干空缺填上。");
      return;
    }
    if (!validateGanZhiFill(placements)) {
      setError(GAN_ERROR_HINT);
      return;
    }
    if (!siPinyin || !youPinyin) {
      setError("请选择巳与酉的读音。");
      return;
    }
    if (!validateZhiPinyin(siPinyin, youPinyin)) {
      setError(PINYIN_ERROR);
      return;
    }
    onNext();
  };

  const isDraggingFromSlot = (slot: FillSlot, element: FillChar) =>
    dragging?.source === slot && dragging.element === element;

  const renderToken = (
    element: FillChar,
    source: DragState["source"],
    className = "",
  ) => (
    <button
      type="button"
      className={`gan-zhi-token${className ? ` ${className}` : ""}`}
      onPointerDown={(event) => handlePointerDown(event, element, source)}
      aria-label={`拖动${element}`}
    >
      {element}
    </button>
  );

  const renderPinyinChoice = <T extends string>(
    options: T[],
    value: T | null,
    onSelect: (next: T) => void,
    ariaLabel: string,
  ) => (
    <span className="gan-zhi-pinyin-wrap" role="group" aria-label={ariaLabel}>
      （
      <span className="gan-zhi-pinyin-group">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`multi-select-item gan-zhi-pinyin-item${value === option ? " is-selected" : ""}`}
            data-label={option}
            aria-pressed={value === option}
            onClick={() => {
              onSelect(option);
              setError(null);
            }}
          >
            <span className="multi-select-item__label">{option}</span>
          </button>
        ))}
      </span>
      ）
    </span>
  );

  const renderGanSequence = (sequence: (string | FillSlot)[]): ReactNode[] => {
    const nodes: ReactNode[] = [];

    sequence.forEach((item, index) => {
      if (index > 0) {
        nodes.push(
          <span key={`gan-sep-${index}`} className="gan-zhi-separator">
            、
          </span>,
        );
      }

      if (isFillSlot(item)) {
        const placed = placements[item];
        nodes.push(
          <span
            key={item}
            ref={(node) => {
              if (node) slotRefs.current[item] = node;
            }}
            className={`gan-zhi-blank${placed ? " gan-zhi-blank--filled" : ""}`}
          >
            {placed && !isDraggingFromSlot(item, placed)
              ? renderToken(placed, item)
              : !placed && (
                  <span className="gan-zhi-blank-mark" aria-hidden="true" />
                )}
          </span>,
        );
      } else {
        nodes.push(
          <span key={item} className="gan-zhi-char">
            {item}
          </span>,
        );
      }
    });

    return nodes;
  };

  const renderZhiSequence = (): ReactNode[] => {
    const nodes: ReactNode[] = [];

    ZHI_SEQUENCE.forEach((item, index) => {
      if (index > 0) {
        nodes.push(
          <span key={`zhi-sep-${index}`} className="gan-zhi-separator">
            、
          </span>,
        );
      }

      nodes.push(
        <span key={item} className="gan-zhi-char">
          {item}
        </span>,
      );

      if (item === "巳") {
        nodes.push(
          <span key="si-pinyin">
            {renderPinyinChoice(
              SI_PINYIN_OPTIONS,
              siPinyin,
              onSiPinyinChange,
              "选择巳的读音",
            )}
          </span>,
        );
      }

      if (item === "酉") {
        nodes.push(
          <span key="you-pinyin">
            {renderPinyinChoice(
              YOU_PINYIN_OPTIONS,
              youPinyin,
              onYouPinyinChange,
              "选择酉的读音",
            )}
          </span>,
        );
      }
    });

    return nodes;
  };

  return (
    <div className="page gan-zhi-fill-page">
      <main className="page-main page-main--learn page-main--gan-zhi-fill">
        <article className="learn-article">
          <h1 className="learn-title">什么是天干地支？</h1>
          <div className="day-master-block">
            <p className="day-master-desc">
              介绍八字之前，先说说天干和地支。
            </p>
            <p className="day-master-desc">
              天干、地支，简称干支，相传是黄帝时代的大挠氏所创。“干”用于纪日，有十个；“支”用于纪月，有十二个。
            </p>
            <p className="day-master-desc">
              请出你的华夏基因，把下面的空格填上：
            </p>
            <p className="day-master-desc gan-zhi-fill-line">
              <span className="gan-zhi-fill-label">天干：</span>
              {renderGanSequence(GAN_SEQUENCE)}
            </p>
            <p className="day-master-desc gan-zhi-fill-line">
              <span className="gan-zhi-fill-label">地支：</span>
              {renderZhiSequence()}
            </p>
          </div>
        </article>

        <div
          className="wu-xing-pool gan-zhi-pool"
          ref={poolRef}
          aria-label="待填入的天干"
        >
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
          className="gan-zhi-token gan-zhi-token--ghost"
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
