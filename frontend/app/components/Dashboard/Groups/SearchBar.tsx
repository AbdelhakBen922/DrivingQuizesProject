import { useTranslation } from "react-i18next";

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
}

export default function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 bg-white border border-gray-200 rounded-xl
          text-sm sm:text-base text-grey placeholder-gray-400 outline-none
          focus:border-primary-300 focus:ring-2 focus:ring-primary-100
          transition-all duration-200
          ${isRTL ? 'text-right pr-3 sm:pr-4 pl-10 sm:pl-12' : 'text-left pl-3 sm:pl-4 pr-10 sm:pr-12'}
        `}
      />
      <img
        src="/assets/icons/dashboard/groups/search.svg"
        alt="search"
        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-grey ${isRTL ? 'left-3 sm:left-4' : 'right-3 sm:right-4'}`}
      />
    </div>
  );
}
