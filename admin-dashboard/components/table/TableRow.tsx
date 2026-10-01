'use client';

import React, { useState } from 'react';
import type { UserProfile, SignupApiResponse } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import Button from '@/components/ui/Button';
import { useEnvironment } from '@/lib/EnvironmentContext';
import { getAuthBaseUrlClient } from '@/lib/authClientConfig';

interface TableRowProps {
  user: UserProfile;
  onViewDetails: (user: UserProfile, mode: 'view' | 'edit') => void;
}

export default function TableRow({ user, onViewDetails }: TableRowProps) {
  const { isAuthenticated } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [passwordResults, setPasswordResults] = useState<
    SignupApiResponse[] | null
  >(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);
  const [unblockMessage, setUnblockMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const { environment } = useEnvironment();

  const loadMoreInfoDetails = async () => {
    if (!user?.email) return;
    setPasswordError(null);
    setIsLoadingPassword(true);
    setShowPasswordModal(true);

    try {
      const base = getAuthBaseUrlClient(environment);
      const resp = await fetch(`${base}/auth/v1/admin/get-password`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Server returned ${resp.status}: ${text}`);
      }

      const data = (await resp.json()) as SignupApiResponse[];
      setPasswordResults(data || []);
    } catch (err) {
      // show a friendly message
      setPasswordError(
        (err as Error).message || 'Failed to fetch password info'
      );
      setPasswordResults(null);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleUnblock = async (email: string, userId: number | null) => {
    setUnblockingId(userId);
    setUnblockMessage(null);

    try {
      const base = getAuthBaseUrlClient(environment);
      const resp = await fetch(`${base}/auth/v1/admin/unblock`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to unblock: ${resp.status} - ${text}`);
      }

      setUnblockMessage({
        type: 'success',
        text: 'User unblocked successfully.',
      });
      // Refresh password details after unblock
      setTimeout(() => loadMoreInfoDetails(), 1000);
    } catch (err) {
      setUnblockMessage({
        type: 'error',
        text: (err as Error).message || 'Failed to unblock user',
      });
    } finally {
      setUnblockingId(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const hasSubscription = !!user.subscription_id;
  const isOwnerProfile =
    !!user.is_admin || user.profile_type?.toUpperCase().includes('OWNER');
  const canShowUsage = hasSubscription && isOwnerProfile;

  const formatUsage = (
    used: number | undefined,
    total: number | null | undefined,
    suffix = ''
  ) => {
    if (
      !canShowUsage ||
      used === undefined ||
      total === null ||
      total === undefined
    ) {
      return '-';
    }

    return `${used}/${total}${suffix}`;
  };

  const formatStorageUsage = () => {
    if (
      !canShowUsage ||
      user.storage_used_mb === undefined ||
      user.total_storage_gb === null ||
      user.total_storage_gb === undefined
    ) {
      return '-';
    }

    const usedGb = user.storage_used_mb / 1024;
    return `${usedGb.toFixed(2)}/${user.total_storage_gb} GB`;
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-600 font-mono whitespace-nowrap">
        {user.profile_id}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {user.display_name || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
        {user.email}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {user.mobile_no || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
        {user.organization_brand_name || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {user.profile_type}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {user.plan_name || '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {formatUsage(user.patients_used, user.total_patients)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {formatUsage(user.orders_used, user.total_orders)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {formatUsage(user.users_used, user.total_users)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {formatStorageUsage()}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {formatDate(user.current_term_start)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
        {formatDate(user.next_billing_at)}
      </td>
      <td className="px-4 py-3 text-sm whitespace-nowrap">
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <>
              <Button
                onClick={() => loadMoreInfoDetails()}
                variant="secondary"
                size="sm"
                className="text-red-600 border-red-200 hover:border-red-300"
                disabled={isLoadingPassword}
                title="Admin: get password for debugging"
              >
                {isLoadingPassword ? 'Loading...' : 'Get Password'}
              </Button>

              {/* Password modal */}
              {showPasswordModal && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={`password-modal-${user.profile_id}`}
                  className="fixed inset-0 z-50 flex items-center justify-center px-4"
                >
                  <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setShowPasswordModal(false)}
                  />

                  <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 z-20">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
                      <div>
                        <h3
                          id={`password-modal-${user.profile_id}`}
                          className="text-xl font-bold text-gray-900"
                        >
                          Password Details
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Email:</span>{' '}
                          {user.email}
                        </p>
                      </div>
                      <Button
                        onClick={() => setShowPasswordModal(false)}
                        variant="ghost"
                        size="sm"
                      >
                        Close
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="max-h-[70vh] overflow-y-auto">
                      {isLoadingPassword && (
                        <div className="flex justify-center items-center py-12">
                          <div className="text-sm text-gray-600">
                            Loading password details…
                          </div>
                        </div>
                      )}

                      {passwordError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="text-sm text-red-700 font-medium">
                            Error: {passwordError}
                          </div>
                        </div>
                      )}

                      {!isLoadingPassword && !passwordError && (
                        <div className="space-y-4">
                          {passwordResults && passwordResults.length > 0 ? (
                            passwordResults.map((r) => (
                              <div
                                key={`${r.auth_id}-${r.user_id}`}
                                className="p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 transition-colors"
                              >
                                {/* Top row: Name + Unblock button */}
                                <div className="flex items-start justify-between gap-4 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-gray-900">
                                      {r.first_name} {r.last_name}
                                    </div>
                                  </div>
                                  {r.status === 'BLOCKED' && (
                                    <Button
                                      onClick={() =>
                                        handleUnblock(r.email, r.user_id)
                                      }
                                      variant="primary"
                                      size="sm"
                                      disabled={unblockingId === r.user_id}
                                      className="flex-shrink-0 whitespace-nowrap"
                                    >
                                      {unblockingId === r.user_id
                                        ? 'Unblocking...'
                                        : 'Unblock'}
                                    </Button>
                                  )}
                                </div>

                                {/* Metadata row */}
                                <div className="grid grid-cols-2 gap-4 mb-3 text-xs text-gray-600">
                                  <div>
                                    <span className="font-medium">ID:</span>{' '}
                                    {r.user_id}
                                  </div>
                                  <div>
                                    <span className="font-medium">Auth:</span>{' '}
                                    {r.auth_id}
                                  </div>
                                  <div>
                                    <span className="font-medium">Type:</span>{' '}
                                    {r.user_type}
                                  </div>
                                  <div>
                                    <span className="font-medium">Status:</span>{' '}
                                    <span
                                      className={
                                        r.status === 'BLOCKED'
                                          ? 'font-semibold text-red-600'
                                          : 'text-gray-700'
                                      }
                                    >
                                      {r.status}
                                    </span>
                                  </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-200 my-3" />

                                {/* Email field */}
                                <div className="mb-3">
                                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                    Email
                                  </label>
                                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900 font-mono break-all">
                                    {r.email}
                                  </div>
                                </div>

                                {/* Password field */}
                                <div>
                                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                                    Password
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900 font-mono break-all">
                                      {r.redirect_url ?? '-'}
                                    </div>
                                    <Button
                                      onClick={() => {
                                        try {
                                          navigator.clipboard.writeText(
                                            r.redirect_url || ''
                                          );
                                        } catch {
                                          // ignore
                                        }
                                      }}
                                      variant="secondary"
                                      size="sm"
                                      className="flex-shrink-0"
                                    >
                                      Copy
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 text-center text-sm text-gray-600">
                              No records found.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <button
            onClick={() => onViewDetails(user, 'view')}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            View
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => onViewDetails(user, 'edit')}
            className="text-[#735bf2] hover:text-[#5d47c4] font-medium transition-colors"
          >
            Edit
          </button>
        </div>
      </td>
    </tr>
  );
}
