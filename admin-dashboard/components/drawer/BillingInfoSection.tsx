import type { UserProfile } from '@/lib/types';

interface BillingInfoSectionProps {
  user: UserProfile;
  formData: Record<string, unknown>;
  onDateChange: (field: string, value: string) => void;
  readOnly?: boolean;
}

export default function BillingInfoSection({
  user,
  formData,
  onDateChange,
  readOnly = false,
}: BillingInfoSectionProps) {
  if (!user.subscription_id) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
  };

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 px-4 sm:px-6 border-b border-gray-200">
        Billing Info
      </h3>
      <div className="px-4 py-1 space-y-5 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Next Billing Date
            </label>
            <input
              type="date"
              value={
                ((formData.next_billing_at as string | undefined) ??
                  formatDate(user.next_billing_at)) as string
              }
              onChange={(e) => onDateChange('next_billing_at', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
              Current Term End
            </label>
            <input
              type="date"
              value={
                ((formData.current_term_end as string | undefined) ??
                  formatDate(user.current_term_end)) as string
              }
              onChange={(e) => onDateChange('current_term_end', e.target.value)}
              disabled={readOnly}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
