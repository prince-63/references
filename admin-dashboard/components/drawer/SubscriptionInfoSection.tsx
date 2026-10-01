import type { UserProfile } from '@/lib/types';
import Toggle from '../ui/Toggle';

interface SubscriptionInfoSectionProps {
  user: UserProfile;
  formData: Record<string, unknown>;
  onToggle: (field: string, value: boolean) => void;
  onInputChange: (field: string, value: string | number) => void;
  readOnly?: boolean;
}

export default function SubscriptionInfoSection({
  user,
  formData,
  onToggle,
  onInputChange,
  readOnly = false,
}: SubscriptionInfoSectionProps) {
  if (!user.subscription_id) return null;

  const isOwnerProfile =
    !!user.is_admin || user.profile_type?.toUpperCase().includes('OWNER');

  const planHierarchy = [
    'STARTER',
    'LITE',
    'GROWTH',
    'PROFESSIONAL',
    'ENTERPRISE',
  ];
  const currentPlanIndex = planHierarchy.indexOf(
    user.plan_name?.toUpperCase() || ''
  );

  const planStatusOptions = ['ACTIVE', 'INACTIVE', 'CANCELLED', 'SUSPENDED'];
  const planTypeOptions = ['TRIAL', 'MONTHLY', 'YEARLY'];

  const getUsageColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 95) return 'text-red-700 bg-red-50 border border-red-200';
    if (percentage >= 80)
      return 'text-amber-700 bg-amber-50 border border-amber-200';
    return 'text-[#735bf2] bg-purple-50 border border-purple-200';
  };

  const getProgressBarColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 95) return 'bg-red-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-[#735bf2]';
  };

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 px-4 sm:px-6 border-b border-gray-200">
        Subscription Info
      </h3>
      <div className="px-4 py-1 space-y-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Subscription ID
            </label>
            <div className="text-sm text-gray-900 font-mono break-all">
              {user.subscription_id}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Plan Status
            </label>
            <select
              value={
                (formData.plan_status as string | undefined) ??
                user.plan_status ??
                ''
              }
              onChange={(e) => onInputChange('plan_status', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select Status</option>
              {planStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Plan Name
            </label>
            <select
              value={
                (formData.plan_name as string | undefined) ??
                user.plan_name ??
                ''
              }
              onChange={(e) => onInputChange('plan_name', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select Plan</option>
              {planHierarchy.map((plan, index) => (
                <option
                  key={plan}
                  value={plan}
                  disabled={currentPlanIndex !== -1 && index < currentPlanIndex}
                >
                  {plan}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Plan Type
            </label>
            <select
              value={
                (formData.plan_type as string | undefined) ??
                user.plan_type ??
                ''
              }
              onChange={(e) => onInputChange('plan_type', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">Select Type</option>
              {planTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-0">
          <Toggle
            label="Plan Upgraded"
            enabled={
              (formData.is_plan_upgraded as boolean | undefined) ??
              user.is_plan_upgraded ??
              false
            }
            onChange={(value) => onToggle('is_plan_upgraded', value)}
            disabled={readOnly}
          />
          <Toggle
            label="Trial Plan"
            enabled={
              (formData.is_trial_plan as boolean | undefined) ??
              user.is_trial_plan ??
              false
            }
            onChange={(value) => onToggle('is_trial_plan', value)}
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
            Total Limits
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Patients
              </label>
              <input
                type="number"
                value={
                  (formData.total_patients as number | undefined) ??
                  user.total_patients ??
                  0
                }
                onChange={(e) =>
                  onInputChange('total_patients', parseInt(e.target.value) || 0)
                }
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {readOnly &&
                isOwnerProfile &&
                (user.patients_used !== undefined ? (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Usage
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getUsageColor(user.patients_used, user.total_patients ?? 0)}`}
                      >
                        {user.patients_used} / {user.total_patients ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-lg h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-lg transition-all duration-300 ${getProgressBarColor(user.patients_used, user.total_patients ?? 0)}`}
                        style={{
                          width: `${Math.min((user.patients_used / (user.total_patients ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null)}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Orders
              </label>
              <input
                type="number"
                value={
                  (formData.total_orders as number | undefined) ??
                  user.total_orders ??
                  0
                }
                onChange={(e) =>
                  onInputChange('total_orders', parseInt(e.target.value) || 0)
                }
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {readOnly &&
                isOwnerProfile &&
                (user.orders_used !== undefined ? (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Usage
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getUsageColor(user.orders_used, user.total_orders ?? 0)}`}
                      >
                        {user.orders_used} / {user.total_orders ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-lg h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-lg transition-all duration-300 ${getProgressBarColor(user.orders_used, user.total_orders ?? 0)}`}
                        style={{
                          width: `${Math.min((user.orders_used / (user.total_orders ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null)}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Storage (GB)
              </label>
              <input
                type="number"
                value={
                  (formData.total_storage_gb as number | undefined) ??
                  user.total_storage_gb ??
                  0
                }
                onChange={(e) =>
                  onInputChange(
                    'total_storage_gb',
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {readOnly &&
                isOwnerProfile &&
                (user.storage_used_mb !== undefined ? (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Usage
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getUsageColor(user.storage_used_mb / 1024, user.total_storage_gb ?? 0)}`}
                      >
                        {(user.storage_used_mb / 1024).toFixed(2)} /{' '}
                        {user.total_storage_gb ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-lg h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-lg transition-all duration-300 ${getProgressBarColor(user.storage_used_mb / 1024, user.total_storage_gb ?? 0)}`}
                        style={{
                          width: `${Math.min((user.storage_used_mb / 1024 / (user.total_storage_gb ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null)}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Users
              </label>
              <input
                type="number"
                value={
                  (formData.total_users as number | undefined) ??
                  user.total_users ??
                  0
                }
                onChange={(e) =>
                  onInputChange('total_users', parseInt(e.target.value) || 0)
                }
                disabled={readOnly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
              {readOnly &&
                isOwnerProfile &&
                (user.users_used !== undefined ? (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
                        Usage
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded ${getUsageColor(user.users_used, user.total_users ?? 0)}`}
                      >
                        {user.users_used} / {user.total_users ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-lg h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-lg transition-all duration-300 ${getProgressBarColor(user.users_used, user.total_users ?? 0)}`}
                        style={{
                          width: `${Math.min((user.users_used / (user.total_users ?? 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null)}
            </div>
          </div>
        </div>

        <div className="space-y-0">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
            Feature Toggles
          </label>
          <Toggle
            label="Demo Completed"
            enabled={
              (formData.is_demo_completed as boolean | undefined) ??
              user.is_demo_completed ??
              false
            }
            onChange={(value) => onToggle('is_demo_completed', value)}
            disabled={readOnly}
          />
          <Toggle
            label="GDrive Platform"
            enabled={
              (formData.isgdrive_platform_enabled as boolean | undefined) ??
              user.isgdrive_platform_enabled ??
              false
            }
            onChange={(value) => onToggle('isgdrive_platform_enabled', value)}
            disabled={readOnly}
          />
          <Toggle
            label="WhatsApp Messaging"
            enabled={
              (formData.is_whats_app_messaging_enabled as
                | boolean
                | undefined) ??
              user.is_whats_app_messaging_enabled ??
              false
            }
            onChange={(value) =>
              onToggle('is_whats_app_messaging_enabled', value)
            }
            disabled={readOnly}
          />
        </div>
      </div>
    </section>
  );
}
