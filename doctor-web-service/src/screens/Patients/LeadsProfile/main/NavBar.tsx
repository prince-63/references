import {LeadsProfileNavBar, LeadsProfileNavItem} from '../leadsProfile.types'
import {useParams} from 'react-router-dom'
import leadsProfileNavBarItems from '@staticData/leadsProfileNavBarItems'
import leadsProfileRouteConstants from '@constants/leadsProfile.routeConstants'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import leadsPatientStatusType from '@constants/leadsPatientStatusType'
import clsx from 'clsx'
import useDispatchAction from '@hooks/useDispatchAction'
import {setCaseInformation} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {useNavigate} from 'context/CustomNavigationContext'
import useAllUserPlan from '@hooks/useAllUserPlan'
import PATIENT_TYPE from '@constants/patientType.constants'

interface INavBar {
  filter: LeadsProfileNavBar
  handleFilterChange: (option: LeadsProfileNavItem) => void
}

const NavBar = ({filter, handleFilterChange}: INavBar) => {
  const {navigate, shouldBlock} = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()

  const {dataLeadsOverview, caseInformationOriginal} = useSelector(
    (state: RootState) => state.leadsProfile
  )
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const isExistingCasePatient = patientData?.patient_type === PATIENT_TYPE.EXISTING_PATIENT
  const isPracticeAssignedToPatient = patientData?.is_practice_assigned
  const {isStarterPlanUser} = useAllUserPlan()

  const callFilterNavBar = (item: (typeof leadsProfileNavBarItems)[number]) => {
    dispatchAction(setCaseInformation(caseInformationOriginal))
    if (shouldBlock) return

    handleFilterChange(item.value)
    const basePath = `/profile/${patientId}`
    const dynamicId =
      item.value === leadsProfileRouteConstants.ALIGNERS_TRACKING
        ? dataLeadsOverview?.treatment_plan?.journey_id
        : item.value === leadsProfileRouteConstants.BRACES_NOTES
          ? dataLeadsOverview?.braces_journey_tracking_response?.braces_journey_id
          : null

    const finalPath = dynamicId
      ? `${basePath}/${dynamicId}/${item.path}`
      : `${basePath}/${item.path}`
    navigate(finalPath)
  }

  const shouldRenderItem = (item: (typeof leadsProfileNavBarItems)[number]) => {
    const value = item.value

    if (value === leadsProfileRouteConstants.ALIGNERS_TRACKING && isExistingCasePatient) {
      return true
    }

    // Tracking/Braces visibility rules
    if (
      (value === leadsProfileRouteConstants.ALIGNERS_TRACKING &&
        (!['PATIENTAPP', 'MANUAL'].includes(dataLeadsOverview?.tracking?.type) ||
          dataLeadsOverview?.tracking?.status === 'DRAFT')) ||
      (value === leadsProfileRouteConstants.BRACES_NOTES &&
        !dataLeadsOverview?.braces_journey_tracking_response?.braces_journey_id)
    ) {
      return false
    }

    // Orders visibility for independent practice
    if (value === leadsProfileRouteConstants.ORDERS && isStarterPlanUser) {
      return false
    }

    return true
  }

  return (
    <div className='flex gap-x-5 border-b border-lightGray w-full mx-3 text-textColor text-base font-semibold'>
      {leadsProfileNavBarItems.map((item) => {
        if (item.value === leadsProfileRouteConstants.TIMELINE && !isPracticeAssignedToPatient) {
          return
        }

        if (!shouldRenderItem(item)) return null

        const isActive = filter[item.value]
        const canClick =
          patientData?.status === leadsPatientStatusType.ACTIVE ||
          patientData?.status === leadsPatientStatusType.INACTIVE ||
          (item.value === leadsProfileRouteConstants.FILES &&
            patientData?.status === leadsPatientStatusType.ARCHIVE)

        return (
          <div
            key={item.value}
            className={clsx(
              'py-2 cursor-pointer min-w-max',
              isActive && 'text-primaryColor border-b-2 border-primaryColor',
              !canClick && 'opacity-50 pointer-events-none'
            )}
            onClick={() => {
              if (canClick) callFilterNavBar(item)
            }}
          >
            {item.label}
          </div>
        )
      })}
    </div>
  )
}

export default NavBar
