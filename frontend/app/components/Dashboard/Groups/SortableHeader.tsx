import { useTranslation } from "react-i18next";

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  label: string;
  sortable?: boolean;
  singleArrow?: boolean;  // true = one flipping arrow, false = two arrows (up/down)
  filterIcon?: boolean;
  currentSort?: SortDirection;
  onSort?: () => void;
  onFilter?: () => void;
}

export default function SortableHeader({
  label,
  sortable = false,
  singleArrow = false,
  filterIcon = false,
  currentSort = null,
  onSort,
  onFilter,
}: SortableHeaderProps) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
      <span>{label}</span>
      
      {/* Single flipping arrow (for date) */}
      {sortable && singleArrow && onSort && (
        <button
          onClick={onSort}
          className="flex items-center justify-center hover:opacity-70 transition-all"
        >
          <img
            src="/assets/icons/dashboard/groups/arrow_down_table.svg"
            alt="sort"
            className={`w-4 h-4 max-w-4 transition-transform ${
              currentSort === 'asc' 
                ? 'rotate-180' 
                : currentSort === 'desc' 
                ? '' 
                : 'opacity-40'
            }`}
          />
        </button>
      )}

      {/* Double arrows (for progress/numbers) */}
      {sortable && !singleArrow && onSort && (
        <button
          onClick={onSort}
          className="flex flex-col items-center justify-center hover:opacity-70 transition-opacity"
        >
          <img
            src="/assets/icons/dashboard/groups/arrow_down_table.svg"
            alt="sort up"
            className={`w-3 h-3 max-w-3 transition-all ${
              currentSort === 'asc' ? 'rotate-180 opacity-100' : ' rotate-180 opacity-40'
            }`}
          />
          <img
            src="/assets/icons/dashboard/groups/arrow_down_table.svg"
            alt="sort down"
            className={`w-3 h-3 max-w-3 -mt-1 transition-all ${
              currentSort === 'desc' ? 'opacity-100' : 'opacity-40'
            }`}
          />
        </button>
      )}

      {/* Filter icon */}
      {filterIcon && onFilter && (
        <button
          onClick={onFilter}
          className="hover:opacity-70 transition-opacity"
        >
          <img
            src="/assets/icons/dashboard/groups/filter.svg"
            alt="filter"
            className="w-4 h-4 max-w-4"
          />
        </button>
      )}
    </div>
  );
}
