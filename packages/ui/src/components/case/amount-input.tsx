interface Props {
  type?: "number" | "text";
  placeholder?: string;
  disabled?: boolean;
}

export function AmountInput({
  disabled = false,
  placeholder = "0.00",
  type = "number",
}: Props) {
  return (
    <input
      className="hide-number-input-spinner focus:outline-none w-full"
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      onWheel={(e) => {
        e.currentTarget.blur();
        e.stopPropagation();
      }}
    />
  );
}
