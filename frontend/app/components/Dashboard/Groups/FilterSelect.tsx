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
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          appearance-none px-4 py-3 pr-10 bg-white border border-gray-200 rounded-xl
          text-grey font-medium outline-none cursor-pointer
          focus:border-primary-300 focus:ring-2 focus:ring-primary-100
          transition-all duration-200 min-w-[180px]
          ${isRTL ? 'text-right pr-4 pl-10' : 'text-left pl-4 pr-10'}
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
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isRTL ? 'left-3' : 'right-3'}`}
      />
    </div>
  );
}
