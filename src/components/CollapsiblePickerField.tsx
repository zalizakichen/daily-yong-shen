import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  displayValue: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
};

export default function CollapsiblePickerField({
  displayValue,
  isOpen,
  onOpen,
  onClose,
  ariaLabel,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className={`picker-field${isOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="picker-field-trigger"
        onClick={() => (isOpen ? onClose() : onOpen())}
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        {displayValue}
      </button>
      {isOpen && (
        <div className="picker-field-panel">
          {children}
          <button type="button" className="picker-field-done" onClick={onClose}>
            完成
          </button>
        </div>
      )}
    </div>
  );
}
