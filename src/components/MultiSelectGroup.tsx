type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  ariaLabel: string;
  groupClassName?: string;
};

export default function MultiSelectGroup<T extends string>({
  options,
  selected,
  onToggle,
  ariaLabel,
  groupClassName,
}: Props<T>) {
  return (
    <div
      className={`multi-select-group${groupClassName ? ` ${groupClassName}` : ""}`}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={`multi-select-item${isSelected ? " is-selected" : ""}`}
            data-label={option.label}
            aria-pressed={isSelected}
            onClick={() => onToggle(option.value)}
          >
            <span className="multi-select-item__label">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
