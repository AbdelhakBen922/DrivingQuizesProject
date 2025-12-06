import { useTranslation } from "react-i18next";

export interface ColumnProps<T> {
  key: keyof T | string;
  label: string | React.ReactNode;
  type?: "text" | "badge" | "percent" | "date" | "actions";
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: ColumnProps<T>[];
  data: T[];
  rowKey: keyof T;
}

export default function Table<T extends Record<string, any>>({ 
  columns, 
  data, 
  rowKey 
}: TableProps<T>) {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((column, idx) => (
              <th
                key={`${String(column.key)}-${idx}`}
                className={`
                  px-6 py-4 text-sm font-semibold text-grey uppercase tracking-wider
                  ${isRTL ? 'text-right' : 'text-left'}
                  ${idx === 0 ? (isRTL ? 'rounded-tr-xl' : 'rounded-tl-xl') : ''}
                  ${idx === columns.length - 1 ? (isRTL ? 'rounded-tl-xl' : 'rounded-tr-xl') : ''}
                `}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={String(item[rowKey])}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
            >
              {columns.map((column, colIdx) => (
                <td
                  key={`${String(item[rowKey])}-${String(column.key)}-${colIdx}`}
                  className={`px-6 py-4 text-grey ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  {column.render ? (
                    column.render(item)
                  ) : column.type === "badge" ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                      {item[column.key]}
                    </span>
                  ) : column.type === "percent" ? (
                    <span className="font-semibold text-primary-800">
                      {item[column.key]}%
                    </span>
                  ) : column.type === "date" ? (
                    <span className="text-grey">{item[column.key]}</span>
                  ) : (
                    <span className="text-grey">{item[column.key]}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-grey"
              >
                {isRTL ? 'لا توجد بيانات' : 'Aucune donnée disponible'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
