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
          w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl
          text-grey placeholder-gray-400 outline-none
          focus:border-primary-300 focus:ring-2 focus:ring-primary-100
          transition-all duration-200
          ${isRTL ? 'text-right pr-4 pl-12' : 'text-left pl-4 pr-12'}
        `}
      />
      <img
        src="/assets/icons/dashboard/groups/search.svg"
        alt="search"
        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-grey ${isRTL ? 'left-4' : 'right-4'}`}
      />
    </div>
  );
}
