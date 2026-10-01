import trackingTypes from '@constants/trackingTypes'
import userTypes from '@constants/userTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import FormikSelect from 'components/atom/Inputs/FormikSelect'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {Formik, useFormikContext} from 'formik'
import moment from 'moment'
import {useContext, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {postTrackingDetails} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {RootState} from 'redux/store'
import {ApiGetData, arrayOfAligners, safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import extractMaxMinValuesFromJawRanges from '../../treatment/Tracking/helpers/extractMaxMinValuesFromJawRanges'
import isPlanExpired from '@utils/isPlanExpired'
import When from 'components/when/When'
import UpgradePlanModal from 'components/subscription/modals/UpgradePlanModal'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {AuthContext} from 'context/AuthContext'
import {useEffect} from 'react'

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

const dateValidationShape = {
  startDate: Yup.date().required('Please select a value in Current Aligner Start Date'),
  endDate: Yup.date()
    .required('Please select a value in Current Aligner End Date')
    .min(Yup.ref('startDate'), 'End date must be later than start date'),
}

type FormValues = {
  trackingSelectTypes: string
  currentAlignerNumber: string
  startDate: string
  endDate: string
}

/** Keeps endDate = startDate + days_to_wear_each_aligner */
const SyncEndDateWithStart: React.FC<{daysToWear?: number}> = ({daysToWear}) => {
  const {values, setFieldValue} = useFormikContext<FormValues>()

  useEffect(() => {
    if (hasValue(values.startDate) && Number.isFinite(Number(daysToWear))) {
      const nextEnd = moment(values.startDate)
        .add(Number(daysToWear || 0), 'days')
        .format('YYYY-MM-DD')
      setFieldValue('endDate', nextEnd)
    }
    // only react to startDate/daysToWear changes
  }, [values.startDate, daysToWear, setFieldValue])

  return null
}

const ConfirmStartTreatmentModal = ({
  openModal,
  setOpenModal,
  planId,
}: {
  openModal: boolean
  setOpenModal: (x: boolean) => void
  planId: number | null
}) => {
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()

  const {treatmentPlan, treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )

  const alignerList = arrayOfAligners(treatmentPlan?.aligner_details_meta_data)
  const {minCurrentAligner, maxCurrentAligner} = extractMaxMinValuesFromJawRanges(
    treatmentPlan?.aligner_details_meta_data
  )

  /** Count delivered aligners from manufacturing details */
  const deliveredAlignerCount = useMemo(() => {
    const details = treatmentPlan?.manufacturing_details
    if (!Array.isArray(details) || details.length === 0) return 0

    return details.reduce((total, batch) => {
      if ((batch as any)?.status === 'DELIVERED') {
        const count = Number((batch as any)?.total_aligners ?? 0)
        return total + (Number.isFinite(count) ? count : 0)
      }
      return total
    }, 0)
  }, [treatmentPlan?.manufacturing_details])

  /** Options limited to delivered aligners only (numeric-safe coercion) */
  const deliveredAlignerOptions = useMemo(() => {
    if (!Array.isArray(alignerList) || deliveredAlignerCount <= 0) return []
    return alignerList
      .filter((opt) => Number(opt?.value) <= Number(deliveredAlignerCount))
      .map((opt) => ({
        label: opt.label,
        value: String(opt.value),
      }))
  }, [alignerList, deliveredAlignerCount])

  const hasDeliveredAligners = deliveredAlignerOptions.length > 0

  /** Compute min/max from the delivered options (fallback to jaw-range bounds) */
  const minSelectableAligner = useMemo(() => {
    if (!hasDeliveredAligners) return null
    return deliveredAlignerOptions
      .map((o) => Number(o.value))
      .reduce((a, b) => Math.min(a, b), Infinity)
  }, [hasDeliveredAligners, deliveredAlignerOptions])

  const maxSelectableAligner = useMemo(() => {
    if (!hasDeliveredAligners) return null
    return deliveredAlignerOptions
      .map((o) => Number(o.value))
      .reduce((a, b) => Math.max(a, b), -Infinity)
  }, [hasDeliveredAligners, deliveredAlignerOptions])

  /** Default current aligner = earliest delivered, else empty */
  const defaultAlignerValue = useMemo(() => {
    if (!hasDeliveredAligners) return ''
    const minDelivered = deliveredAlignerOptions
      .map((o) => Number(o.value))
      .reduce((a, b) => Math.min(a, b), Infinity)
    return String(minDelivered)
  }, [hasDeliveredAligners, deliveredAlignerOptions])

  /** Validation */
  const validationSchema = useMemo(() => {
    if (!hasDeliveredAligners) {
      return Yup.object().shape({
        currentAlignerNumber: Yup.mixed().nullable(),
        ...dateValidationShape,
      })
    }
    const minValue = minSelectableAligner ?? minCurrentAligner ?? 1
    const maxValue = maxSelectableAligner ?? maxCurrentAligner ?? minValue
    return schema(minValue, maxValue)
  }, [
    hasDeliveredAligners,
    minSelectableAligner,
    maxSelectableAligner,
    minCurrentAligner,
    maxCurrentAligner,
  ])

  /** Subscription checks */
  const {subscriptionData} = useSubscriptionDetails()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})

  const hasDeactivatedPlan =
    treatmentPlanList &&
    treatmentPlanList.some(
      (item) =>
        item.status === treatmentPlanStatusConstants.DEACTIVATED &&
        hasValue(item.aligner_journey_id)
    )

  return (
    <Formik<FormValues>
      initialValues={{
        trackingSelectTypes: trackingTypes.PATIENTAPP,
        currentAlignerNumber: defaultAlignerValue, // only the latest delivered aligner
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: '',
      }}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        if (!treatmentPlan) return

        if (isPlanExpired(subscriptionData) || subscriptionAlerts.patients.error) {
          setIsUpgradeModalOpen(true)
          return
        }

        const payload = {
          tracking_type: trackingTypes.PATIENTAPP,
          current_aligner_details: {
            number: String(values.currentAlignerNumber),
            start_date: dayjs(values?.startDate).format('YYYY-MM-DD'),
            end_date: dayjs(values?.endDate).format('YYYY-MM-DD'),
          },
          user_type: userTypes.DOCTOR,
          pricing: 0,
          status: 'ACTIVE',
          aligner_treatment_plan_id: planId ?? safeParseInt(treatmentPlan?.treatment_plan_id),
          doctor_name: '',
          treatment_updating: false,
          ask_to_patient_fill: false,
          is_treatment_refinement: !!hasDeactivatedPlan,
        }

        try {
          await dispatchAction(postTrackingDetails(payload)).unwrap()
          const postData: ApiGetData = {
            data: {
              patient_id: safeParseInt(patientId),
              doctor_id: safeParseInt(userId),
            },
          }
          dispatchAction(getApiLeadsOverview(postData))
          navigate(`/profile/${patientId}/starting-treatment`)
        } catch {
          ErrorToast('something went wrong')
        }
      }}
    >
      {(formik) => (
        <Modal
          closable={true}
          onCancel={() => setOpenModal(false)}
          destroyOnClose={true}
          open={openModal}
          className={clsx('md:w-[566px] w-full')}
          maskClosable={false}
          width={566}
          footer={
            <div className={clsx('flex gap-2 px-5 pb-5')}>
              <button
                className={clsx(
                  'w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
                )}
                type='button'
                onClick={() => setOpenModal(false)}
              >
                {'Cancel'}
              </button>
              <button
                className={clsx(
                  'w-full text-white bg-primaryColor py-3 px-6 rounded-lg',
                  (!hasDeliveredAligners || isConfirming || formik.isSubmitting) &&
                    'opacity-50 cursor-not-allowed'
                )}
                type='button'
                disabled={!hasDeliveredAligners || isConfirming || formik.isSubmitting}
                onClick={() => {
                  if (!hasDeliveredAligners || isConfirming || formik.isSubmitting) return
                  setIsConfirming(true)
                  void formik.submitForm().finally(() => {
                    setIsConfirming(false)
                  })
                }}
              >
                {'Confirm'}
              </button>
            </div>
          }
        >
          {/* Auto-sync end date based on start + days_to_wear_each_aligner */}
          <SyncEndDateWithStart daysToWear={treatmentPlan?.days_to_wear_each_aligner} />

          <When isTrue={isUpgradeModalOpen}>
            <UpgradePlanModal
              title='You’ve reached your patient limit'
              subTitle='To add more patients, please contact us to top up your limit.'
              onClose={() => setIsUpgradeModalOpen(false)}
            />
          </When>

          <div className='flex flex-col gap-3 p-5'>
            <div>
              <div className={clsx('md:text-2xl text-xl font-semibold')}>
                Confirm and start treatment?
              </div>
              <div className={clsx('text-base text-textColor ')}>
                This action is irreversible. Are you sure you want to continue?
              </div>
            </div>

            <FormikSelect
              name='currentAlignerNumber'
              label='Current Aligner'
              required={hasDeliveredAligners}
              disabled={!hasDeliveredAligners}
              placeholder={
                hasDeliveredAligners ? 'Select current aligner' : 'No delivered aligners yet'
              }
              options={deliveredAlignerOptions} // <-- delivered-only
            />

            <FormikDatePicker
              {...{
                name: 'startDate',
                label: 'Current Aligner Start date',
                className: ' py-3',
                required: true,
                format: 'DD-MM-YYYY',
              }}
            />
            <FormikDatePicker
              {...{
                name: 'endDate',
                label: 'Current Aligner End date',
                className: ' py-3',
                required: true,
                format: 'DD-MM-YYYY',
              }}
            />
          </div>
        </Modal>
      )}
    </Formik>
  )
}

export default ConfirmStartTreatmentModal
