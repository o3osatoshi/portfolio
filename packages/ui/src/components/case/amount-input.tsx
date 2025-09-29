interface Props {
  disabled?: boolean;
  placeholder?: string;
  type?: "number" | "text";
}

/**
 * Numeric input tailored for currency-style amounts.
 *
 * Disables mouse wheel scrolling to avoid accidental value changes and hides
 * the default number input spinner for a cleaner look.
 */
export function AmountInput({
  disabled = false,
  placeholder = "0.00",
  type = "number",
}: Props) {
  return (
    <input
      className="hide-number-input-spinner w-full focus:outline-none"
      disabled={disabled}
      onWheel={(e) => {
        e.currentTarget.blur();
        e.stopPropagation();
      }}
      placeholder={placeholder}
      type={type}
    />
  );
}
