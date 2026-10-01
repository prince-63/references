import RadioGroup from 'components/RadioGroup/RadioGroup'
import AntdButton from 'components/atom/Buttons/AntdButton'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import InputNumber from 'components/atom/Inputs/InputNumber'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {useFormik} from 'formik'
import moment from 'moment'
import {useEffect, useState} from 'react'
import {SVG_CROSS} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  createTreatmentPlan,
  setOpenTreatmentStartingModal,
} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import * as Yup from 'yup'
import extractMaxMinValuesFromJawRanges from '../Tracking/helpers/extractMaxMinValuesFromJawRanges'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import NotePadIcon from 'assets/icons/NotePadIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import clsx from 'clsx'
import trackingTypes from '@constants/trackingTypes'
import {TrackingType} from '../Tracking/types/tracking.types'
import dayjs from 'dayjs'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import userTypes from '@constants/userTypes'
import getColorPalette from 'utils/getColorPalette'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'
interface ITrackingTypeDropDown {
  value: TrackingType
  label: string
  active: boolean
}
const schema = (minCurrentAligner: number, maxCurrentAligner: number) => {
  return Yup.object().shape({
    currentAlignerNumber: Yup.number()
      .required(`Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`)
      .min(
        minCurrentAligner,
        `Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`
      )
      .max(
        maxCurrentAligner,
        `Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`
      ),
    startDate: Yup.date().required('Please select a value in Current Aligner Start Date'),
    endDate: Yup.date()
      .required('Please select a value in Current Aligner End Date')
      .min(Yup.ref('startDate'), 'End date must be later than start date'),
  })
}
const TreatmentStartingDetailsModal = ({
  setOpenFinalizeSuccessModal,
  minStartDate,
}: {
  setOpenFinalizeSuccessModal: (x: boolean) => void
  minStartDate: string
}) => {
  const {dispatchAction} = useDispatchAction()
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)

  const {minCurrentAligner, maxCurrentAligner} = extractMaxMinValuesFromJawRanges(
    treatmentPlan?.aligner_details_meta_data
  )
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const {isPractice} = useAllUserPlan()

  const formik = useFormik<{
    tracking_type: TrackingType
    startDate: string
    endDate: string
    currentAlignerNumber?: number
  }>({
    initialValues: {
      tracking_type: trackingTypes.PATIENTAPP,
      startDate: '',
      currentAlignerNumber: undefined,
      endDate: '',
    },
    validationSchema: schema(minCurrentAligner, maxCurrentAligner),
    validateOnChange: true,
    onSubmit: (values) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {aligner_details_meta_data, filesToSave, otherFilesToSave, video_files_to_save} =
        treatmentPlan
      const details = {
        aligner_treatment_details: aligner_details_meta_data,
        treatment_plan_id: treatmentPlan?.treatment_plan_id,
        treatment_sub_type: treatmentTypeMain.ALIGNERS,
        production_lab_details: treatmentPlan.production_lab_details,
        treatment_plan_tag_name: treatmentPlan.treatment_plan_tag_name,
        days_to_wear_each_aligner: treatmentPlan.days_to_wear_each_aligner,
        recommended_hours_to_wear_aligners: treatmentPlan.recommended_hours_to_wear_aligners,
        treatment_planning_software: treatmentPlan.treatment_planning_software,
        treatment_planning_link: treatmentPlan.treatment_planning_link,
        remarks: treatmentPlan.remarks,
        doctor_id: treatmentPlan.doctor_id,
        patient_id: treatmentPlan.patient_id,
        video_display_to_patient: treatmentPlan.is_video_display_patient,
        link_display_patient: treatmentPlan.is_link_display_patient,
        tracking_status: treatmentPlanStatusConstants.ACTIVE,
        status: treatmentPlanStatusConstants.ACTIVE,
        current_aligner_no: values.currentAlignerNumber,
        start_date: values.startDate,
        end_date: values.endDate,
        user_type: userTypes.DOCTOR,
        pricing: 0,
        tracking_type: values.tracking_type,
        ask_to_patient_fill: false,
        approved_by_patient_at: null,
        treatment_plan_upload_type: treatmentPlan.treatment_plan_upload_type,
      }

      const detailsForPractice = {
        ...details,
        order_id: treatmentPlan.order_id ?? null,
        approver_status: treatmentPlanStatusConstants.APPROVED,
        initiator_status: treatmentPlanStatusConstants.APPROVED,
        order_status_changed_at: new Date().toISOString(),
      }

      dispatchAction(
        createTreatmentPlan({
          details: isPractice ? detailsForPractice : details,
          files: filesToSave,
          video_files: video_files_to_save,
          other_files: otherFilesToSave,
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(setOpenTreatmentStartingModal(false))
          setOpenFinalizeSuccessModal(true)
        })
        .catch(() => {
          formik.setSubmitting(false)
        })
    },
  })
  useEffect(() => {
    const {startDate} = formik.values
    if (hasValue(startDate)) {
      formik.setFieldValue(
        'endDate',
        moment(startDate).add(treatmentPlan.days_to_wear_each_aligner, 'days').format('YYYY-MM-DD')
      )
    }
  }, [formik.values.startDate])
  const onQuickDateSelectionChange = (key: string, value: string) => {
    formik.setFieldValue(key, value === formik.getFieldProps(key).value ? '' : value)

    const setStartDate = (date: string) => {
      if (formik.values.startDate === date) {
        formik.setFieldValue('startDate', '')
      } else {
        formik.setFieldValue('startDate', date)
      }
    }

    const today = moment().format('YYYY-MM-DD')
    const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')

    if (value === 'Today') {
      setStartDate(today)
    } else if (value === 'Tomorrow') {
      setStartDate(tomorrow)
    }
  }
  const quickDateSelectOptions = [
    {value: 'Today', label: 'Today'},
    {value: 'Tomorrow', label: 'Tomorrow'},
  ]
  const [trackingOptions, setTrackingOptions] = useState<ITrackingTypeDropDown[]>([
    {label: 'Patient app', active: true, value: trackingTypes.PATIENTAPP},
    {label: 'Manual', active: false, value: trackingTypes.MANUAL},
  ])

  useEffect(() => {
    if (dataLeadsOverview.tracking.type === 'PATIENTAPP') {
      setTrackingOptions([{label: 'Patient app', active: true, value: trackingTypes.PATIENTAPP}])
    }
  }, [dataLeadsOverview.tracking.type])

  const handleRadioChange = (object: ITrackingTypeDropDown) => {
    formik.setFieldValue('tracking_type', object.value)
    setTrackingOptions(
      trackingOptions.map((option) => ({
        ...option,
        active: option.value === object.value,
      }))
    )
  }

  return (
    <ModalLayout className='md:w-[628px]' isResponsive>
      <div className='flex justify-between items-center mb-4'>
        <div className='w-[64px] h-[64px] bg-primarySupport rounded-full flex justify-center items-center'>
          <NotePadIcon />
        </div>
        <div
          className='cursor-pointer'
          onClick={() => {
            dispatchAction(setOpenTreatmentStartingModal(false))
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='max-h-[75vh] flex flex-col gap-4 overflow-auto card-wrapper pb-3 px-2'>
        <div>
          <p className='text-2xl font-semibold '>When is the treatment starting?</p>
          <p className='text-base font-normal text-textColor '>
            You can enter today's or future's date for treatment starting
          </p>
        </div>
        <div className='flex justify-center items-start gap-2 border border-primaryColor rounded-lg p-3 text-sm font-semibold text-primaryColor'>
          <InfoIcon color={getColorPalette().primaryColor} width='20' height='20' />
          <div>
            Once confirmed, the tracking method cannot be changed. To modify it, you will need to
            create a new treatment plan.
          </div>
        </div>

        <div>
          <div className='text-textColor text-[16px] font-medium'>Select tracking method</div>
          <div className='w-full flex gap-2'>
            {trackingOptions.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  'w-full flex items-center space-x-2 border p-3 rounded-lg',
                  formik.isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer',
                  option.active ? ' border-primaryColor' : ''
                )}
              >
                <input
                  type='radio'
                  name='tracking_type'
                  checked={formik.values.tracking_type === option.value}
                  onChange={() => handleRadioChange(option)}
                  className={clsx(
                    'form-radio h-5 w-5 accent-primaryColor',
                    formik.isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
                  )}
                />
                <span
                  className={clsx(
                    option.active ? 'text-primaryColor' : 'text-textColor',
                    'truncate font-medium'
                  )}
                >
                  {option.label}
                </span>
              </label>
            ))}{' '}
          </div>
        </div>

        <div className='w-full'>
          <InputNumber
            formik={formik}
            name='currentAlignerNumber'
            className=''
            classNameLabel='font-medium'
            label='Current aligner number'
            required={true}
          />
        </div>
        <div className='w-full'>
          <InputDateFormik
            {...{
              name: 'startDate',
              label: 'Current aligner start date',
              className: ' py-3',
              classNameLabel: 'font-medium',
              required: true,
              minDate: dayjs(minStartDate),
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik.setFieldValue('startDate', dateString)
                const today = dayjs().format('YYYY-MM-DD')
                const tomorrow = dayjs().add(1, 'days').format('YYYY-MM-DD')
                if (dateString === today) {
                  formik.setFieldValue('quickDateSelect', 'Today')
                } else if (dateString === tomorrow) {
                  formik.setFieldValue('quickDateSelect', 'Tomorrow')
                } else {
                  formik.setFieldValue('quickDateSelect', '')
                }
              },
            }}
            formik={formik}
            dateValue={formik?.values?.startDate}
          />
          <RadioGroup
            options={quickDateSelectOptions}
            onOptionChange={(option: string) => {
              onQuickDateSelectionChange('quickDateSelect', option)
            }}
            selectedOption={formik.getFieldProps('quickDateSelect').value}
            className='w-24 rounded-[4px]'
          />
        </div>
        <div className='w-full'>
          <InputDateFormik
            {...{
              name: 'endDate',
              label: 'Current aligner end date',
              className: ' py-3',
              classNameLabel: 'font-medium',
              required: true,
              minDate: dayjs(formik.values.startDate).add(1, 'days'),
              disabled: !hasValue(formik.values.startDate),
              onChange: (date: dayjs.Dayjs, dateString: string | string[]) => {
                formik.setFieldValue('endDate', dateString)
              },
            }}
            formik={formik}
            dateValue={formik?.values?.endDate}
          />
        </div>
      </div>
      <AntdButton
        className='bg-primaryColor text-white h-12 font-semibold text-base w-full'
        isLoading={formik.isSubmitting}
        text='Start treatment'
        disabled={formik.isSubmitting}
        onClick={() => {
          formik.handleSubmit()
        }}
      />
    </ModalLayout>
  )
}

export default TreatmentStartingDetailsModal
