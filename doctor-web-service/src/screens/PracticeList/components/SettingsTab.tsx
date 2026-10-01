import {useEffect, useState} from 'react'
import {Spin} from 'antd'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import TrackingTab from '../components/TrackingTab'
import CustomerServicePage from './CustomerServicePage'
import useAllUserPlan from '@hooks/useAllUserPlan'
import ShippingAddressSettings from './ShippingAddressSettings'

const SettingsTab = () => {
  const [activeSection, setActiveSection] = useState<'PRODUCTS' | 'SHIPPING' | 'TRACKING'>(
    'PRODUCTS'
  )
  const {isPractice} = useAllUserPlan()
  const {loadingMiniDashboard} = useSelector((state: RootState) => state.profile)
  const readMode = isPractice
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const isTrackingEnabled = serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
  const planningService = serviceConfig?.PLANNING
  const shouldShowShipping = !planningService

  useEffect(() => {
    if (readMode || !isTrackingEnabled) {
      setActiveSection('PRODUCTS')
    }
  }, [readMode, isTrackingEnabled])

  useEffect(() => {
    if (!shouldShowShipping && activeSection === 'SHIPPING') {
      setActiveSection('PRODUCTS')
    }
  }, [activeSection, shouldShowShipping])

  return (
    <div className='flex flex-col md:flex-row gap-4 md:gap-6 mt-4'>
      <div className='w-full md:w-64 md:p-4 bg-white md:border rounded flex flex-row sm:flex-col text-sm md:text-base'>
        <button
          type='button'
          className={`text-left p-2 rounded ${
            activeSection === 'PRODUCTS'
              ? 'bg-primarySupport text-primaryColor font-medium'
              : 'text-textColor hover:bg-gray-50'
          }`}
          onClick={() => setActiveSection('PRODUCTS')}
        >
          Products and Services
        </button>

        {shouldShowShipping && (
          <button
            type='button'
            className={`text-left p-2 rounded mt-1 ${
              activeSection === 'SHIPPING'
                ? 'bg-primarySupport text-primaryColor font-medium'
                : 'text-textColor hover:bg-gray-50'
            }`}
            onClick={() => setActiveSection('SHIPPING')}
          >
            Shipping Address
          </button>
        )}

        {!!isTrackingEnabled && (
          <button
            type='button'
            className={`text-left p-2 rounded mt-1 ${
              activeSection === 'TRACKING'
                ? 'bg-primarySupport text-primaryColor font-medium'
                : 'text-textColor hover:bg-gray-50'
            }`}
            onClick={() => setActiveSection('TRACKING')}
            disabled={!isTrackingEnabled}
          >
            Tracking
          </button>
        )}

        {/* <button
          type='button'
          className={`text-left p-2 rounded mt-1 ${
            activeSection === 'ADDITIONAL'
              ? 'bg-primarySupport text-primaryColor font-medium'
              : 'text-textColor hover:bg-gray-50'
          }`}
          onClick={() => setActiveSection('ADDITIONAL')}
        >
          Additional Settings
        </button> */}
      </div>

      <div className='flex-1 min-w-0'>
        {activeSection === 'PRODUCTS' && <CustomerServicePage readMode={readMode} />}
        {shouldShowShipping && activeSection === 'SHIPPING' && (
          <ShippingAddressSettings readMode={readMode} />
        )}
        {!!isTrackingEnabled && activeSection === 'TRACKING' && (
          <Spin spinning={loadingMiniDashboard}>
            <TrackingTab />
          </Spin>
        )}

        {/* {activeSection === 'ADDITIONAL' && <AdditionalSettingsTab />} */}
      </div>
    </div>
  )
}

export default SettingsTab
