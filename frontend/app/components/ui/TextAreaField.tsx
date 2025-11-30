import { useState } from "react";

type TextAreaFieldProps = {
  label?: string;
  value: string;
  placeholder?: string;
  error?: string;
  onChange: (value: string) => void;
  rows?: number;
  customBackground?: string;
  customTextSize?: string;
  showQuestionIcon?: boolean;
  showInfoIcon?: boolean;
  dashedBorder?: boolean;
  resizable?: boolean;
  customWidth?: string;
  customHeight?: string;
};

export default function TextAreaField({
  label,
  value,
  placeholder,
  error,
  onChange,
  rows = 4,
  customBackground,
  customTextSize,
  showQuestionIcon = false,
  showInfoIcon = false,
  dashedBorder = false,
  resizable = false,
  customWidth,
  customHeight,
}: TextAreaFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      {label && (
        <label className="form-label flex items-center gap-2">
          <span>{label.toUpperCase()}</span>
          {showQuestionIcon && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: 'var(--color-grey)' }}
            >
              <path
                d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z"
                fill="currentColor"
              />
              <path
                d="M10 6C9.44772 6 9 6.44772 9 7V9C9 9.55228 9.44772 10 10 10C10.5523 10 11 9.55228 11 9V7C11 6.44772 10.5523 6 10 6Z"
                fill="currentColor"
              />
              <path
                d="M10 11C9.44772 11 9 11.4477 9 12V13C9 13.5523 9.44772 14 10 14C10.5523 14 11 13.5523 11 13V12C11 11.4477 10.5523 11 10 11Z"
                fill="currentColor"
              />
            </svg>
          )}
          {showInfoIcon && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: 'var(--color-grey)' }}
            >
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path
                d="M8 4.5V9M8 11.5H8.01"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </label>
      )}

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={`
          form-field ${resizable ? 'resize' : 'resize-none'}
          ${error ? "form-field-error" : ""}
          ${customTextSize && customTextSize.includes('sm:') ? 'text-base sm:text-lg' : ''}
        `}
        style={{
          backgroundColor: customBackground || 'var(--color-white)',
          fontSize: customTextSize && !customTextSize.includes('sm:') ? customTextSize : undefined,
          borderStyle: dashedBorder ? 'dashed' : 'solid',
          borderColor: dashedBorder ? 'var(--color-primary-200)' : 'var(--color-gray-300)',
          borderWidth: dashedBorder ? '2px' : '1px',
          borderRadius: dashedBorder ? '0.25rem' : undefined, // xs border-radius
          padding: dashedBorder ? '0.5rem' : undefined, // sm padding
          width: customWidth || (dashedBorder ? '100%' : (resizable ? 'auto' : undefined)),
          height: customHeight || undefined,
          minWidth: resizable && !dashedBorder ? '200px' : undefined,
        }}
      />

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
