import React, {useContext, useMemo, useState, useEffect} from 'react'
import {Formik, Form, useFormikContext} from 'formik'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import moment from 'moment'
import {useNavigate, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'

import trackingTypes from '@constants/trackingTypes'
import userTypes from '@constants/userTypes'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'

import useDispatchAction from '@hooks/useDispatchAction'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'

import FormikSelect from 'components/atom/Inputs/FormikSelect'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import When from 'components/when/When'
import UpgradePlanModal from 'components/subscription/modals/UpgradePlanModal'
import {Modal} from 'antd'
import useProfileBasePath from '@hooks/useProfileBasePath'

import {RootState} from 'redux/store'
import {postTrackingDetails} from 'redux/Slices/AppSlice/LeadsProfile/Tracking.slice'
import {getApiLeadsOverview} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import {getTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'

import {AuthContext} from 'context/AuthContext'
import {ApiGetData, arrayOfAligners, safeParseInt} from 'utils/ConstFunctions'
import extractMaxMinValuesFromJawRanges from 'screens/Patients/LeadsProfile/main/treatment/Tracking/helpers/extractMaxMinValuesFromJawRanges'
import isPlanExpired from '@utils/isPlanExpired'
import getSubscriptionAlerts from '@utils/getSubscriptionAlerts'
import hasValue from 'utils/hasValue'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import Footer from '../components/Footer'

type StartTreatmentStepProps = {
  onFinish: () => void
  treatmentType?: 'ALIGNER' | 'ORTHO'
  patientIdProp?: number
}

type FormValues = {
  trackingSelectTypes: string
  currentAlignerNumber: string
  startDate: string
  endDate: string
}

/** Validation helpers (same as modal) */
const baseDateValidationShape = {
  startDate: Yup.date().required('Please select a value in Current Aligner Start Date'),
  endDate: Yup.date()
    .required('Please select a value in Current Aligner End Date')
    .min(Yup.ref('startDate'), 'End date must be later than start date'),
}

const buildSchema = (minCurrentAligner: number, maxCurrentAligner: number) =>
  Yup.object().shape({
    trackingSelectTypes: Yup.string().required('Please select a tracking method'),
    currentAlignerNumber: Yup.number()
      .required('Please select a value in Current Aligner Number')
      .min(
        minCurrentAligner,
        `Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`
      )
      .max(
        maxCurrentAligner,
        `Please select a value from ${minCurrentAligner} to ${maxCurrentAligner}`
      ),
    ...baseDateValidationShape,
  })

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
  }, [values.startDate, daysToWear, setFieldValue])

  return null
}

