interface Props {
  disabled?: boolean;
  placeholder?: string;
  type?: "number" | "text";
}

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
