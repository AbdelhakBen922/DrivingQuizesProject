import React from 'react';

type EstimationTimeFieldProps = {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  error?: string;
};

export default function EstimationTimeField({
  label = 'Estimation Time',
  value,
  onChange,
  placeholder = '2',
  error,
}: EstimationTimeFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="form-label mb-2 block" style={{ color: 'var(--color-text-dark)' }}>
          {label}
        </label>
      )}

      <div 
        className="relative flex items-center rounded-lg" 
        style={{ 
          backgroundColor: 'var(--color-gray-200)', 
          border: '1px solid var(--color-gray-300)',
          minHeight: '2.5rem'
        }}
      >
        {/* Number input */}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-full bg-transparent border-none outline-none pl-4 pr-20 py-2 text-sm"
          style={{ color: 'var(--color-text-dark)' }}
          placeholder={placeholder}
        />

        {/* Vertical separator between value and Mins text */}
        <div className="absolute top-1/2 -translate-y-1/2 h-2/3 w-px pointer-events-none" style={{ right: '100px', backgroundColor: '#000000' }}></div>

        {/* Mins text and clock icon inside the form field */}
        <div className="absolute right-3 flex items-center gap-2 pointer-events-none">
          <span className="text-sm" style={{ color: 'var(--color-text-dark)' }}>
            Mins
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: 'var(--color-grey)' }}
          >
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10 6V10L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {error && <span className="text-xs" style={{ color: 'var(--color-red-500)' }}>{error}</span>}
    </div>
  );
}

