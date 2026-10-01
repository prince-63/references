import type { UserProfile } from '@/lib/types';

interface UserInfoSectionProps {
  user: UserProfile;
  readOnly?: boolean;
}

export default function UserInfoSection({
  user,
  readOnly = false,
}: UserInfoSectionProps) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 px-4 sm:px-6 border-b border-gray-200">
        User Info
      </h3>
      <div className="px-4 py-1 space-y-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              User ID
            </label>
            <div className="text-sm text-gray-900 font-mono break-all">
              {user.user_id}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Status
            </label>
            <div className="text-sm text-gray-900 capitalize">
              {user.user_status}
            </div>
          </div>
        </div>
        {(!readOnly || user.display_name) && (
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Name
            </label>
            <div className="text-sm text-gray-900">
              {user.display_name || '-'}
            </div>
          </div>
        )}
        {(!readOnly || user.email) && (
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Email
            </label>
            <div className="text-sm text-gray-900 break-all">
              {user.email || '-'}
            </div>
          </div>
        )}
        {(!readOnly || user.mobile_no) && (
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Mobile No
            </label>
            <div className="text-sm text-gray-900">{user.mobile_no || '-'}</div>
          </div>
        )}
      </div>
    </section>
  );
}
