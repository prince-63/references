import actionTypes from '@constants/actionTypes'
import ActionListOptions from '@staticData/ActionListOptions'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {SVG_CROSS} from 'utils/SvgConstants'
import ListItemWithIcon from './components/ListItemWithIcon'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import {useFormik} from 'formik'

import AntdButton from 'components/atom/Buttons/AntdButton'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getPausedTreatmentData,
  pauseOrResumeTreatment,
} from 'redux/Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import {useParams} from 'react-router-dom'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import InputText from 'components/atom/Inputs/InputText'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import dayjs from 'dayjs'
import getColorPalette from 'utils/getColorPalette'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import * as Yup from 'yup'

const PauseTreatment = ({
  handleOnClose,
  alignerJourneyId,
}: {
  handleOnClose: (option: ActionItem) => void
  alignerJourneyId: number | undefined | null
}) => {
  const treatmentPauseEffectsList = [
    {
      checked: false,
      value: 'Patient can’t use the wear timer',
    },
    {
      checked: false,
      value: 'Patient can’t send treatment updates',
    },
    {
      checked: true,
      value: 'You can still edit aligner status and extend wear days',
    },
    {
      checked: true,
      value: 'You and your patient can continue to chat',
    },
    {
      checked: true,
      value: 'You can resume treatment anytime',
    },
  ]
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const formik = useFormik<{
    resumeDate: string
    reason_for_pausing: string | null
  }>({
    initialValues: {
      resumeDate: '',
      reason_for_pausing: null,
    },
    onSubmit: async (values) => {
      if (!alignerJourneyId) return
      await dispatchAction(
        pauseOrResumeTreatment({
          aligner_journey_id: alignerJourneyId,
          treatment_state: treatmentPlanStatusConstants.PAUSED,
          resume_date: values.resumeDate,
          reason_for_pausing: values.reason_for_pausing,
        })
      )
        .unwrap()
        .then(async () => {
          ;(dispatchAction(
            getApiLeadsOverview({
              data: {
                patient_id: safeParseInt(patientId),
                doctor_id: safeParseInt(userId),
              },
            })
          ),
            dispatchAction(
              getLeadsProfileDetails({
                patient_id: safeParseInt(patientId),
                doctor_id: safeParseInt(userId),
              })
            )
              .unwrap()
              .then(async () => {
                dispatchAction(
                  postApiDataTreatmentPlan({
                    data: {
                      patient_id: patientId,
                      alignerJourneyId: alignerJourneyId,
                    },
                  })
                )
                await dispatchAction(
                  getPausedTreatmentData({
                    aligner_journey_id: alignerJourneyId,
                  })
                )
                SuccessToast('Treatment paused successfully! ')
                handleOnClose(actionTypes.PAUSE_TREATMENT)
              }))
        })
    },
    validationSchema: () => {
      return Yup.object({
        resumeDate: Yup.string().required('Please enter a resume date'),
        reason_for_pausing: Yup.string().nullable(),
      })
    },
  })
  const Icon = ActionListOptions[actionTypes.PAUSE_TREATMENT].icon
  return (
    <ModalLayout isResponsive={true} className='md:!w-[30%]'>
      <div className='flex justify-between items-center mb-4'>
        <div className='w-12 h-12 bg-primarySupport rounded-full flex justify-center items-center'>
          <Icon color={getColorPalette().primaryColor} />
        </div>
        <div
          className='cursor-pointer'
          onClick={() => {
            handleOnClose(actionTypes.PAUSE_TREATMENT)
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='overflow-y-auto flex flex-col gap-3'>
        <div>
          <p className='text-2xl font-semibold '>
            {ActionListOptions[actionTypes.PAUSE_TREATMENT].title}
          </p>
          <p className='text-base font-normal text-textColor '>
            {ActionListOptions[actionTypes.PAUSE_TREATMENT].modalSubTitle}
          </p>
        </div>

        <div className='border border-mediumGray rounded-lg p-3 flex flex-col gap-2'>
          <p className='text-textColor font-medium text-base'>What happens when you pause?</p>
          <p className='font-medium text-base'>Patient will be notified that treatment is paused</p>
          <div className='flex flex-col gap-1'>
            {treatmentPauseEffectsList.map((item, index) => (
              <ListItemWithIcon key={index} {...item} className='text-black' />
            ))}
          </div>
        </div>
        <div className='w-full'>
          <InputDateFormik
            {...{
              name: 'resumeDate',
              label: 'Set a resume reminder',
              classNameLabel: 'font-medium',
              className: ' py-3',
              required: true,
              subLabel: 'Choose a date to get notified to resume the treatment',
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik?.setFieldValue('resumeDate', dateString)
              },
            }}
            formik={formik}
            dateValue={formik?.values?.resumeDate}
          />
        </div>
        <InputText
          label='Reason for pausing'
          name='reason_for_pausing'
          placeholder='Describe the reason for pausing'
          formik={formik}
          className='py-2 rounded-lg border '
          classNameLabel='font-medium text-lg text-textColor'
          subLabel='Add a note for your records'
        />
        <AntdButton
          className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
          // isLoading={pausingOrResumingTreatment || loadingLeadsOverview}
          isLoading={formik.isSubmitting}
          text='Save'
          disabled={false}
          onClick={() => {
            formik.handleSubmit()
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default PauseTreatment