const StartTreatmentStep: React.FC<StartTreatmentStepProps> = ({onFinish, patientIdProp}) => {
  const {patientId: patientIdFromParams} = useParams()
  // Use patientIdProp if provided (for resuming), otherwise use params
  const patientId = patientIdProp?.toString() || patientIdFromParams
  const {userId} = useContext(AuthContext)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {dispatchAction} = useDispatchAction()
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [pendingFormValues, setPendingFormValues] = useState<FormValues | null>(null)

  const {treatmentPlan, treatmentPlanList} = useSelector(
    (state: RootState) => state.leadsProfileTreatmentPlanReducer
  )
  const [confirming, setConfirming] = useState(false)

  // Fetch the latest treatment plan data when component mounts
  useEffect(() => {
    if (treatmentPlan?.treatment_plan_id) {
      dispatchAction(
        getTreatmentPlan({
          aligner_treatment_id: String(treatmentPlan.treatment_plan_id),
        })
      )
    }
  }, [treatmentPlan?.treatment_plan_id, dispatchAction])

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

  /** Options limited to delivered aligners only */
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

  /** Validation schema (same rules as modal) */
  const validationSchema = useMemo(() => {
    if (!hasDeliveredAligners) {
      return Yup.object().shape({
        currentAlignerNumber: Yup.mixed().nullable(),
        ...baseDateValidationShape,
      })
    }
    const minValue = minSelectableAligner ?? minCurrentAligner ?? 1
    const maxValue = maxSelectableAligner ?? maxCurrentAligner ?? minValue
    return buildSchema(minValue, maxValue)
  }, [
    hasDeliveredAligners,
    minSelectableAligner,
    maxSelectableAligner,
    minCurrentAligner,
    maxCurrentAligner,
  ])

  /** Subscription checks (same as modal) */
  const {subscriptionData} = useSubscriptionDetails()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const subscriptionAlerts = getSubscriptionAlerts({subscriptionData})

  const hasDeactivatedPlan =
    treatmentPlanList &&
    treatmentPlanList.some(
      (item) =>
        item.status === treatmentPlanStatusConstants.DEACTIVATED &&
        hasValue(item.aligner_journey_id)
    )

  // Calculate initial end date based on start date + days to wear
  const initialStartDate = dayjs().format('YYYY-MM-DD')
  const daysToWear = treatmentPlan?.days_to_wear_each_aligner || 0
  const initialEndDate =
    Number.isFinite(Number(daysToWear)) && daysToWear > 0
      ? moment(initialStartDate).add(Number(daysToWear), 'days').format('YYYY-MM-DD')
      : ''

  const handleConfirm = async () => {
    if (!treatmentPlan || !pendingFormValues || confirming) return
    setConfirming(true)

    if (isPlanExpired(subscriptionData) || subscriptionAlerts.patients.error) {
      setIsConfirmModalOpen(false)
      setIsUpgradeModalOpen(true)
      setConfirming(false)
      return
    }

    const payload = {
      tracking_type: trackingTypes.PATIENTAPP,
      current_aligner_details: {
        number: String(pendingFormValues.currentAlignerNumber),
        start_date: dayjs(pendingFormValues?.startDate).format('YYYY-MM-DD'),
        end_date: dayjs(pendingFormValues?.endDate).format('YYYY-MM-DD'),
      },
      user_type: userTypes.DOCTOR,
      pricing: 0,
      status: 'ACTIVE',
      aligner_treatment_plan_id: safeParseInt(treatmentPlan?.treatment_plan_id),
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

      setIsConfirmModalOpen(false)
      navigate(`${profileBasePath}/${patientId}/starting-treatment`)
      onFinish()
    } catch {
      setIsConfirmModalOpen(false)
      ErrorToast('Something went wrong')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <>
      <Modal
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}
        footer={null}
        centered
        closable={false}
        width={500}
      >
        <div className='p-4'>
          <h2 className='text-xl font-semibold text-center mb-3'>Confirm and add patient?</h2>
          <p className='text-center text-textColor text-sm mb-6'>
            You're about to add this patient with all the details entered so far. Once added, the
            details will no longer be editable. Confirm and add patient?
          </p>
          <div className='flex gap-3'>
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              className='flex-1 py-3 px-6 rounded-lg border border-primaryColor text-primaryColor bg-white font-semibold hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className='flex-1 py-3 px-6 rounded-lg bg-primaryColor text-white font-semibold disabled:opacity-70'
              disabled={confirming}
            >
              {confirming ? 'Confirming...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>

      <Formik<FormValues>
        initialValues={{
          trackingSelectTypes: trackingTypes.PATIENTAPP,
          currentAlignerNumber: defaultAlignerValue,
          startDate: initialStartDate,
          endDate: initialEndDate,
        }}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values) => {
          // Show confirmation modal instead of submitting directly
          setPendingFormValues(values)
          setIsConfirmModalOpen(true)
        }}
      >
        {(formik) => (
          // 👇 make the form a full-height flex column so footer can sit at bottom
          <Form className='w-full flex flex-col h-full md:w-1/2'>
            {/* Auto sync end date */}
            <SyncEndDateWithStart daysToWear={treatmentPlan?.days_to_wear_each_aligner} />
            <When isTrue={isUpgradeModalOpen}>
              <UpgradePlanModal
                title="You've reached your patient limit"
                subTitle='To add more patients, please contact us to top up your limit.'
                onClose={() => setIsUpgradeModalOpen(false)}
              />
            </When>
            {/* Page content */}
            <div className='flex-1 overflow-auto px-4 md:px-8 pt-6 md:pt-8 pb-6'>
              <h2 className='text-2xl font-semibold mb-6'>Start treatment</h2>

              <div className='w-full md:max-w-md flex flex-col gap-4'>
                <FormikSelect
                  className='!h-10'
                  name='currentAlignerNumber'
                  label='Current Aligner'
                  required={hasDeliveredAligners}
                  disabled={!hasDeliveredAligners}
                  placeholder={
                    hasDeliveredAligners ? 'Select current aligner' : 'No delivered aligners yet'
                  }
                  options={deliveredAlignerOptions}
                />

                <FormikDatePicker
                  {...{
                    name: 'startDate',
                    label: 'Current Aligner Start date',
                    className: 'py-3',
                    required: true,
                    format: 'DD-MMM-YYYY',
                  }}
                />

                <FormikDatePicker
                  {...{
                    name: 'endDate',
                    label: 'Current Aligner End date',
                    className: 'py-3',
                    required: true,
                    format: 'DD-MMM-YYYY',
                  }}
                />
              </div>
            </div>
            {/* Footer pinned to bottom */}

            <Footer
              showBack={false}
              disableNext={!hasDeliveredAligners}
              onNext={() => formik.handleSubmit()}
            />
          </Form>
        )}
      </Formik>
    </>
  )
}

export default StartTreatmentStep
