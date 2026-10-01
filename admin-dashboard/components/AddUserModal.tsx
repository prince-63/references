'use client';

import { useMemo, useState } from 'react';
import { useEnvironment } from '@/lib/EnvironmentContext';
import { useToast } from '@/lib/toast';
import { logger } from '@/lib/logger';
import type { AddUserSignupRequest, SignupApiResponse } from '@/lib/types';
import {
  SIGNUP_ORGANIZATION_OPTIONS,
  SIGNUP_ROLE_OPTIONS,
} from '@/lib/signupOptions';
import Button from './ui/Button';

interface AddUserModalProps {
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

function buildDeviceInfo() {
  if (typeof window === 'undefined') {
    return {
      fingerprint: Date.now(),
      brand: 'Linux',
      device_type: 'x86_64',
      model_name: 'amd64',
      ip: '',
      mac: '',
    };
  }

  const platform = navigator.platform || 'Linux x86_64';
  const parts = platform.split(' ');
  const brand = parts[0] || 'Linux';
  const deviceType =
    parts[1] || platform.replace(/^[A-Za-z]+\s*/, '') || 'x86_64';

  return {
    fingerprint: Math.abs(
      Array.from(
        `${navigator.userAgent}-${navigator.language}-${new Date().getTimezoneOffset()}`
      )
        .join('')
        .split('')
        .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
    ),
    brand,
    device_type: deviceType,
    model_name: 'amd64',
    ip: '',
    mac: '',
  };
}

function simplifyErrorMessage(error: string): string {
  const message = error.replace(/\s*\([A-Z0-9_]+\)\s*$/, '');

  if (message.includes('already signed up')) {
    const emailMatch = message.match(/email\s*`([^`]+)`/);
    if (emailMatch) {
      return `This email (${emailMatch[1]}) is already registered.`;
    }
    return 'This email is already registered.';
  }

  if (message.includes('not found')) {
    return 'User information not found. Please try again.';
  }

  const cleaned = message
    .replace(/`([^`]*)`/g, '$1')
    .replace(/,?\s*mobile no\.\s*null/i, '');

  return cleaned;
}

export default function AddUserModal({
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const { environment } = useEnvironment();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    org_name: 'DENTALSTACK',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    country_code: '+91',
    salutation: 'Dr',
    role: 'ENTERPRISE_COMPANY_LAB',
  });

  const canSubmit = useMemo(
    () =>
      !!form.org_name &&
      !!form.email &&
      !!form.password &&
      !!form.first_name &&
      !!form.role,
    [form]
  );

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    try {
      const payload: AddUserSignupRequest = {
        environment,
        org_name: form.org_name,
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        country_code: form.country_code.trim() || '+91',
        salutation: form.salutation.trim() || 'Dr',
        role: form.role,
        user_type: 'DOCTOR',
        user_consent: true,
        mobile_no: null,
        organization_id: null,
        profile_id: null,
        doctor_id: null,
        device_info_details: buildDeviceInfo(),
      };

      logger.info('Submitting Add User form', {
        email: payload.email,
        environment,
        organization: payload.org_name,
      });

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | SignupApiResponse
        | { error?: string; step?: string }
        | null;

      if (!response.ok) {
        const errorMessage =
          (result as { error?: string } | null)?.error ||
          'Failed to create user. Please try again.';
        const userFriendlyMessage = simplifyErrorMessage(errorMessage);
        toast.error('Add user failed', userFriendlyMessage);
        return;
      }

      toast.success(
        'User created',
        `${payload.email} has been registered successfully.`
      );
      await onSuccess();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.';
      toast.error('Add user error', simplifyErrorMessage(message));
      logger.error(
        'Add user creation failed',
        { email: form.email, environment },
        error as Error
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto bg-white rounded-xl shadow-2xl border border-gray-200">
          <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add User</h2>
              <p className="text-sm text-gray-500">
                Create a new doctor user account
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="px-4 py-5 grid grid-cols-1 md:grid-cols-2 gap-4 sm:px-6">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Organization
              </label>
              <select
                value={form.org_name}
                onChange={(e) => updateField('org_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors"
              >
                {SIGNUP_ORGANIZATION_OPTIONS.map((org) => (
                  <option key={org} value={org}>
                    {org}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 bg-white hover:border-gray-400 transition-colors"
              >
                {SIGNUP_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 placeholder:text-gray-400"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 placeholder:text-gray-400"
                placeholder="Enter password"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                First Name
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => updateField('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 placeholder:text-gray-400"
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => updateField('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900 placeholder:text-gray-400"
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Country Code
              </label>
              <input
                type="text"
                value={form.country_code}
                onChange={(e) => updateField('country_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900"
                placeholder="+91"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">
                Salutation
              </label>
              <input
                type="text"
                value={form.salutation}
                onChange={(e) => updateField('salutation', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none text-gray-900"
                placeholder="Dr"
              />
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3 sm:px-6">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={submitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full sm:w-auto"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
