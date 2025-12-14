import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';

export interface Column<T = object> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface Action<T = object> {
  label: string;
  onClick?: (item: T) => void;
  to?: string | ((item: T) => string);
  className?: string;
  condition?: (item: T) => boolean;
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  keyField?: string;
  emptyMessage?: string;
}

export function DataTable<T extends object>({
  data,
  columns,
  actions = [],
  keyField = '_id',
  emptyMessage = 'No data available'
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <div className="text-center py-8 text-muted">{emptyMessage}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className={`text-left p-2 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
            {actions.length > 0 && <th className="text-left p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={String((item as unknown as Record<string, unknown>)[keyField])} className="border-t">
              {columns.map((col) => (
                <td key={String(col.key)} className={`p-2 ${col.className || ''}`}>
                  {col.render ? col.render(item) : String((item as unknown as Record<string, unknown>)[col.key] ?? '—')}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="p-2">
                  <div className="inline-flex gap-2">
                    {actions
                      .filter((action) => !action.condition || action.condition(item))
                      .map((action, index) => {
                        const content = (
                          <button
                            key={index}
                            className={`btn btn-sm ${action.className || ''}`}
                            onClick={action.onClick ? () => action.onClick!(item) : undefined}
                          >
                            {action.label}
                          </button>
                        );

                        if (action.to) {
                          const href = typeof action.to === 'function' ? action.to(item) : action.to;
                          return (
                            <Link key={index} to={href} className={`btn btn-sm ${action.className || ''}`}>
                              {action.label}
                            </Link>
                          );
                        }

                        return content;
                      })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
