import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {Spin, Modal} from 'antd'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import TrackingStatusCard from 'components/tracking/TrackingStatusCard'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {toggleDoctorDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import AntdButton from 'components/atom/Buttons/AntdButton'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'

const TrackingTab = () => {
  const {profileId, organizationId, userId} = useContext(AuthContext)
  const {customerId} = useParams<{customerId: string}>()
  const {dispatchAction} = useDispatchAction()
  const {
    miniDashboardData,
    loadingMiniDashboard,
    togglingCustomerTracking,
    toggleCustomerTrackingStatus,
    toggleCustomerTrackingError,
  } = useSelector((state: RootState) => state.profile)
  const [localEnabled, setLocalEnabled] = useState<boolean>(false)
  const [isEnableConfirmOpen, setIsEnableConfirmOpen] = useState(false)
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false)
  const prevToggleStatusRef = useRef(toggleCustomerTrackingStatus)

  const enabled = useMemo(() => {
    if (!miniDashboardData || Array.isArray(miniDashboardData)) return false
    return Boolean(miniDashboardData.customer_tracking_enabled)
  }, [miniDashboardData])

  useEffect(() => {
    setLocalEnabled(enabled)
  }, [enabled])

  useEffect(() => {
    const prevStatus = prevToggleStatusRef.current
    if (toggleCustomerTrackingStatus === 'failed' && prevStatus !== 'failed') {
      const errorCode =
        (toggleCustomerTrackingError as any)?.error_code || (toggleCustomerTrackingError as any)
      if (errorCode === 'TR0002') {
        setIsBlockedModalOpen(true)
        // revert switch to server state
        setLocalEnabled(enabled)
      }
    }
    prevToggleStatusRef.current = toggleCustomerTrackingStatus
  }, [enabled, toggleCustomerTrackingError, toggleCustomerTrackingStatus])

  const handleToggle = (next: boolean) => {
    if (!customerId) return
    if (next && !localEnabled) {
      setIsEnableConfirmOpen(true)
      return
    }
    // disable immediately
    setLocalEnabled(next)
    dispatchAction(
      toggleDoctorDetails({
        profile_id: safeParseInt(profileId),
        organization_id: safeParseInt(organizationId),
        doctor_id: safeParseInt(userId),
        customer_profile_id: safeParseInt(customerId),
        toggle_type: ['TRACKING'],
      })
    )
  }

  const handleConfirmEnable = () => {
    if (!customerId) return
    setIsEnableConfirmOpen(false)
    setLocalEnabled(true)
    dispatchAction(
      toggleDoctorDetails({
        profile_id: safeParseInt(profileId),
        organization_id: safeParseInt(organizationId),
        doctor_id: safeParseInt(userId),
        customer_profile_id: safeParseInt(customerId),
        toggle_type: ['TRACKING'],
      })
    )
  }

  return (
    <>
      <Spin spinning={loadingMiniDashboard || togglingCustomerTracking}>
        <TrackingStatusCard enabled={localEnabled} onToggle={handleToggle} />
      </Spin>

      <Modal open={isEnableConfirmOpen} footer={null} centered closable={false}>
        <div className='space-y-4'>
          <div className='text-lg font-semibold text-neutralBlack'>
            Enable tracking for customer?
          </div>
          <div className='text-sm text-textColor'>
            Once enabled, customer will be able to allow patients to use patient app and track
            progress on their respective profiles.
          </div>
          <div className='flex justify-center items-center gap-3'>
            <AntdButton
              text='Cancel'
              className='h-12 w-full bg-white text-textColor border-mediumGray hover:!bg-white hover:!text-textColor'
              onClick={() => setIsEnableConfirmOpen(false)}
            />

            <AntdButton
              text='Enable'
              className='h-12  w-full'
              onClick={handleConfirmEnable}
              loading={togglingCustomerTracking}
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={isBlockedModalOpen}
        onCancel={() => setIsBlockedModalOpen(false)}
        closable={false}
        footer={
          <AntdButton
            text='Understood'
            className='h-12 w-full bg-white text-textColor border-mediumGray hover:!bg-white hover:!text-textColor'
            onClick={() => setIsBlockedModalOpen(false)}
          />
        }
        centered
        title='Action blocked'
      >
        <div className='text-sm text-textColor mb-3'>
          You cannot disable this service until all related orders are marked as completed.
        </div>

        <InfoCard
          content={
            <div className=''>
              Please ensure all Planning or Manufacturing orders currently in progress are completed
              before turning off this service.
            </div>
          }
          showArrowIcon={false}
          showButton={false}
          className='bg-redSupport border border-red font-medium text-black'
          infoIconColor='#F45045'
          contentClassName='text-black'
        />
      </Modal>
    </>
  )
}

export default TrackingTab
