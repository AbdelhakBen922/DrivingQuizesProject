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
          form-field cursor-pointer flex items-center justify-between select-none
          ${error ? "form-field-error" : ""}
        `}
      >
        <span className={value ? "text-primary-800" : "text-gray-400"}>
          {value || placeholder}
        </span>

        <img
          src="/assets/icons/down.svg"
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Options */}
      {open && (
        <div 
          ref={optionsRef}
          className={`
            absolute z-10 bg-white w-full rounded-xl border border-primary-200 shadow-lg max-h-52 overflow-y-auto
            ${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'}
          `}
        >
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`
                px-4 py-3 hover:bg-primary-100 text-primary-800 cursor-pointer transition
                ${opt === value ? 'bg-primary-50 font-medium' : ''}
              `}
            >
              {opt}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
