// =============================================
// File: screens/Services/components/ServicesTabsNav.tsx
// =============================================
import React from 'react'
import {ServicesTabs} from './types'

type Tab = {id: ServicesTabs; label: string; disabled?: boolean}

interface ServicesTabsNavProps {
  activeTab: ServicesTabs
  onChange: (tab: ServicesTabs) => void
}

export const ServicesTabsNav: React.FC<ServicesTabsNavProps> = ({activeTab, onChange}) => {
  const tabs: Tab[] = [
    {id: ServicesTabs.OVERVIEW, label: 'Overview'},
    {id: ServicesTabs.PRODUCTS_AND_SERVICES, label: 'Products & Services'},
  ]

  return (
    <div className='border-b border-gray-200 mt-6'>
      <nav className='-mb-px flex space-x-8'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            disabled={tab.disabled}
            className={`py-2 px-1 border-b-2 font-semibold text-base ${
              activeTab === tab.id
                ? 'border-primaryColor text-primaryColor'
                : tab.disabled
                  ? 'border-transparent text-gray-400 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
