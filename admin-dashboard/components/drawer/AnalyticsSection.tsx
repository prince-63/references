'use client';

import { useState, useEffect } from 'react';
import type { UserProfile } from '@/lib/types';
import { useEnvironment } from '@/lib/EnvironmentContext';
import { logger } from '@/lib/logger';

interface AnalyticsData {
  patient_count: number;
  order_count: number;
}

interface AnalyticsSectionProps {
  user: UserProfile;
  readOnly?: boolean;
}

export default function AnalyticsSection({
  user,
  readOnly = false,
}: AnalyticsSectionProps) {
  const { environment } = useEnvironment();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (readOnly === false) {
      return;
    }

    const fetchAnalytics = async () => {
      if (!user || !user.organization_id) {
        return;
      }

      setLoading(true);
      try {
        logger.info('Fetching analytics data', {
          organizationId: user.organization_id,
          environment,
        });

        const params = new URLSearchParams({
          organization_id: user.organization_id.toString(),
          environment,
        });

        const response = await fetch(`/api/analytics?${params}`);

        if (response.ok) {
          const data: AnalyticsData = await response.json();
          logger.debug('Analytics data fetched successfully', {
            organizationId: user.organization_id,
            patientCount: data.patient_count,
            orderCount: data.order_count,
          });
          setAnalyticsData(data);
        } else {
          logger.warn('Failed to fetch analytics data', {
            status: response.status,
            organizationId: user.organization_id,
          });
        }
      } catch (error) {
        logger.error('Error fetching analytics data', {
          error,
          organizationId: user.organization_id,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, environment, readOnly]);

  if (readOnly === false) {
    return null;
  }

  if (!analyticsData && !loading) {
    return null;
  }

  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-3 px-4 sm:px-6 border-b border-gray-200">
        Analytics (Last 30 Days)
      </h3>
      <div className="px-4 py-1 sm:px-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Patients Added
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.patient_count}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Orders
              </div>
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.order_count}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
