interface Props {
  type?: "number" | "text";
  placeholder?: string;
  disabled?: boolean;
}

export default function AmountInput({
  type = "number",
  placeholder = "0.00",
  disabled = false,
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
