import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import TrackingStatusCard from 'components/tracking/TrackingStatusCard'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {toggleDoctorDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import ErrorToast from 'components/modal/Alert/ErrorToast'

const AdditionalSettingsTab = () => {
  const [scanFilesEnabled, setScanFilesEnabled] = useState(false)
  const [printFilesEnabled, setPrintFilesEnabled] = useState(false)
  const {customerId} = useParams<{customerId: string}>()
  const {dispatchAction} = useDispatchAction()
  const {profileId, organizationId, userId} = useContext(AuthContext)
  const {miniDashboardData, togglingCustomerTracking} = useSelector(
    (state: RootState) => state.profile
  )
  const initializedRef = useRef(false)

  const scanEnabledFromApi = useMemo(() => {
    if (!miniDashboardData || Array.isArray(miniDashboardData)) return undefined
    const data = miniDashboardData as Record<string, unknown>
    const candidates = ['customer_scan_file_view_enabled']
    for (const key of candidates) {
      const value = data[key]
      if (typeof value === 'boolean') return value
    }
    return undefined
  }, [miniDashboardData])

  const printEnabledFromApi = useMemo(() => {
    if (!miniDashboardData || Array.isArray(miniDashboardData)) return undefined
    const data = miniDashboardData as Record<string, unknown>
    const candidates = ['customer_print_file_view_enabled']
    for (const key of candidates) {
      const value = data[key]
      if (typeof value === 'boolean') return value
    }
    return undefined
  }, [miniDashboardData])

  useEffect(() => {
    initializedRef.current = false
  }, [customerId])

  useEffect(() => {
    if (!initializedRef.current) {
      if (typeof scanEnabledFromApi === 'boolean') {
        setScanFilesEnabled(scanEnabledFromApi)
      }
      if (typeof printEnabledFromApi === 'boolean') {
        setPrintFilesEnabled(printEnabledFromApi)
      }
      if (typeof scanEnabledFromApi === 'boolean' || typeof printEnabledFromApi === 'boolean') {
        initializedRef.current = true
      }
    }
  }, [printEnabledFromApi, scanEnabledFromApi])

  const dispatchToggle = async (
    type: 'SCAN_FILE' | 'PRINT_FILE',
    next: boolean,
    prev: boolean,
    setter: (value: boolean) => void
  ) => {
    if (togglingCustomerTracking) return
    const parsedCustomerId = safeParseInt(customerId)
    const parsedProfileId = safeParseInt(profileId)
    const parsedOrganizationId = safeParseInt(organizationId)
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedCustomerId || !parsedProfileId || !parsedOrganizationId || !parsedDoctorId) return

    setter(next)
    try {
      await dispatchAction(
        toggleDoctorDetails({
          profile_id: parsedProfileId,
          organization_id: parsedOrganizationId,
          doctor_id: parsedDoctorId,
          customer_profile_id: parsedCustomerId,
          toggle_type: [type],
        })
      ).unwrap()
    } catch (error) {
      setter(prev)
      ErrorToast('Failed to update setting')
    }
  }

  return (
    <div className='px-4 sm:px-6'>
      <h2 className='text-2xl md:text-3xl font-semibold'>Additional Settings</h2>
      <div className='mt-5 space-y-6'>
        <TrackingStatusCard
          enabled={scanFilesEnabled}
          onToggle={(next) => {
            dispatchToggle('SCAN_FILE', next, scanFilesEnabled, setScanFilesEnabled)
          }}
          titleEnabled='Scan files sharing is enabled'
          titleDisabled='Scan files sharing is disabled'
          descriptionEnabled='Scan files can be shared with the customer.'
          descriptionDisabled='Scan files sharing is off until you enable it for this customer.'
          benefits={[
            {label: 'Enable scan file sharing.'},
            {label: 'Customer-uploaded scan files are visible to both customer and lab.'},
            {label: 'Lab-uploaded scan files are visible to the customer.'},
          ]}
          unavailableFeatures={[
            {label: 'Scan files sharing starts disabled for new customers.'},
            {label: 'Lab-uploaded scan files stay visible only to the lab.'},
            {label: 'Customer-uploaded scan files remain visible to both sides.'},
          ]}
        />

        <TrackingStatusCard
          enabled={printFilesEnabled}
          onToggle={(next) => {
            dispatchToggle('PRINT_FILE', next, printFilesEnabled, setPrintFilesEnabled)
          }}
          titleEnabled='3D print files sharing is enabled'
          titleDisabled='3D print files sharing is disabled'
          descriptionEnabled='3D print files can be shared with the customer.'
          descriptionDisabled='3D print files sharing is off until you enable it for this customer.'
          benefits={[
            {label: 'Enable 3D print file sharing.'},
            {label: 'Customer-uploaded 3D print files are visible to both customer and lab.'},
            {label: 'Lab-uploaded 3D print files are visible to the customer.'},
          ]}
          unavailableFeatures={[
            {label: '3D print sharing starts disabled for new customers.'},
            {label: 'Lab-uploaded 3D print files stay visible only to the lab.'},
            {label: 'Customer-uploaded 3D print files remain visible to both sides.'},
          ]}
        />
      </div>
    </div>
  )
}

export default AdditionalSettingsTab
