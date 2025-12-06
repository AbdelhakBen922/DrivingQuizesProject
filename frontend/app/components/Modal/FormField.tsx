import { useTranslation } from "react-i18next";
import type { FormFieldProps } from "./types";

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  value,
  onChange,
  options = [],
  rows = 3,
  required = false,
  error,
  className = "",
}: FormFieldProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const newValue = type === 'number' ? Number(e.target.value) : e.target.value;
    onChange?.(newValue);
  };

  const fieldClasses = `
    form-field
    ${error ? 'form-field-error' : ''}
    ${isRTL ? 'text-right' : 'text-left'}
  `;

  return (
    <div className={`mb-4 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={name}
        className={`form-label block mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>

      {/* Input Field */}
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={handleChange}
          required={required}
          className={fieldClasses}
        />
      ) : type === 'select' ? (
        <div className="relative">
          <select
            id={name}
            name={name}
            defaultValue={defaultValue}
            value={value}
            onChange={handleChange}
            required={required}
            className={`${fieldClasses} appearance-none ${isRTL ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <img
            src="/assets/icons/dashboard/groups/arrow_down.svg"
            alt="dropdown"
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isRTL ? 'left-3' : 'right-3'}`}
          />
        </div>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={handleChange}
          required={required}
          className={fieldClasses}
        />
      )}

      {/* Error Message */}
      {error && (
        <p className={`text-red text-sm mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </p>
      )}
    </div>
  );
}
