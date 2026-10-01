import {useContext, useEffect, useState} from 'react'
import FeatureCard from './components/FeatureCard'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getServiceConfiguration,
  postEnableDisableService,
  ServiceConfigurationItem,
  ServiceConfigurationResponse,
  ServiceConfigurationResponseData,
} from 'redux/Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {safeParseInt} from 'utils/ConstFunctions'
import ModalCard from 'components/modalCard/ModalCard'

const StarterPlanServicePage = () => {
  const {profileId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [serviceList, setServiceList] = useState<ServiceConfigurationItem[]>([])
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceConfigurationItem | null>(null)
  const {loading} = useSelector((state: RootState) => state.serviceConfiguration)

  useEffect(() => {
    getStarterPlanConfiguration()
  }, [profileId])

  const getStarterPlanConfiguration = () => {
    if (!profileId) return
    dispatchAction(getServiceConfiguration({profileId: safeParseInt(profileId)}))
      .unwrap()
      .then((response: ServiceConfigurationResponse) => {
        const data: ServiceConfigurationResponseData = response?.data
        setServiceList([...data?.enabled_items, ...data?.disabled_items])
      })
  }

  const statusChange = (feature: ServiceConfigurationItem | null) => {
    if (!feature) return
    dispatchAction(
      postEnableDisableService({
        is_active: feature.is_active,
        config_id: safeParseInt(feature.id),
        profileId: safeParseInt(profileId),
      })
    )
      .unwrap()
      .then(() => {
        setConfirmModalOpen(false)
        getStarterPlanConfiguration()
      })
  }

  const getSubTitle = (isActive: boolean | undefined, itemName: string | undefined) => {
    if (itemName === 'BRACES ADD-ON' && isActive) {
      return 'This will turn on braces features for this account, allowing braces workflows and tracking to be used alongside aligners.'
    } else if (itemName === 'BRACES ADD-ON' && !isActive) {
      return 'Braces features will be turned off. Any active braces workflows will stop, and braces tools will no longer be accessible.'
    } else if (itemName === 'PAYMENT AND BILLING' && isActive) {
      return 'This will activate billing and payment tools for this account, allowing invoices, payments, and records to be managed in one place.'
    } else if (itemName === 'PAYMENT AND BILLING' && !isActive) {
      return 'Billing and payment tools will be turned off. Invoicing and payment tracking will no longer be available once disabled.'
    } else {
      return '-'
    }
  }
  return (
    <Spin indicator={<Spinner loading />} spinning={loading}>
      <ModalCard
        title={`${selectedService?.is_active ? 'Disable' : 'Enable'} ${selectedService?.item_name === 'BRACES ADD-ON' ? 'Braces Add-On' : 'Billing & Payments'}`}
        subTitle={getSubTitle(selectedService?.is_active, selectedService?.item_name)}
        okText={selectedService?.is_active ? 'Disable' : 'Enable'}
        classNameFooter='px-4 pb-4'
        classNameForBox='px-4 pt-4'
        classNameForOkButton={
          selectedService?.is_active
            ? 'bg-red hover:bg-red'
            : 'bg-primaryColor hover:bg-primaryColor'
        }
        cancelText='Cancel'
        onClose={() => {
          setConfirmModalOpen(false)
        }}
        open={confirmModalOpen}
        showCrossButton={false}
        onClick={() => {
          statusChange(selectedService)
        }}
        showFooter={true}
      />
      <header className='border-b border-mediumGray'>
        <h1 className='text-lg font-semibold'>Add-Ons</h1>
      </header>

      <div className='space-y-6 mt-6'>
        {serviceList &&
          serviceList.map((feature) => (
            <div key={feature.id}>
              <div className='font-semibold mb-2'>
                {feature?.item_name === 'BRACES ADD-ON' ? 'Braces' : 'Billing & Payments'}
              </div>
              <FeatureCard
                title={
                  feature?.item_name === 'BRACES ADD-ON' ? 'Braces Add-On' : 'Billing & Payments'
                }
                description={
                  feature?.item_name === 'BRACES ADD-ON'
                    ? 'Combine braces and aligner treatments in one workflow'
                    : 'Manage invoices, payments, and billing history'
                }
                is_active={feature.is_active}
                callChangeStatus={() => {
                  setConfirmModalOpen(true)
                  setSelectedService(feature)
                }}
              />
            </div>
          ))}
      </div>
    </Spin>
  )
}

export default StarterPlanServicePage
