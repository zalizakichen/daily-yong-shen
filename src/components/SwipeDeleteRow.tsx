import { useEffect, useRef, useState, type ReactNode } from "react";

const DELETE_WIDTH = 52;
const OPEN_THRESHOLD = 26;

type Props = {
  rowId: string;
  openRowId: string | null;
  onOpenChange: (rowId: string | null) => void;
  onSelect: () => void;
  onDelete: () => void;
  children: ReactNode;
  className?: string;
};

export default function SwipeDeleteRow({
  rowId,
  openRowId,
  onOpenChange,
  onSelect,
  onDelete,
  children,
  className = "",
}: Props) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const moved = useRef(false);

  const isOpen = openRowId === rowId;

  useEffect(() => {
    setOffset(isOpen ? -DELETE_WIDTH : 0);
  }, [isOpen]);

  const clampOffset = (value: number) =>
    Math.max(-DELETE_WIDTH, Math.min(0, value));

  const snapOpen = (nextOffset: number) => {
    if (nextOffset <= -OPEN_THRESHOLD) {
      setOffset(-DELETE_WIDTH);
      onOpenChange(rowId);
      return;
    }
    setOffset(0);
    onOpenChange(null);
  };

  const beginDrag = (clientX: number) => {
    startX.current = clientX;
    startOffset.current = isOpen ? -DELETE_WIDTH : offset;
    moved.current = false;
    setDragging(true);
    if (openRowId && openRowId !== rowId) {
      onOpenChange(null);
    }
  };

  const moveDrag = (clientX: number) => {
    const delta = clientX - startX.current;
    if (Math.abs(delta) > 4) moved.current = true;
    setOffset(clampOffset(startOffset.current + delta));
  };

  const endDrag = () => {
    setDragging(false);
    snapOpen(offset);
  };

  const handleSelect = () => {
    if (isOpen) {
      setOffset(0);
      onOpenChange(null);
      return;
    }
    onSelect();
  };

  return (
    <div className={`swipe-delete-row${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        className="swipe-delete-row__delete"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
          onOpenChange(null);
        }}
      >
        删除
      </button>

      <div
        className={`swipe-delete-row__content${dragging ? " is-dragging" : ""}`}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={(event) => beginDrag(event.touches[0].clientX)}
        onTouchMove={(event) => moveDrag(event.touches[0].clientX)}
        onTouchEnd={endDrag}
        onTouchCancel={endDrag}
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          beginDrag(event.clientX);

          const handleMouseMove = (moveEvent: MouseEvent) => {
            moveDrag(moveEvent.clientX);
          };

          const handleMouseUp = () => {
            endDrag();
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
          };

          window.addEventListener("mousemove", handleMouseMove);
          window.addEventListener("mouseup", handleMouseUp);
        }}
      >
        <button
          type="button"
          className="welcome-back-menu-item swipe-delete-row__label"
          onClick={() => {
            if (moved.current) {
              moved.current = false;
              return;
            }
            handleSelect();
          }}
        >
          {children}
        </button>
      </div>
    </div>
  );
}
