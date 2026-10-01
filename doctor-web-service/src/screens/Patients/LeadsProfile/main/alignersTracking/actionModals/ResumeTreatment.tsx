import actionTypes from '@constants/actionTypes'
import ActionListOptions from '@staticData/ActionListOptions'
import ModalLayout from 'components/modal/ModalLayout'
import {useFormik} from 'formik'
import {
  ActionItem,
  ResumeTreatmentFormValues,
} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import AntdButton from 'components/atom/Buttons/AntdButton'
import InfoCard from '../components/InfoCard'
import useDispatchAction from '@hooks/useDispatchAction'
import resumeTreatmentValidation from './resumeTreatment.validation'
import {useParams} from 'react-router-dom'
import getColorPalette from 'utils/getColorPalette'
import cn from '@utils/cn'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {pauseOrResumeTreatment} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
const ResumeTreatment = ({
  handleOnClose,
  alignerJourneyId,
}: {
  handleOnClose: (option: ActionItem) => void
  alignerJourneyId: number | undefined | null
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {pausingOrResumingTreatment} = useSelector((state: RootState) => state.alignerTracking)
  const handleOnClick = async (resumeTreatmentDetails: any) => {
    if (!alignerJourneyId) return

    dispatchAction(
      pauseOrResumeTreatment({
        aligner_journey_id: alignerJourneyId,
        treatment_state: treatmentPlanStatusConstants.ACTIVE,
        resume_date: resumeTreatmentDetails.resumeDate,
      })
    )
      .unwrap()
      .then(async () => {
        handleOnClose(actionTypes.RESUME_TREATMENT)
        dispatchAction(
          getApiLeadsOverview({
            data: {
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            },
          })
        )
        dispatchAction(
          getLeadsProfileDetails({
            patient_id: safeParseInt(patientId),
            doctor_id: safeParseInt(userId),
          })
        )
      })
  }
  const formik = useFormik<ResumeTreatmentFormValues>({
    initialValues: {
      resumeDate: dayjs().format('YYYY-MM-DD'),
      alignerChanged: true,
      startDateOfAligner: '',
      extendCurrentAlignerWearDays: '',
      alignerChangedTo: '',
      daysToExtendAligner: '',
    },
    validationSchema: resumeTreatmentValidation,
    validateOnChange: true,
    onSubmit: async (values) => {
      await handleOnClick(values)
    },
  })

  return (
    <ModalLayout isResponsive={true} className='md:!w-[30%] overflow-y-auto '>
      <div className='flex justify-between items-center mb-4'></div>
      <div className='max-h-[70vh] flex flex-col gap-4 overflow-y-auto card-wrapper pb-3 px-2'>
        <div className='flex flex-col justify-between items-center'>
          <p className='text-2xl font-semibold '>
            {ActionListOptions[actionTypes.RESUME_TREATMENT].title}
          </p>
          <p className='text-base font-normal text-textColor text-center'>
            {ActionListOptions[actionTypes.RESUME_TREATMENT].modalSubTitle}
          </p>
        </div>

        <div className='flex flex-col gap-3'>
          <InfoCard
            {...{
              title: 'Was there an aligner change during the pause?',
              showButton: false,
              titleClassName: 'text-base font-semibold text-black',
              className: 'bg-secondarySupport border border-secondaryColor',
              infoIconColor: getColorPalette().secondaryColor,
              content: 'You can update it using Quick Actions in the patient profile.',
            }}
          />
        </div>
      </div>
      <div className='flex justify-between gap-2'>
        <button
          type='button'
          onClick={() => {
            handleOnClose(actionTypes.RESUME_TREATMENT)
            formik.resetForm()
          }}
          className={cn(
            'flex-1 h-12 px-4 rounded-lg border border-primaryColor bg-primarySupport',
            'text-primaryColor font-medium w-1/2'
          )}
        >
          Cancel
        </button>
        <AntdButton
          className='bg-primaryColor text-white h-12 font-semibold text-base w-1/2'
          isLoading={pausingOrResumingTreatment}
          text='Resume treatment'
          onClick={() => {
            formik.handleSubmit()
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default ResumeTreatment
