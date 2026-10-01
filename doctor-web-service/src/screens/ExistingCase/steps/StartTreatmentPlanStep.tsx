import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import Page from 'components/page/Page'
import {Formik} from 'formik'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import Footer from '../components/Footer'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import trackingTypes from '@constants/trackingTypes'
import userTypes from '@constants/userTypes'
import {
  setOpenStartTreatmentPlanModal,
  setSaveTrackingData,
} from 'redux/Slices/AppSlice/ExistingCase/ExistingCase.slice'
import {useEffect, useState} from 'react'
import dayjs from 'dayjs'
import hasValue from 'utils/hasValue'
import moment from 'moment'
import * as Yup from 'yup'
import isPlanExpired from '@utils/isPlanExpired'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import UpgradePlanModal from 'components/subscription/modals/UpgradePlanModal'
import When from 'components/when/When'
import {safeParseInt} from 'utils/ConstFunctions'

type StartTreatmentFormValues = {
  current_aligner: string
  current_aligner_start_date: string // ISO string format
  current_aligner_end_date: string // ISO string format
}

const StartTreatmentPlanStep = () => {
  const dispatch = useDispatch()
  const {subscriptionData} = useSubscriptionDetails(true)
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})
  const {saveTreatmentData: treatmentPlan, saveManufacturingData} = useSelector(
    (state: RootState) => state.existingCase
  )

  function normalizeStart(value: number) {
    const n = safeParseInt(value)

    // treat "", null, undefined, NaN, or 0 as 1
    if (!n || n < 1 || !Number.isFinite(n)) return 1

    return n
  }

  const upper = safeParseInt(saveManufacturingData?.upper_aligner_end) || 0
  const lower = safeParseInt(saveManufacturingData?.lower_aligner_end) || 0

  const currentAlignerNumber = Math.max(upper, lower)

  // Normalize starts_with values
  const upperStart = normalizeStart(
    treatmentPlan?.aligner_details_meta_data?.upper_jaw?.starts_with
  )
  const lowerStart = normalizeStart(
    treatmentPlan?.aligner_details_meta_data?.lower_jaw?.starts_with
  )

  const startAligner = Math.min(upperStart, lowerStart)

  // Generate list
  const alignerOptions = Array.from({length: currentAlignerNumber}, (_, i) => ({
    label: `${startAligner + i}`,
    value: startAligner + i,
  }))

  const daysToWear = treatmentPlan?.days_to_wear_each_aligner ?? 14
  const validationSchema = Yup.object({
    current_aligner: Yup.string().required('Current aligner is required'),
    current_aligner_start_date: Yup.date().required('Start date is required'),

    current_aligner_end_date: Yup.date()
      .required('End date is required')
      .min(Yup.ref('current_aligner_start_date'), 'End date should not be less than start date'),
  })

  const handleSubmit = async (values: StartTreatmentFormValues) => {
    if (isPlanExpired(subscriptionData) || subscriptionAlerts.patients.error) {
      setIsUpgradeModalOpen(true)
      return
    }
    const startDateOnly = dayjs(values.current_aligner_start_date).format('YYYY-MM-DD')
    const endDateOnly = dayjs(values.current_aligner_end_date).format('YYYY-MM-DD')

    const trackingPayload = {
      tracking_type: trackingTypes.PATIENTAPP,
      current_aligner_details: {
        number: String(values.current_aligner),
        start_date: dayjs.utc(startDateOnly, 'YYYY-MM-DD').startOf('day').toISOString(), // 2025-11-10T00:00:00.000Z (no date shift)
        end_date: dayjs.utc(endDateOnly, 'YYYY-MM-DD').endOf('day').toISOString(), // 2025-11-24T23:59:59.999Z
      },
      user_type: userTypes.DOCTOR,
      pricing: 0,
      status: 'ACTIVE',
      doctor_name: '',
      treatment_updating: false,
      ask_to_patient_fill: false,
    }
    dispatch(setSaveTrackingData(trackingPayload))
    dispatch(setOpenStartTreatmentPlanModal(true))
  }

  return (
    <Page title='Start Treatment Plan'>
      <When isTrue={isUpgradeModalOpen}>
        <UpgradePlanModal
          title='You’ve reached your patient limit'
          subTitle='To add more patients, please contact us to top up your limit.'
          onClose={() => setIsUpgradeModalOpen(false)}
        />{' '}
      </When>

      <div className='flex flex-col gap-3 md:w-4/5 pb-28 sm:pb-28 md:pb-12 h-[70vh] overflow-scroll'>
        <Formik
          enableReinitialize
          initialValues={{
            current_aligner: '',
            current_aligner_start_date: '',
            current_aligner_end_date: '',
          }}
          onSubmit={handleSubmit}
          validationSchema={validationSchema}
        >
          {(formik) => {
            useEffect(() => {
              const {current_aligner_start_date} = formik.values
              if (hasValue(current_aligner_start_date)) {
                formik.setFieldValue(
                  'current_aligner_end_date',
                  moment(current_aligner_start_date)
                    .add(treatmentPlan.days_to_wear_each_aligner, 'days')
                    .format('YYYY-MM-DD')
                )
              }
            }, [formik.values.current_aligner_start_date, daysToWear])

            return (
              <>
                <div className='flex flex-col gap-3'>
                  <FormikSelectList
                    name='current_aligner'
                    label='Current Aligner'
                    items={alignerOptions}
                    required
                  />

                  <FormikDatePicker
                    name='current_aligner_start_date'
                    label='Current Aligner Start date'
                    className='py-3'
                    required={true}
                    format='DD-MM-YYYY'
                  />

                  <FormikDatePicker
                    name='current_aligner_end_date'
                    label='Current Aligner End date'
                    className='py-3'
                    required={true}
                    format='DD-MM-YYYY'
                  />
                </div>

                <Footer onNext={() => formik.handleSubmit()} />
              </>
            )
          }}
        </Formik>
      </div>
    </Page>
  )
}

export default StartTreatmentPlanStep
