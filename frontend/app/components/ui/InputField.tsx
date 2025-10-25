type InputFieldProps = {
  label?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
};

export default function InputField({
  label,
  value,
  placeholder,
  error,
  onChange,
  type = "text",
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          className={`form-label ${
            disabled ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          form-field
          ${error ? "form-field-error" : ""}
          ${disabled ? "opacity-60 cursor-not-allowed bg-gray-100" : ""}
        `}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
