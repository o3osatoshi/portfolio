/** Props for {@link AmountInput}.
 *
 * @public
 */
export interface AmountInputProps {
  disabled?: boolean;
  placeholder?: string;
  type?: "number" | "text";
}

/**
 * Numeric input tailored for currency-style amounts.
 *
 * Disables mouse wheel scrolling to avoid accidental value changes and hides
 * the default number input spinner for a cleaner look.
 *
 * @public
 */
export function AmountInput({
  disabled = false,
  placeholder = "0.00",
  type = "number",
}: AmountInputProps) {
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
