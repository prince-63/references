import type { DashboardSortField, SortOrder } from '@/lib/types';

interface TableHeaderProps {
  sortBy: DashboardSortField;
  sortOrder: SortOrder;
  onSort: (field: DashboardSortField) => void;
}

export default function TableHeader({
  sortBy,
  sortOrder,
  onSort,
}: TableHeaderProps) {
  const columns: Array<{
    key?: DashboardSortField;
    label: string;
    align?: 'left' | 'center';
    sortable?: boolean;
  }> = [
    { key: 'profile_id', label: 'ID', sortable: true },
    { key: 'display_name', label: 'User Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'mobile_no', label: 'Mobile No', sortable: true },
    { label: 'Organization', sortable: false },
    { key: 'profile_type', label: 'Profile Type', sortable: true },
    { label: 'Plan Name', sortable: false },
    { label: 'Patients Use', sortable: false },
    { label: 'Orders Use', sortable: false },
    { label: 'Users Use', sortable: false },
    { label: 'Storage Use', sortable: false },
    { key: 'current_term_start', label: 'Term Start', sortable: true },
    { key: 'next_billing_at', label: 'Term End', sortable: true },
  ];

  return (
    <thead className="bg-gray-50">
      <tr>
        {columns.map((column, index) => {
          const isSortable = column.sortable !== false && !!column.key;
          const isActive = isSortable && sortBy === column.key;
          const arrow = isActive ? (sortOrder === 'asc' ? '↑' : '↓') : '↕';

          return (
            <th
              key={column.key ?? `${column.label}-${index}`}
              className={`px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap ${
                column.align === 'center' ? 'text-center' : 'text-left'
              }`}
            >
              {isSortable ? (
                <button
                  type="button"
                  onClick={() => onSort(column.key!)}
                  className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
                >
                  <span>{column.label}</span>
                  <span
                    className={`text-[10px] ${isActive ? 'text-[#735bf2]' : 'text-gray-400'}`}
                  >
                    {arrow}
                  </span>
                </button>
              ) : (
                <span>{column.label}</span>
              )}
            </th>
          );
        })}
        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"></th>
      </tr>
    </thead>
  );
}
