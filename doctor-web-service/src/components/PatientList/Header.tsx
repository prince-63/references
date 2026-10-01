import {FC, useContext} from 'react'
import {AuthContext} from '../../context/AuthContext'
import {SVG_PLUS_WHITE} from '../../utils/SvgConstants'
import CommonSVG from '../atom/SVG/CommonSVG'
import {useNavigate} from 'react-router-dom'
import When from 'components/when/When'
import leftArrow from '../../assets/icons/iconArrowLeft.svg'
import clsx from 'clsx'
import {identifyUser} from 'utils/ConstFunctions'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import useAllUserPlan from '@hooks/useAllUserPlan'
import useSubRoleDetails from '@hooks/useSubRoleDetails'
import useDispatchAction from '@hooks/useDispatchAction'
import {resetPrescriptionState} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'

interface Props {
  title: string
  subtitle: string
  buttonText?: string
  activeList: boolean
  showArchiveButton?: boolean
  showAddPatientButton?: boolean
  showQuickAddButton?: boolean
}

export const Header: FC<Props> = (props) => {
  const {
    title,
    subtitle,
    activeList,
    showArchiveButton = true,
    showAddPatientButton = true,
    showQuickAddButton = true,
  } = props
  const {demoModeStatus}: any = useContext(AuthContext)
  const {isStarterPlanUser, isEnterprisePlanUser, isGrowthPlanUser} = useAllUserPlan()
  const navigate = useNavigate()
  const {loadingPatients} = useSelector((state: RootState) => state.patientsList)
  const {permissionChecks} = useFeatureAccess()
  const {isAdmin} = useSubRoleDetails()
  const {dispatchAction} = useDispatchAction()

  const patientListPermissions =
    permissionChecks?.patientManagement?.viewArchivedPatientList?.isViewable || isStarterPlanUser
  const patientManagementAccess =
    permissionChecks?.patientManagement?.viewArchivedPatientList?.isViewable || isStarterPlanUser
  const callInvitePatientModal = () => {
    if (isStarterPlanUser) {
      navigate('/add-patient-starter')
      dispatchAction(resetPrescriptionState())
    } else {
      navigate('/add-patient')
    }

    identifyUser()
  }

  const callQuickAdd = () => {
    navigate('/add_patient/existing_case/')

    identifyUser()
  }

  return (
    <>
      <div
        className={`w-full  flex flex-col gap-2 md:flex-row justify-between md:items-center ${
          demoModeStatus ? 'pointer-events-none' : ''
        }`}
      >
        <div className='flex md:gap-6 gap-3 items-center'>
          <When isTrue={!activeList}>
            <button
              type='button'
              onClick={() => {
                navigate(-1)
              }}
              className='relative rounded-full md:bg-lightGray border border-lightGray flex items-center justify-center min-w-[47px] h-[47px]'
            >
              <img src={leftArrow} alt='' width={20} />
            </button>
          </When>
          <div>
            <div className='w-96 text-black text-xl font-semibold'>{title}</div>
            <div className='w-full text-textColor text-base font-normal'>{subtitle}</div>
          </div>
        </div>
        <When isTrue={patientListPermissions && (showArchiveButton || showAddPatientButton)}>
          <div className='flex flex-wrap gap-2'>
            {/* {activeList && showArchiveButton && (
              <button
                className={clsx(
                  'flex-1 min-w-48 h-10 px-3.5 py-2.5 rounded-lg justify-center border border-mediumGray items-center gap-2 inline-flex',
                  !activeList && 'md:inline-flex hidden'
                )}
                onClick={() => callArchivePatients()}
                disabled={loadingPatients}
              >
                <div className='text-textColor text-sm font-semibold flex justify-center flex-grow'>
                  {buttonText}
                </div>
              </button>
            )} */}
            <div className='md:w-fit w-full flex gap-2'>
              <When
                isTrue={(isEnterprisePlanUser || isGrowthPlanUser || isAdmin) && showQuickAddButton}
              >
                <button
                  className={clsx(
                    'md:w-fit w-full h-10 px-3.5 py-2.5 bg-primarySupport rounded-lg justify-center border border-primaryColor items-center gap-2'
                  )}
                  onClick={() => callQuickAdd()}
                  disabled={loadingPatients}
                >
                  <div className='text-primaryColor text-sm font-semibold flex justify-center flex-grow'>
                    Quick add
                  </div>
                </button>
              </When>
              <When isTrue={showAddPatientButton && patientManagementAccess}>
                <button
                  className={clsx(
                    'flex-1 min-w-36 h-10 px-3.5 py-2.5 bg-primaryColor rounded-lg justify-center items-center gap-2 inline-flex',
                    !activeList && 'md:inline-flex hidden'
                  )}
                  onClick={() => callInvitePatientModal()}
                >
                  <CommonSVG svg={SVG_PLUS_WHITE} width='16' height='16' />
                  <div className='text-white text-sm font-semibold'>Add a patient</div>
                </button>
              </When>
            </div>
          </div>
        </When>
      </div>
    </>
  )
}
