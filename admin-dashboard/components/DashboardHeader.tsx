'use client';

import Image from 'next/image';
import SearchBar from './SearchBar';
import { useEnvironment } from '@/lib/EnvironmentContext';
import { useAuth } from '@/lib/AuthContext';
import { getAllowedEnvironments } from '@/lib/config';

interface DashboardHeaderProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  hasActiveSearch: boolean;
}

export default function DashboardHeader({
  onSearch,
  onClear,
  hasActiveSearch,
}: DashboardHeaderProps) {
  const { environment, setEnvironment } = useEnvironment();
  const { logout } = useAuth();
  const allowedEnvironments = getAllowedEnvironments();

  const envStyles = {
    development: 'bg-blue-100 text-blue-700 border-blue-300',
    staging: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    production: 'bg-red-100 text-red-700 border-red-300',
  };

  const envLabels = {
    development: 'DEV',
    staging: 'STAGING',
    production: 'PROD',
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-5">
        <div className="py-3 sm:py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-5">
              <Image
                src="/Dental Stack Logo.svg"
                alt="Dental Stack"
                width={120}
                height={44}
              />
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[auto_1fr_auto] sm:items-center xl:w-auto xl:min-w-190">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Database:
                </span>
                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                  {allowedEnvironments.map((env) => {
                    return (
                      <button
                        key={env}
                        onClick={() => setEnvironment(env)}
                        className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                          environment === env
                            ? envStyles[env]
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {envLabels[env]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <SearchBar
                onSearch={onSearch}
                onClear={onClear}
                hasActiveSearch={hasActiveSearch}
              />

              <div className="w-full sm:w-auto">
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-sm font-semibold text-white bg-[#735bf2] hover:bg-[#5d47c4] rounded-lg transition-colors sm:w-auto"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
