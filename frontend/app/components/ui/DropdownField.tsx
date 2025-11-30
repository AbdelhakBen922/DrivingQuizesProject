import { useState, useRef, useEffect } from "react";

type DropdownFieldProps = {
  label?: string;
  placeholder?: string;
  options: string[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export default function DropdownField({
  label,
  placeholder = "Select option",
  options,
  value,
  error,
  onChange,
}: DropdownFieldProps) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine if dropdown should open upward and scroll to selected item
  useEffect(() => {
    if (open && dropdownRef.current && optionsRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 208; // max-h-52 = 13rem = 208px

      // Open upward if more space above
      setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);

      // Scroll to selected item
      if (value) {
        const selectedIndex = options.indexOf(value);
        if (selectedIndex !== -1) {
          const selectedElement = optionsRef.current.children[selectedIndex] as HTMLElement;
          if (selectedElement) {
            selectedElement.scrollIntoView({ block: "nearest" });
          }
        }
      }
    }
  }, [open, value, options]);

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={dropdownRef}>
      {label && <label className="form-label">{label}</label>}

      {/* Dropdown input */}
      <div
        onClick={() => setOpen((prev) => !prev)}
        className={`
          cursor-pointer flex items-center justify-between select-none
          ${error ? "form-field-error" : ""}
        `}
        style={{
          width: '100%',
          minWidth: '200px',
          height: '48.5px',
          backgroundColor: 'var(--color-gray-200)',
          border: '1px solid var(--color-gray-300)',
          paddingTop: '11.25px',
          paddingRight: '15px',
          paddingBottom: '11.25px',
          paddingLeft: '15px',
          borderRadius: '0.25rem', // xs
          opacity: 1
        }}
      >
        <div className="flex items-center" style={{ gap: '15px' }}>
          {/* Checkbox icon */}
          {value && (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-shrink-0"
              style={{ color: 'var(--color-text-dark)' }}
            >
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path
                d="M5 8L7 10L11 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <span style={{ color: 'var(--color-text-dark)' }}>
            {value || placeholder}
          </span>
        </div>

        <img
          src="/assets/icons/down.svg"
          className={`h-4 w-4 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
          style={{ filter: 'brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(2000%) hue-rotate(210deg) brightness(0.9) contrast(1.1)' }}
        />
      </div>

      {/* Options */}
      {open && (
        <div 
          ref={optionsRef}
          className={`
            absolute z-10 w-full rounded-xl border shadow-lg max-h-52 overflow-y-auto
            ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
          style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-primary-200)' }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`
                px-4 cursor-pointer transition flex items-center
                ${opt === value ? 'font-medium' : ''}
              `}
              style={{ 
                height: '48.5px',
                backgroundColor: opt === value ? 'var(--color-primary-50)' : 'transparent',
                color: 'var(--color-text-dark)'
              }}
              onMouseEnter={(e) => {
                if (opt !== value) {
                  e.currentTarget.style.backgroundColor = 'var(--color-primary-100)';
                }
              }}
              onMouseLeave={(e) => {
                if (opt !== value) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <span className="text-xs" style={{ color: 'var(--color-red-500)' }}>{error}</span>}
    </div>
  );
}
