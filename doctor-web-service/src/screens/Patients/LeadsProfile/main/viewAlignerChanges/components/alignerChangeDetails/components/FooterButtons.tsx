import alignerUpdateTypeConstants from '@constants/alignerUpdateType.constants'
import HttpMethod from '@constants/httpMethods.constants'
import patientOverviewAlignerActionFilterConstantsConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import userTypes from '@constants/userTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import apiHelper from '@utils/apiHelper'
import clsx from 'clsx'
import AntdButton from 'components/atom/Buttons/AntdButton'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import When from 'components/when/When'
import {AuthContext} from 'context/AuthContext'
import {useContext, useState} from 'react'
import {useParams} from 'react-router-dom'
import {URL_VALIDATE_AND_APPROVE_ALIGNER} from 'redux/Endpoints/apiEndpoints'
import {getAlignerUpdateDetails} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {getPatientTimeline} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {IAlignerUpdateDetails} from 'screens/Patients/LeadsProfile/leadsProfile.types'
const FooterButtons = ({
  setIsMoveToPreviousAlignerModalOpen,
  alignerUpdateDetails,
  selectedFilter,
  onExtendWearDays,
}: {
  setIsMoveToPreviousAlignerModalOpen: (value: boolean) => void
  alignerUpdateDetails: IAlignerUpdateDetails
  selectedFilter: keyof typeof patientOverviewAlignerActionFilterConstantsConstants
  onExtendWearDays: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {patientId} = useParams()

  const onSubmit = async () => {
    setIsSubmitting(true)
    await apiHelper(URL_VALIDATE_AND_APPROVE_ALIGNER, HttpMethod.POST, {
      aligner_action_id: alignerUpdateDetails.aligner_action_id,
      validated_by: userId,
      validated_by_user_type: userTypes.DOCTOR,
    }).then(async () => {
      await dispatchAction(
        getAlignerUpdateDetails({
          aligner_action_id: alignerUpdateDetails.aligner_action_id,
        })
      )
        .unwrap()
        .then(async () => {
          if (alignerUpdateDetails.type !== alignerUpdateTypeConstants.ISSUE_REPORT) {
            SuccessToast(
              `${
                alignerUpdateDetails.type === alignerUpdateTypeConstants.CHECK_IN
                  ? 'Aligner check-in was validated'
                  : 'Aligner change was approved'
              }`
            )
          }

          await dispatchAction(
            getPatientTimeline({
              doctor_id: parseInt(userId as string),
              patient_id: parseInt(patientId as string),
              filter: selectedFilter,
            })
          )
          setIsSubmitting(false)
        })
    })
  }

  const getSubmitButtonClassName = () => {
    if (
      alignerUpdateDetails.validated &&
      alignerUpdateDetails.type === alignerUpdateTypeConstants.ALIGNER_CHANGE
    ) {
      return 'text-grayDisabled bg-lightGray cursor-default pointer-events-none hover:!bg-lightGray hover:!text-grayDisabled'
    }
    return 'bg-primaryColor  text-white hover:!bg-primaryColor hover:!text-white'
  }

  return (
    <div className='flex flex-col gap-3 md:flex-row md:gap-5 justify-end'>
      <When
        isTrue={
          alignerUpdateDetails.type === alignerUpdateTypeConstants.CHECK_IN &&
          !alignerUpdateDetails.validated
        }
      >
        <AntdButton
          text={<div className='flex items-center gap-2 justify-center'>Extend wear days</div>}
          onClick={onExtendWearDays}
          className='h-10 text-base bg-primarySupport border border-primaryColor text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor font-semibold rounded-lg'
        />
      </When>
      <When
        isTrue={
          alignerUpdateDetails.type === alignerUpdateTypeConstants.ALIGNER_CHANGE &&
          !alignerUpdateDetails.validated
        }
      >
        <AntdButton
          text={
            <div className='flex items-center gap-2 justify-center'>
              {alignerUpdateDetails?.move_to_previous_aligner_enable === true &&
                'Revert aligner change'}
            </div>
          }
          onClick={() => {
            setIsMoveToPreviousAlignerModalOpen(true)
          }}
          className={clsx(
            'h-10 text-base bg-primarySupport border border-primaryColor text-primaryColor hover:!bg-primarySupport hover:!text-primaryColor font-semibold rounded-lg',
            alignerUpdateDetails?.move_to_previous_aligner_enable !== true &&
              'text-textColor !bg-lightGray cursor-default pointer-events-none hover:!bg-lightGray hover:!text-textColor border-0'
          )}
        />
      </When>
      <When
        isTrue={
          alignerUpdateDetails.type !== alignerUpdateTypeConstants.ISSUE_REPORT &&
          (alignerUpdateDetails?.move_to_previous_aligner_enable === true ||
            alignerUpdateDetails?.move_to_previous_aligner_enable === null) &&
          !alignerUpdateDetails.validated
        }
      >
        <AntdButton
          text={
            <span>
              <div className='flex items-center gap-2'>
                {!alignerUpdateDetails.validated
                  ? alignerUpdateDetails.type === alignerUpdateTypeConstants.CHECK_IN
                    ? 'Approve check-in'
                    : 'Approve change'
                  : null}
              </div>
            </span>
          }
          onClick={onSubmit}
          loading={isSubmitting}
          className={clsx(
            'h-10 text-base border font-semibold rounded-lg',
            getSubmitButtonClassName(),
            alignerUpdateDetails.validated && 'cursor-default pointer-events-none '
          )}
        />
      </When>
    </div>
  )
}

export default FooterButtons
