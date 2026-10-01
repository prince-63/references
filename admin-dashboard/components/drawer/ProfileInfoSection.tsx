import type { UserProfile } from '@/lib/types';

interface ProfileInfoSectionProps {
  user: UserProfile;
  readOnly?: boolean;
}

export default function ProfileInfoSection({
  user,
  readOnly = false,
}: ProfileInfoSectionProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 px-4 sm:px-6 border-b border-gray-200">
        Profile Info
      </h3>
      <div className="px-4 py-1 space-y-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Profile ID
            </label>
            <div className="text-sm text-gray-900 font-mono break-all">
              {user.profile_id}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Profile Type
            </label>
            <div className="text-sm text-gray-900">{user.profile_type}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Profile Status
            </label>
            <div className="text-sm text-gray-900 capitalize">
              {user.profile_status}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Is Admin
            </label>
            <div className="text-sm text-gray-900">
              {user.is_admin ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
        {(!readOnly || user.organization_brand_name) && (
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Organization
            </label>
            <div className="text-sm text-gray-900">
              {user.organization_brand_name || '-'}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
