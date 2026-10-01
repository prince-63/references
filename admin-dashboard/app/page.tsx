'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  UserProfile,
  DashboardResponse,
  DashboardSortField,
  SortOrder,
} from '@/lib/types';
import DashboardHeader from '@/components/DashboardHeader';
import DataTable from '@/components/table/DataTable';
import Pagination from '@/components/Pagination';
import DetailsDrawer from '@/components/DetailsDrawer';
import AddUserModal from '@/components/AddUserModal';
import { useEnvironment } from '@/lib/EnvironmentContext';
import { useAuth } from '@/lib/AuthContext';
import LoginForm from '@/components/LoginForm';
import { useToast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/errorHandler';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { environment } = useEnvironment();
  const toast = useToast();
  const [data, setData] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [organizationFilter, setOrganizationFilter] = useState('');
  const [planNameFilter, setPlanNameFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<DashboardSortField>('profile_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedMode, setSelectedMode] = useState<'view' | 'edit'>('view');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const pageSize = 10;

  const organizationOptions = [
    'SYNAPSE',
    'SMILEZY',
    'SMILEXCEL',
    'SMILECAPS',
    'ROUTETOSMILE',
    'EVOLVALIGN',
    'DENTALSTACK',
    'CRAFTALIGN',
    'CLEARCASTLE',
    'AMEND',
    'ALIGNEAZY',
    'AIIQALIGNER',
  ];

  const planNameOptions = [
    'STARTER_PLAN',
    'LITE_PLAN',
    'GROWTH_PLAN',
    'PROFESSIONAL',
    'ENTERPRISE',
    'DESIGN_LAB',
  ];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      logger.info('Fetching dashboard data', {
        page,
        environment,
        sortBy,
        sortOrder,
      });

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        environment,
        sortBy,
        sortOrder,
      });
      if (search) {
        params.append('search', search);
      }
      if (organizationFilter) {
        params.append('organization', organizationFilter);
      }
      if (planNameFilter) {
        params.append('planName', planNameFilter);
      }

      const response = await fetch(`/api/dashboard?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result: DashboardResponse = await response.json();

      setData(result.data || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);

      logger.debug('Dashboard data loaded', {
        count: result.data?.length,
        total: result.total,
      });
    } catch (error) {
      const apiError = handleApiError(error, 'Dashboard data fetch');
      logger.error(
        'Failed to fetch dashboard data',
        { page, environment },
        error as Error
      );
      toast.error('Failed to load dashboard', apiError.userMessage);
      setData([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    environment,
    sortBy,
    sortOrder,
    organizationFilter,
    planNameFilter,
    toast,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  const handleClearFilters = () => {
    setOrganizationFilter('');
    setPlanNameFilter('');
    setPage(1);
  };

  const handleSort = (field: DashboardSortField) => {
    setPage(1);
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortOrder('asc');
  };

  const handleSaveUpdates = async (updates: Record<string, unknown>) => {
    if (!selectedUser) return;

    try {
      logger.info('Saving user updates', {
        profile_id: selectedUser.profile_id,
        updates,
      });

      if (updates.service_items !== undefined) {
        logger.debug('Updating service items', {
          profile_id: selectedUser.profile_id,
        });
        const response = await fetch('/api/service-items', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: selectedUser.profile_id,
            service_item_ids: updates.service_items,
            environment,
          }),
        });

        if (!response.ok) {
          throw new Error(
            'Unable to save your service selections. Please try again.'
          );
        }

        delete updates.service_items;
      }

      if (updates.service_products !== undefined) {
        const serviceProducts = updates.service_products as {
          productsToAdd?: string[];
          productsToDelete?: number[];
        };
        const { productsToAdd = [], productsToDelete = [] } = serviceProducts;
        logger.debug('Updating service products', {
          profile_id: selectedUser.profile_id,
          toAdd: productsToAdd.length,
          toDelete: productsToDelete.length,
        });

        for (const productId of productsToDelete) {
          const response = await fetch('/api/service-products', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              product_id: productId,
              profile_id: selectedUser.profile_id,
              environment,
            }),
          });

          if (!response.ok) {
            throw new Error('Unable to remove a product. Please try again.');
          }
        }

        for (const template of productsToAdd) {
          const response = await fetch('/api/service-products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profile_id: selectedUser.profile_id,
              product_template: template,
              environment,
            }),
          });

          if (!response.ok) {
            throw new Error('Unable to add a product. Please try again.');
          }
        }

        delete updates.service_products;
      }

      if (Object.keys(updates).length > 0) {
        logger.debug('Updating user profile', {
          profile_id: selectedUser.profile_id,
        });
        const response = await fetch('/api/dashboard', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: selectedUser.profile_id,
            subscription_id: selectedUser.subscription_id,
            environment,
            updates,
          }),
        });

        if (!response.ok) {
          throw new Error('Unable to save your changes. Please try again.');
        }
      }

      logger.info('User updates saved successfully', {
        profile_id: selectedUser.profile_id,
      });
      toast.success(
        'Changes saved',
        'User information has been updated successfully.'
      );
      await fetchData();
    } catch (error) {
      const apiError = handleApiError(error, 'Save user updates');
      logger.error(
        'Failed to save user updates',
        { profile_id: selectedUser.profile_id },
        error as Error
      );
      toast.error('Failed to save changes', apiError.userMessage);
    }
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onSearch={handleSearch}
        onClear={handleClearSearch}
        hasActiveSearch={!!search}
      />

      <main className="max-w-screen-1xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Organization
            </label>
            <select
              value={organizationFilter}
              onChange={(e) => {
                setOrganizationFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors"
            >
              <option value="">All</option>
              {organizationOptions.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">
              Plan Name
            </label>
            <select
              value={planNameFilter}
              onChange={(e) => {
                setPlanNameFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors"
            >
              <option value="">All</option>
              {planNameOptions.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end w-full">
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>

          <div className="flex items-end w-full xl:justify-end">
            <button
              type="button"
              onClick={() => setShowAddUserModal(true)}
              className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#735bf2] hover:bg-[#5d47c4] rounded-lg transition-colors xl:max-w-40"
            >
              Add User
            </button>
          </div>
        </div>

        <DataTable
          data={data}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onViewDetails={(user, mode) => {
            setSelectedUser(user);
            setSelectedMode(mode);
          }}
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </main>

      {selectedUser && (
        <DetailsDrawer
          user={selectedUser}
          mode={selectedMode}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUpdates}
        />
      )}

      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSuccess={async () => {
            setPage(1);
            await fetchData();
          }}
        />
      )}
    </div>
  );
}
