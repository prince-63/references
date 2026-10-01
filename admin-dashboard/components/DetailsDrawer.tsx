'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/types';
import { logger } from '@/lib/logger';
import { handleApiError } from '@/lib/errorHandler';
import DrawerHeader from './drawer/DrawerHeader';
import DrawerFooter from './drawer/DrawerFooter';
import UserInfoSection from './drawer/UserInfoSection';
import ProfileInfoSection from './drawer/ProfileInfoSection';
import SubscriptionInfoSection from './drawer/SubscriptionInfoSection';
import BillingInfoSection from './drawer/BillingInfoSection';
import ServiceConfigSection from './drawer/ServiceConfigSection';
import AnalyticsSection from './drawer/AnalyticsSection';

interface DetailsDrawerProps {
  user: UserProfile | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSave: (updates: Record<string, unknown>) => Promise<void>;
}

export default function DetailsDrawer({
  user,
  mode,
  onClose,
  onSave,
}: DetailsDrawerProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  if (!user) return null;

  const isOwnerProfile =
    !!user.is_admin || user.profile_type?.toUpperCase().includes('OWNER');
  const canShowSubscriptionSection =
    user.subscription_id && (mode === 'view' || isOwnerProfile);

  const handleToggle = (field: string, value: boolean) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateChange = (field: string, value: string) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceItemsChange = (serviceItemIds: number[]) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      service_items: serviceItemIds,
    }));
  };

  const handleProductsChange = (changes: {
    productsToAdd: string[];
    productsToDelete: number[];
  }) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      service_products: changes,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      logger.info('Saving profile changes', {
        profileId: user?.profile_id,
        changes: Object.keys(formData),
      });
      await onSave(formData);
      logger.info('Profile changes saved successfully', {
        profileId: user?.profile_id,
      });
      // toast.success('Changes saved successfully!');
      setFormData({});
      onClose();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const apiError = handleApiError(error);
      logger.error('Failed to save profile changes', {
        error,
        profileId: user?.profile_id,
      });
      // toast.error(apiError.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(formData).length > 0;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-full md:max-w-3xl bg-white shadow-2xl z-50 overflow-y-auto">
        <DrawerHeader mode={mode} onClose={onClose} />

        <div className="py-5 space-y-7 sm:py-6 sm:space-y-8">
          <UserInfoSection user={user} />
          <ProfileInfoSection user={user} readOnly={mode === 'view'} />
          {canShowSubscriptionSection && (
            <SubscriptionInfoSection
              user={user}
              formData={formData}
              onToggle={handleToggle}
              onInputChange={handleInputChange}
              readOnly={mode === 'view'}
            />
          )}
          {canShowSubscriptionSection && (
            <BillingInfoSection
              user={user}
              formData={formData}
              onDateChange={handleDateChange}
              readOnly={mode === 'view'}
            />
          )}
          {(mode === 'edit' ||
            user.service_config_id ||
            (user.service_items && user.service_items.length > 0)) && (
            <ServiceConfigSection
              user={user}
              readOnly={mode === 'view'}
              onServiceItemsChange={handleServiceItemsChange}
              onProductsChange={handleProductsChange}
            />
          )}
          <AnalyticsSection user={user} readOnly={mode === 'view'} />
        </div>

        {mode === 'edit' && (
          <DrawerFooter
            onClose={onClose}
            onSave={handleSave}
            hasChanges={hasChanges}
            saving={saving}
          />
        )}
      </div>
    </>
  );
}
