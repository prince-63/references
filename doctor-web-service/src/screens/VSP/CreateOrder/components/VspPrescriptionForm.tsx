import LabelTitle from 'components/atom/Labels/LabelTitle'
import {useFormikContext} from 'formik'
import InputDateFormik from 'components/atom/Inputs/InputDateFormik'
import RadioGroupIconWithDescription, {
  RadioOptionWithDescription,
} from 'components/RadioGroup/RadioGroupIconWithDescription'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import dayjs from 'dayjs'

const SURGERY_TYPE_OPTIONS: RadioOptionWithDescription[] = [
  {value: 'single_jaw', label: 'Single Jaw'},
  {value: 'bi_jaw', label: 'Bi-Jaw'},
  {value: 'undecided', label: 'Undecided (Plan both single & bi-jaw)'},
  {value: 'genioplasty', label: 'Genioplasty'},
  {value: 'others', label: 'Others'},
]
/**
 * Calculates turnaround deadlines based on surgery date.
 * Deadline 1: 14 working days before surgery (submit clinical data)
 * Deadline 2: 7 working days before surgery (approve 3D plan)
 */
const getWorkingDaysBefore = (date: dayjs.Dayjs, workingDays: number): dayjs.Dayjs => {
  let d = date
  let count = 0
  while (count < workingDays) {
    d = d.subtract(1, 'day')
    const day = d.day()
    if (day !== 0 && day !== 6) count++
  }
  return d
}

interface VspPrescriptionFormProps {
  // Component uses useFormikContext() to access form data from parent
}

export const VspPrescriptionForm = ({}: VspPrescriptionFormProps) => {
  const formik = useFormikContext<{
    surgery_type: string
    prescription_mode: string
    treatment_plan: string
    tentative_surgery_date: string
    earliest_treatment_plan_date: string
    others_description: string
  }>()

  const disabledDate = (current: any) => {
    // Can not select days before today
    return current && current < dayjs().startOf('day')
  }

  const surgeryDate = formik.values.tentative_surgery_date
    ? dayjs(formik.values.tentative_surgery_date)
    : null

  const deadline1 = surgeryDate ? getWorkingDaysBefore(surgeryDate, 14) : null
  const deadline2 = surgeryDate ? getWorkingDaysBefore(surgeryDate, 7) : null

  return (
    <div className='mx-auto w-full space-y-6 pb-28'>
      {/* Surgery Type */}
      <div className='flex flex-col gap-2'>
        <LabelTitle
          title='What type of surgery are you planning?'
          required
          className='mt-4 font-figtree font-semibold text-[18px] leading-[26px] tracking-[-0.01em] not-italic text-black'
        />
        <RadioGroupIconWithDescription
          options={SURGERY_TYPE_OPTIONS}
          selectedOption={formik.values.surgery_type}
          onOptionChange={(value) => {
            formik.setFieldValue('surgery_type', value)

            if (value !== 'others') {
              formik.setFieldValue('others_description', '')
            }
          }}
          wrapperClassName='mt-3 grid w-full grid-cols-1 gap-3 sm:grid-cols-2'
        />

        {formik.values.surgery_type === 'others' && (
          <FormikInputTextArea
            name='others_description' // ✅ correct
            required
            className='py-3'
            placeholder='Add a description.'
          />
        )}
      </div>

      {/* Treatment Plan */}
      <div>
        <LabelTitle
          title='Your Treatment plan'
          required={false}
          className='mt-4 font-figtree font-semibold text-[18px] leading-[26px] tracking-[-0.01em] not-italic text-black'
        />
        <span className='text-sm text-gray-400 ml-1'>(Optional)</span>
        <div className='mt-2 rounded-lg border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'>
          <ReactQuill
            theme='snow'
            value={formik.values.treatment_plan}
            placeholder='Enter Treatment Plan'
            onChange={(value) => {
              formik.setFieldValue('treatment_plan', value)
            }}
            modules={{
              toolbar: [
                ['bold', 'italic', 'underline'],
                [{list: 'ordered'}, {list: 'bullet'}], // ✅ lists work perfectly
              ],
            }}
            className='bg-white'
          />
        </div>
      </div>

      {/* Date Selection */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <InputDateFormik
          name='tentative_surgery_date'
          label='Tentative Surgery Date'
          required
          classNameLabel='text-textColor text-sm font-bold'
          className='w-full'
          onChange={(date: dayjs.Dayjs, dateString: string | string[]) => {
            formik.setFieldValue('tentative_surgery_date', dateString)
            if (date && dayjs(dateString as string).isValid()) {
              const planByDate = getWorkingDaysBefore(dayjs(dateString as string), 7)
              formik.setFieldValue('earliest_treatment_plan_date', planByDate.format('YYYY-MM-DD'))
            }
          }}
          dateValue={formik.values.tentative_surgery_date}
          formik={formik}
          disabledDate={disabledDate}
        />
        <InputDateFormik
          name='earliest_treatment_plan_date'
          label='Earliest you want the treatment plan by'
          required
          classNameLabel='text-textColor text-sm font-bold'
          className='w-full'
          disabled={!formik.values.tentative_surgery_date}
          onChange={(date: dayjs.Dayjs, dateString: string | string[]) => {
            formik.setFieldValue('earliest_treatment_plan_date', dateString)
          }}
          dateValue={formik.values.earliest_treatment_plan_date}
          formik={formik}
          disabledDate={disabledDate}
        />
      </div>

      {/* Turnaround Time & Schedule */}
      <div className='rounded-lg border border-indigo-100 bg-indigo-50/50 p-5'>
        <div className='flex items-center gap-2 mb-3'>
          <svg
            className='h-5 w-5 text-indigo-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
          <h3 className='text-sm font-semibold text-gray-900'>Turnaround Time &amp; Schedule</h3>
        </div>

        <p className='text-sm text-gray-600 leading-relaxed'>
          Our standard turnaround time for treatment planning is <strong>7 working days</strong>{' '}
          from the receipt of complete clinical data. Splints will be dispatched within 7 working
          days following your final approval of the treatment plan.
        </p>

        {surgeryDate && (
          <div className='mt-4 rounded-md border border-indigo-200 bg-white p-4'>
            <p className='text-sm font-semibold text-gray-900 mb-3'>
              Recommended Timeline for Surgery on {surgeryDate.format('ddd, MMMM D, YYYY')}
            </p>

            <div className='space-y-2'>
              <div className='flex items-start gap-3 text-sm'>
                <span className='shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500 w-20'>
                  Deadline 1
                </span>
                <span className='text-gray-700'>
                  Submit all clinical data by{' '}
                  <strong className='text-indigo-600'>
                    {deadline1?.format('ddd, MMM D, YYYY')}
                  </strong>
                </span>
              </div>
              <div className='flex items-start gap-3 text-sm'>
                <span className='shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500 w-20'>
                  Deadline 2
                </span>
                <span className='text-gray-700'>
                  Approve 3D plan by{' '}
                  <strong className='text-indigo-600'>
                    {deadline2?.format('ddd, MMM D, YYYY')}
                  </strong>{' '}
                  to allow 7 working days for splint manufacturing &amp; dispatch.
                </span>
              </div>
            </div>

            <p className='mt-3 text-right text-xs italic text-gray-400'>
              *Excludes weekends and public holidays.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
