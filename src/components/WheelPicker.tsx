import { useEffect, useRef } from "react";

export const WHEEL_ITEM_HEIGHT = 36;
export const WHEEL_VISIBLE_COUNT = 3;
export const WHEEL_INLINE_ITEM_HEIGHT = 30;
export const WHEEL_INLINE_VISIBLE_COUNT = 3;

export type WheelOption<T> = {
  value: T;
  label: string;
};

type Props<T> = {
  options: WheelOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  compact?: boolean;
};

export default function WheelPicker<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  compact = false,
}: Props<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const itemHeight = compact ? WHEEL_INLINE_ITEM_HEIGHT : WHEEL_ITEM_HEIGHT;
  const visibleCount = compact ? WHEEL_INLINE_VISIBLE_COUNT : WHEEL_VISIBLE_COUNT;
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isScrollingRef.current) return;
    el.scrollTop = selectedIndex * itemHeight;
  }, [selectedIndex, itemHeight]);

  const snapToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(options.length - 1, index));
    isScrollingRef.current = true;
    el.scrollTo({ top: clamped * itemHeight, behavior: "smooth" });
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 200);
    const next = options[clamped];
    if (next && next.value !== value) onChange(next.value);
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || isScrollingRef.current) return;
    const index = Math.round(el.scrollTop / itemHeight);
    const clamped = Math.max(0, Math.min(options.length - 1, index));
    const next = options[clamped];
    if (next && next.value !== value) onChange(next.value);
  };

  const handleScrollEnd = () => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollTop / itemHeight);
    snapToIndex(index);
  };

  const pad = itemHeight * Math.floor(visibleCount / 2);

  return (
    <div
      className={`wheel-picker-wrap${compact ? " wheel-picker-wrap--inline" : ""}`}
      role="group"
      aria-label={ariaLabel}
    >
      <div className="wheel-picker-mask" aria-hidden="true" />
      <div className="wheel-picker-highlight" aria-hidden="true" />
      <div
        ref={scrollRef}
        className="wheel-picker"
        onScroll={handleScroll}
        onTouchEnd={handleScrollEnd}
        onMouseUp={handleScrollEnd}
      >
        <div className="wheel-picker-pad" style={{ height: pad }} />
        {options.map((option, index) => (
          <div
            key={`${String(option.value)}-${index}`}
            className={`wheel-item${index === selectedIndex ? " is-selected" : ""}`}
            style={compact ? { height: itemHeight } : undefined}
            onClick={() => snapToIndex(index)}
            role="option"
            aria-selected={index === selectedIndex}
          >
            {option.label}
          </div>
        ))}
        <div className="wheel-picker-pad" style={{ height: pad }} />
      </div>
    </div>
  );
}
