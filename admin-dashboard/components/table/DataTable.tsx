import type { UserProfile, DashboardSortField, SortOrder } from '@/lib/types';
import TableHeader from './TableHeader';
import TableRow from './TableRow';

interface DataTableProps {
  data: UserProfile[];
  loading: boolean;
  sortBy: DashboardSortField;
  sortOrder: SortOrder;
  onSort: (field: DashboardSortField) => void;
  onViewDetails: (user: UserProfile, mode: 'view' | 'edit') => void;
}

export default function DataTable({
  data,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onViewDetails,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center py-12 text-gray-500">No results found</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <TableHeader
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.map((user, index) => (
                <TableRow
                  key={`${user.profile_id}-${user.subscription_id ?? 'no-sub'}-${user.service_config_id ?? 'no-sc'}-${index}`}
                  user={user}
                  onViewDetails={onViewDetails}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
