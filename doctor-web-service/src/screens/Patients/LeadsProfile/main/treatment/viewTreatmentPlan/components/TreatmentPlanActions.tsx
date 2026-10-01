import React, {useContext} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'

import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  setOpenApprovePendingActionModal,
  setOpenDeactivateTreatmentPlanModal,
  setSelectedTreatmentPlanId,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import When from 'components/when/When'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {RootState} from 'redux/store'
import getPatientAssignedTo from '@utils/getPatientAssignedTo'
import {AuthContext} from 'context/AuthContext'
import {shouldShowButton} from '../helpers/shouldShowButton'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface TreatmentPlanActionsProps {
  treatmentStatus: keyof typeof treatmentPlanStatusConstants
  handleOnClick: (treatmentPlanStatus?: keyof typeof treatmentPlanStatusConstants) => Promise<any>
  sendToPatient: () => void
}

const TreatmentPlanActions: React.FC<TreatmentPlanActionsProps> = ({
  treatmentStatus,
  handleOnClick,
  sendToPatient,
}) => {
  const {treatmentPlan, createTreatmentPlanLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const dispatch = useDispatch()
  const {profileId} = useContext(AuthContext)
  const handleDeactivate = () => {
    dispatch(setSelectedTreatmentPlanId(treatmentPlan.treatment_plan_id))
    if (treatmentPlan?.aligner_journey_id && treatmentPlan?.pending_action_count > 0) {
      dispatch(setOpenApprovePendingActionModal(true))
      return
    }
    dispatch(setOpenDeactivateTreatmentPlanModal(true))
  }
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const [searchParams] = useSearchParams()
  const patientAssignedTo = getPatientAssignedTo(profileId, patientData)
  const isNew = searchParams.get('new') === 'true'
  const isDraft = searchParams.get('draft') === 'true'
  const navigate = useNavigate()
  const {
    isOrganization,
    isPractice,
    isStarterPlanUser,
    isInternalUser,
    isDesignLabUser,
    isCustomer,
    isVendor,
  } = useAllUserPlan()

  const getUserType = () => {
    if (isOrganization) {
      return 'ORG'
    } else if (isCustomer) {
      return 'CUSTOMER'
    } else if (isPractice) {
      return 'CONNECTED_PRACTICE'
    } else if (isStarterPlanUser) {
      return 'INDEPENDENT_ORTHO'
    } else if (isDesignLabUser || isVendor) {
      return 'LAB_ADMIN'
    } else if (isInternalUser) {
      return 'LAB_STAFF'
    }
    return 'INDEPENDENT_ORTHO'
  }

  return (
    <div className='flex flex-col-reverse md:flex-row justify-between mt-4 gap-2'>
      <div className='flex gap-2'>
        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'ARCHIVE',
          })}
        >
          <AntdButton
            onClick={() => handleOnClick(treatmentPlanStatusConstants.ARCHIVED)}
            className='md:w-fit w-full border border-textColor text-textColor h-12 font-semibold text-base hover:!bg-[#EFEFEF] hover:!text-textColor bg-[#EFEFEF]'
            isLoading={createTreatmentPlanLoading}
            text='Archive'
            disabled={createTreatmentPlanLoading}
          />
        </When>
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              patientAssigned: patientAssignedTo,
              buttonType: 'DEACTIVATE',
            }) && isDraft
          }
        >
          <AntdButton
            onClick={handleDeactivate}
            className='bg-redSupport text-red hover:!bg-redSupport hover:!text-red border !border-red h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Deactivate treatment'
            disabled={createTreatmentPlanLoading}
          />
        </When>
        <When isTrue={isNew && patientAssignedTo === 'ASSIGNED_TO_ME'}>
          <AntdButton
            onClick={() => navigate(-1)}
            className='md:w-fit w-full border !bg-white !border-mediumGray !text-textColor  h-12 font-semibold text-base hover:!border-mediumGray hover:!text-textColor hover:!bg-white'
            isLoading={createTreatmentPlanLoading}
            text='Cancel'
            disabled={createTreatmentPlanLoading}
          />
        </When>
      </div>
      <div className='flex gap-2 md:flex-row flex-col-reverse'>
        <When
          isTrue={
            shouldShowButton({
              status: treatmentStatus,
              userType: getUserType(),
              patientAssigned: patientAssignedTo,
              buttonType: 'DEACTIVATE',
            }) &&
            !isNew &&
            !isDraft
          }
        >
          {/* <AntdButton
            onClick={handleDeactivate}
            className='!bg-redSupport !text-red hover:!bg-redSupport hover:!text-red border !border-red h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Deactivate treatment'
            disabled={createTreatmentPlanLoading}
          /> */}
        </When>
        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'SAVE_AS_DRAFT',
          })}
        >
          <AntdButton
            onClick={() => handleOnClick(treatmentPlanStatusConstants.DRAFT)}
            className='md:w-fit w-full border !bg-white !border-mediumGray !text-textColor hover:!text-white h-12 font-semibold text-base '
            isLoading={createTreatmentPlanLoading}
            text='Save as draft'
            disabled={createTreatmentPlanLoading}
          />
        </When>
        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'REQUEST_REPLAN',
          })}
        >
          <AntdButton
            onClick={() => handleOnClick(treatmentPlanStatusConstants.RE_PLAN)}
            className='!bg-redSupport !text-red hover:!bg-redSupport hover:!text-red border !border-red h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Request for replan'
            disabled={createTreatmentPlanLoading}
          />
        </When>
        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'SEND_FOR_APPROVAL',
          })}
        >
          <AntdButton
            onClick={() => handleOnClick(treatmentPlanStatusConstants.SENT_FOR_APPROVAL)}
            className='md:w-fit w-full border !bg-primaryColor !text-white h-12 font-semibold text-base'
            disabled={createTreatmentPlanLoading}
            text='Send for approval'
          />
        </When>
        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'FINALIZE',
          })}
        >
          <AntdButton
            onClick={() => handleOnClick(treatmentPlanStatusConstants.ACTIVE)}
            className='md:w-fit w-full border !border-primaryColor !text-primaryColor !bg-white hover:!text-white h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Finalize and create plan'
            disabled={createTreatmentPlanLoading}
          />
        </When>
        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'SEND_TO_PATIENT',
          })}
        >
          <AntdButton
            onClick={sendToPatient}
            className='md:w-fit w-full !bg-primaryColor !text-white h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Send to patient'
            disabled={createTreatmentPlanLoading}
          />
        </When>

        <When
          isTrue={shouldShowButton({
            status: treatmentStatus,
            userType: getUserType(),
            patientAssigned: patientAssignedTo,
            buttonType: 'APPROVE',
          })}
        >
          <AntdButton
            onClick={() => handleOnClick(treatmentPlanStatusConstants.APPROVED)}
            className='md:w-fit w-full border !bg-primaryColor !text-white h-12 font-semibold text-base'
            isLoading={createTreatmentPlanLoading}
            text='Approve'
            disabled={createTreatmentPlanLoading}
          />
        </When>
      </div>
    </div>
  )
}

export default TreatmentPlanActions
