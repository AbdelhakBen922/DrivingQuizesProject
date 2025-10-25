type TextAreaFieldProps = {
  label?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  rows?: number;
};

export default function TextAreaField({
  label,
  value,
  placeholder,
  error,
  onChange,
  rows = 4,
}: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="form-label">{label.toUpperCase()}</label>}

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`
          form-field resize-none
          ${error ? "form-field-error" : ""}
        `}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
