import actionTypes from '@constants/actionTypes'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import ModalLayout from 'components/modal/ModalLayout'
import When from 'components/when/When'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import hasValue from 'utils/hasValue'

import {GoStack} from 'react-icons/go'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFormik} from 'formik'
import InputTextArea from 'components/atom/Inputs/InputTextArea'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {postCompleteTreatment} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import {AllTreatmentPlanListItem} from '../../treatment/types/treatmentPlan.types'
import {
  getApiLeadsOverview,
  getPatientTimeLineList,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useParams} from 'react-router-dom'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {postApiDataTreatmentPlan} from 'redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import {useContext, useEffect} from 'react'
import {AuthContext} from 'context/AuthContext'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)
import patientOverviewAlignerActionFilterConstants from '@constants/patientOverviewAlignerActionFilterConstants.constants'
import InfoCard from '../components/InfoCard'
import getColorPalette from 'utils/getColorPalette'
import ListItemWithIcon from './components/ListItemWithIcon'
import * as Yup from 'yup'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {IoCalendarOutline} from 'react-icons/io5'
export const CompleteTreatment = ({
  handleOnClose,
  alignerJourneyId,
}: {
  handleOnClose: (option: ActionItem) => void
  alignerJourneyId: number | undefined | null
}) => {
  const {data: patientData} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const dispatch = useDispatch()
  const {patientTimelineList} = useSelector((state: RootState) => state.leadsProfile)
  const {postCompleteTreatmentLoading} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const allAligners = patientTimelineList[0]?.aligners

  useEffect(() => {
    // Your effect logic here
    dispatch(
      getPatientTimeLineList({
        doctor_id: safeParseInt(userId),
        patient_id: safeParseInt(patientId),
        filter: patientOverviewAlignerActionFilterConstants.ALL_ALIGNERS,
      }) as any
    )
  }, [])

  const lastAlignerEndDate =
    allAligners && allAligners.length > 0 ? allAligners[allAligners.length - 1].end_date : null

  let humanDuration = null

  const firstAlignerStartDate =
    allAligners && allAligners.length > 0 ? allAligners[0].start_date : null

  if (firstAlignerStartDate && lastAlignerEndDate) {
    const diffInMs = dayjs(lastAlignerEndDate)
      .endOf('day')
      .diff(dayjs(firstAlignerStartDate).startOf('day'))
    const dur = dayjs.duration(diffInMs + 1) // add 1 day worth of ms

    const years = dur.years()
    const months = dur.months()
    const days = dur.days()

    humanDuration =
      (years ? `${years} year${years > 1 ? 's' : ''} ` : '') +
      (months ? `${months} month${months > 1 ? 's' : ''} ` : '') +
      (days ? `${days} day${days > 1 ? 's' : ''}` : '')
  }

  const actualEndDate = lastAlignerEndDate
  const today = dayjs()

  let earlyCompletion: string | null = null
  let lateCompletion: string | null = null

  if (actualEndDate) {
    const diffInDays = dayjs(actualEndDate).startOf('day').diff(today.startOf('day'), 'day')

    if (diffInDays > 0) {
      earlyCompletion = `${diffInDays} day${diffInDays > 1 ? 's' : ''}`
    } else if (diffInDays < 0) {
      const lateDays = Math.abs(diffInDays)
      lateCompletion = `${lateDays} day${lateDays > 1 ? 's' : ''}`
    } else {
      // Exact same day = on time
      earlyCompletion = null
      lateCompletion = null
    }
  }

  const treatmentCompleteEffectsList = [
    {
      checked: false,
      value: 'Stop ongoing aligner tracking for this patient',
    },
    {
      checked: false,
      value: 'Prevent further updates on stages changes',
    },
    {
      checked: false,
      value: 'Notify Connected partner if applicable',
    },
  ]

  const {allTreatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const activeTreatmentPlan: AllTreatmentPlanListItem | undefined = allTreatmentPlanList.find(
    (t) => t.treatment_status === treatmentPlanStatusConstants.ACTIVE
  )
  const {patientId} = useParams<{patientId: string}>()
  const {userId} = useContext(AuthContext)
  const upper = activeTreatmentPlan?.upper_jaw_details
  const lower = activeTreatmentPlan?.lower_jaw_details

  const {dispatchAction} = useDispatchAction()

  const formik = useFormik<{
    completion_remarks: string
  }>({
    initialValues: {
      completion_remarks: '',
    },
    validationSchema: Yup.object({
      completion_remarks: Yup.string()
        .required('Remarks are required')
        .min(2, 'Remarks must be at least 2 characters')
        .max(500, 'Remarks cannot exceed 500 characters'),
    }),
    onSubmit: async (values) => {
      if (!alignerJourneyId) return
      if (!activeTreatmentPlan) return
      if (!activeTreatmentPlan.aligner_treatment_id) return

      dispatchAction(
        postCompleteTreatment({
          treatment_plan_id: activeTreatmentPlan.aligner_treatment_id,
          treatment_completed_remarks: values.completion_remarks,
        })
      )
        .unwrap()
        .then(async () => {
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
              SuccessToast('Treatment Marked as completed')

              handleOnClose(actionTypes.COMPLETE_TREATMENT)
            })
        })
    },
  })

  return (
    <ModalLayout isResponsive={true} className='md:!w-[40%]'>
      <div className='flex flex-col gap-3'>
        <div>
          <p className='text-2xl font-semibold '>Mark Treatment as Completed?</p>
          <p className='text-base font-normal text-textColor '>
            You’re about to complete treatment for{' '}
            <span className='font-medium text-black'>
              {patientData?.patient_details?.full_name}
            </span>
            . This action cannot be undone.
          </p>
        </div>

        <div className='border border-mediumGray rounded-lg p-4 flex flex-col gap-2'>
          <p className='font-medium text-base'>{activeTreatmentPlan?.treatment_name}</p>
          <div className='flex flex-col md:flex-row md:items-center gap-5'>
            <div className='flex items-center gap-2'>
              <GoStack color='#666666' />
              <span className='text-textColor font-normal text-base'>Aligners</span>
              <div className='flex gap-1 items-center'>
                <When
                  isTrue={
                    hasValue(upper?.starts_with) &&
                    hasValue(upper?.ends_with) &&
                    upper?.starts_with !== 0 &&
                    upper?.ends_with !== 0
                  }
                >
                  <span>U{upper?.starts_with}</span>
                  <span>to</span>
                  <span>U{upper?.ends_with}</span>
                </When>
                {hasValue(upper?.starts_with) &&
                  hasValue(upper?.ends_with) &&
                  hasValue(lower?.starts_with) &&
                  hasValue(lower?.ends_with) &&
                  upper?.starts_with !== 0 &&
                  upper?.ends_with !== 0 &&
                  lower?.starts_with !== 0 &&
                  lower?.ends_with !== 0 && (
                    <span className='w-1 h-1 rounded-full bg-textColor'></span>
                  )}
                <When
                  isTrue={
                    hasValue(lower?.starts_with) &&
                    hasValue(lower?.ends_with) &&
                    lower?.starts_with !== 0 &&
                    lower?.ends_with !== 0
                  }
                >
                  <When isTrue={hasValue(lower)}>
                    <span>L{lower?.starts_with}</span>
                    <span>to</span>
                    <span>L{lower?.ends_with}</span>
                  </When>
                </When>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <IoCalendarOutline color='#666666' />
              <span className='text-textColor font-normal text-base'>Duration</span>
              <div className='flex gap-1 items-center'>
                <When isTrue={hasValue(humanDuration)}>{humanDuration}</When>
              </div>
            </div>
          </div>
        </div>

        <div className='flex flex-col gap-3'>
          <InfoCard
            {...{
              title: earlyCompletion
                ? `Treatment completion will be early by ${earlyCompletion}`
                : lateCompletion
                  ? `Treatment completion is delayed by ${lateCompletion}`
                  : 'Your treatment completion was on time',
              showButton: false,
              titleClassName: 'text-base text-primaryColor',
              className: 'bg-primarySupport border border-primaryColor gap-2',
              infoIconColor: getColorPalette().primaryColor,
            }}
          />
        </div>

        <div className='p-3 flex flex-col gap-2'>
          <p className='text-textColor font-medium text-base'>This will</p>

          <div className='flex flex-col gap-1'>
            {treatmentCompleteEffectsList.map((item, index) => (
              <ListItemWithIcon key={index} {...item} className='text-black' />
            ))}
          </div>
        </div>

        <InputTextArea
          {...{
            classNameLabel: 'text-base font-medium text-textColor ',
            rows: 2,
            className: 'border border-mediumGray rounded-lg p-2 card-wrapper ',
            name: 'completion_remarks',
            label: 'Remarks',
            formik,
            maxLength: 500,
            required: true,
            placeholder: 'Enter your reason',
          }}
        />
        <div className='flex items-center gap-2'>
          <AntdButton
            className='bg-transparent border-textColor text-textColor h-12 font-semibold text-base w-full'
            // isLoading={pausingOrResumingTreatment || loadingLeadsOverview}
            text='Cancel'
            disabled={false}
            onClick={() => {
              handleOnClose(actionTypes.COMPLETE_TREATMENT)
            }}
          />

          <AntdButton
            className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
            // isLoading={pausingOrResumingTreatment || loadingLeadsOverview}
            isLoading={postCompleteTreatmentLoading}
            text='Mark as completed'
            disabled={false}
            onClick={() => {
              formik.handleSubmit()
            }}
          />
        </div>
      </div>
    </ModalLayout>
  )
}
