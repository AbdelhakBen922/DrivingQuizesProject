import { useTranslation } from "react-i18next";

interface FilterSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
}

export default function FilterSelect({ options, value, onChange }: FilterSelectProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none px-3 sm:px-4 py-2.5 sm:py-3 pr-9 sm:pr-10 bg-white border border-gray-200 rounded-xl
          text-sm sm:text-base text-grey font-medium outline-none cursor-pointer
          focus:border-primary-300 focus:ring-2 focus:ring-primary-100
          transition-all duration-200 w-full sm:min-w-[180px]
          ${isRTL ? 'text-right pr-3 sm:pr-4 pl-9 sm:pl-10' : 'text-left pl-3 sm:pl-4 pr-9 sm:pr-10'}
        `}
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
        className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 pointer-events-none ${isRTL ? 'left-2.5 sm:left-3' : 'right-2.5 sm:right-3'}`}
      />
    </div>
  );
}
