import useDispatchAction from '@hooks/useDispatchAction'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {
  setOpenApprovePendingActionModal,
  setOpenDeactivateTreatmentPlanModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {RootState} from 'redux/store'

import InfoIcon from 'assets/icons/InfoIcon'
import When from 'components/when/When'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {postPatientProfileApproveAllPendingAction} from 'redux/Slices/AppSlice/PatientProfile/ProfileView/patientProfileSlice'
import useAllUserPlan from '@hooks/useAllUserPlan'

const OpenApprovePendingActionModal = () => {
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const {isPractice, isOrganization} = useAllUserPlan()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)

  const {treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const activeAlignerJourneyId = treatmentPlanList.find((item) => {
    return item.status === 'ACTIVE' || item.status === 'PAUSED'
  })?.aligner_journey_id

  const handleOnClick = async () => {
    try {
      await dispatchAction(postPatientProfileApproveAllPendingAction(activeAlignerJourneyId!)).then(
        () => {
          dispatchAction(setOpenApprovePendingActionModal(false))
          dispatchAction(setOpenDeactivateTreatmentPlanModal(true))
        }
      )
    } catch (err) {
      console.error('Failed to approve pending actions:', err)
    }
  }

  return (
    <div>
      <ModalLayout className='w-[600px]'>
        <div className='flex flex-col gap-5 p-2'>
          <div className='flex justify-center items-center w-20 h-20 bg-primarySupport rounded-full'>
            <InfoIcon height='32' width='32' color='#735BF2' />
          </div>
          <div className='text-center md:text-start'>
            <p className='font-semibold text-2xl text-black'>Approve Pending Updates</p>
            <p className='text-textColor text-base mt-1'>
              Before deactivating the current active plan, all pending aligner updates must be
              approved. Choose to approve them all now or review and approve manually.
            </p>
          </div>

          <When
            isTrue={isPractice || (isOrganization && patientAssignedTo === 'ASSIGNED_TO_PRACTICE')}
          >
            <div className='border border-textColor rounded-lg p-3 flex flex-col gap-2'>
              <p className='text-black font-medium text-base'>Want to review updates manually?</p>
              <ol className='list-decimal list-inside flex flex-col gap-1 text-textColor'>
                <li>Navigate to Patient Profile → Overview Tab → Patient Timeline.</li>
                <li>Change the Filter to ‘Pending Updates’.</li>
                <li>Review and approve/resolve updates one at a time.</li>
              </ol>
            </div>
          </When>
          <div className='flex  gap-2 mt-2'>
            <button
              className='bg-primarySupport text-primaryColor border border-primaryColor h-14 font-semibold text-base w-full rounded-lg'
              type='button'
              onClick={() => {
                dispatchAction(setOpenApprovePendingActionModal(false))
              }}
            >
              Do it manually
            </button>
            <AntdButton
              className='bg-primaryColor text-white h-14 font-semibold text-base w-full rounded-lg'
              text='Approve all'
              onClick={() => handleOnClick()}
            />
          </div>
        </div>
      </ModalLayout>
    </div>
  )
}

export default OpenApprovePendingActionModal
