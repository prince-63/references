import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {Formik} from 'formik'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import Page from 'components/page/Page'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import useCreateOrder from '@hooks/useCreateOrder'
import FooterRedesigned from '../components/FooterRedesigned'
import {
  getOrderDetails,
  nextStep,
  updateCurrentStep,
} from 'redux/Slices/AppSlice/orders/orders.slice'
import {EmbeddedPrescriptionForm} from './EmbeddedPrescriptionForm'
import {
  getApiDataPrescriptionByPatient,
  resetPrescriptionState,
  type PrescriptionData,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import When from 'components/when/When'
import {useSearchParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'

export const PrescriptionSelector: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const {prescriptionsByPatient, getByPatientLoading, postLoading} = useSelector(
    (state: RootState) => state.apiPrescription
  )
  const {userId, profileId} = useContext(AuthContext)
  const {handleCreateOrder} = useCreateOrder()
  const [forceNoPrescriptions, setForceNoPrescriptions] = useState(false)
  const {order, creatingOrder} = useSelector((state: RootState) => state.orders)
  const orderId = order?.order_id
  const prescriptionIdFromOrder = order?.prescription_id
  const patientId = order?.patient_details?.id
  const [submitForm, setSubmitForm] = useState<(() => void) | null>(null)
  const [isNextLocked, setIsNextLocked] = useState(false)
  const [isRefreshingOrder, setIsRefreshingOrder] = useState(false)
  const nextLockTimeoutRef = useRef<number | null>(null)
  const nextLockStartRef = useRef<number | null>(null)
  const [searchParams] = useSearchParams()
  const rawCustomFlow = searchParams.get('customFlow')
  const customFlow = rawCustomFlow === 'true'
  const isRefinement = searchParams.get('refinement') === 'true'
  const isRefinementDraft = searchParams.get('refinement-draft') === 'true'
  const responsiveIframeClass = 'block w-full border-0 min-h-[900px]'
  const addPrescriptionOptionValue = '__ADD_PRESCRIPTION__'
  const addPrescriptionLabel = 'Create New Prescription'

  useEffect(() => {
    if (isRefinementDraft && orderId && patientId) {
      dispatchAction(getApiDataPrescriptionByPatient({patientId: patientId, orderId: orderId}))
    } else if (patientId) {
      dispatchAction(getApiDataPrescriptionByPatient({patientId: patientId}))
    }
  }, [patientId, dispatchAction, orderId, isRefinementDraft])

  useEffect(() => {
    return () => {
      if (nextLockTimeoutRef.current !== null) {
        window.clearTimeout(nextLockTimeoutRef.current)
      }
    }
  }, [])

  const handleNextClick = (action: () => void) => {
    if (isNextLocked || postLoading || creatingOrder || isRefreshingOrder) return
    setIsNextLocked(true)
    nextLockStartRef.current = Date.now()
    action()
  }

  useEffect(() => {
    if (!isNextLocked) return

    if (postLoading || creatingOrder || isRefreshingOrder) {
      if (nextLockTimeoutRef.current !== null) {
        window.clearTimeout(nextLockTimeoutRef.current)
        nextLockTimeoutRef.current = null
      }
      return
    }

    const startedAt = nextLockStartRef.current ?? Date.now()
    const elapsed = Date.now() - startedAt
    const remaining = Math.max(800 - elapsed, 0)

    if (nextLockTimeoutRef.current !== null) {
      window.clearTimeout(nextLockTimeoutRef.current)
    }
    nextLockTimeoutRef.current = window.setTimeout(() => {
      setIsNextLocked(false)
      nextLockTimeoutRef.current = null
    }, remaining)
  }, [postLoading, creatingOrder, isRefreshingOrder, isNextLocked])

  const getPrescriptionLabel = (record: PrescriptionData) => {
    const data = record?.data
    if (data) {
      const textFieldKey = Object.keys(data).find((key) => /text[-_]?field/i.test(key))
      const label = textFieldKey ? data[textFieldKey] : undefined
      if (typeof label === 'string' && label.trim()) return label
    }
    if (record?.prescription_id) return `Prescription`
    return 'Prescription'
  }

  const prescriptionOptions = [
    {value: addPrescriptionOptionValue, label: addPrescriptionLabel},
    ...(prescriptionsByPatient?.map((record) => ({
      value: record.prescription_id,
      label: `${getPrescriptionLabel(record)}${
        record?.created_at && dayjs(record.created_at).isValid()
          ? ` (${dayjs(record.created_at).format('DD-MMM-YYYY, hh:mm A')})`
          : ''
      }`,
    })) || []),
  ]

  const noPrescriptions = !prescriptionsByPatient || prescriptionsByPatient.length === 0
  const showNoPrescriptionsFlow = useMemo(() => {
    return noPrescriptions || forceNoPrescriptions || isRefinement
  }, [noPrescriptions, forceNoPrescriptions, isRefinement])

  const advanceToReviewStep = () => {
    customFlow ? dispatchAction(updateCurrentStep(5)) : dispatchAction(nextStep())
  }

  const refreshOrderDetails = async () => {
    if (!orderId) return

    setIsRefreshingOrder(true)
    try {
      await dispatchAction(
        getOrderDetails({
          doctor_id: safeParseInt(userId),
          order_id: orderId,
          updateLoadingState: false,
        })
      ).unwrap()
    } finally {
      setIsRefreshingOrder(false)
    }
  }

  const mapPrescriptionAndContinue = async (prescriptionId?: number | string | null) => {
    if (
      !prescriptionId ||
      !order?.order_id ||
      !order?.status ||
      !order?.patient_details?.id ||
      !order?.doctor_id
    ) {
      return
    }

    try {
      await handleCreateOrder({
        orderPayload: {
          prescription_details: {id: prescriptionId},
          order_id: order.order_id,
          status: order.status,
          patient_id: order.patient_details.id,
          doctor_id: safeParseInt(userId),
          profile_id: safeParseInt(profileId),
          practice_doctor_id: safeParseInt(order?.doctor_id),
          practice_profile_id: safeParseInt(order?.profile_id),
          practice_organization_id: safeParseInt(order?.organization_id),
        },
        product: order?.service_products ?? null,
        assignedCustomer: order?.patient_details ?? null,
      })
      await refreshOrderDetails()
      advanceToReviewStep()
    } catch (error) {
      console.error('Failed to map prescription to order', error)
    }
  }

  const handleAddPrescriptionSuccess = (newId?: number) => {
    void mapPrescriptionAndContinue(newId)
  }

  return (
    <div className='flex flex-col w-full min-h-full'>
      {/* ---------- PRESCRIPTIONS EXIST: SELECT + EDIT FLOW ---------- */}
      <When isTrue={!showNoPrescriptionsFlow}>
        <Page
          title='Select Prescription'
          loading={getByPatientLoading}
          containerClassName={'w-full pb-32'}
        >
          <Formik<{prescription?: number | string}>
            enableReinitialize
            initialValues={{prescription: prescriptionIdFromOrder ?? undefined}}
            onSubmit={(values) => {
              // Fallback mapping if user clicks Next without editing/saving inside iframe
              if (
                values.prescription === addPrescriptionOptionValue ||
                !values.prescription ||
                !order?.order_id ||
                !order?.status ||
                !order?.patient_details?.id ||
                !order?.doctor_id
              )
                return
              void mapPrescriptionAndContinue(values.prescription)
            }}
          >
            {({values, setFieldValue, handleSubmit}) => {
              const isAddSelected = values.prescription === addPrescriptionOptionValue
              const selectedPrescriptionId =
                typeof values.prescription === 'number' ? values.prescription : undefined
              return (
                <>
                  <FormikSelectList
                    name='prescription'
                    items={prescriptionOptions}
                    label='Prescription'
                    placeholder={getByPatientLoading ? 'Loading...' : 'Select a Prescription'}
                    disabled={getByPatientLoading}
                    allowClear
                    onChangeMapperFunc={(value) => value}
                    onChangeSuccess={(selectedItem) => {
                      if (selectedItem?.value === addPrescriptionOptionValue) {
                        setFieldValue('prescription', addPrescriptionOptionValue)
                        setForceNoPrescriptions(true)
                        dispatchAction(resetPrescriptionState())
                        return
                      }
                      setForceNoPrescriptions(false)
                      setFieldValue('prescription', selectedItem?.value)
                    }}
                  />

                  {/* If one is selected, open the embedded form in EDIT mode for that id */}
                  {!isAddSelected && selectedPrescriptionId && (
                    <EmbeddedPrescriptionForm
                      patientId={patientId?.toString() ?? ''}
                      mode='edit'
                      prescriptionId={selectedPrescriptionId}
                      setSubmitForm={setSubmitForm}
                      iframeClassName={responsiveIframeClass}
                      onSuccess={(updatedId?: number) => {
                        const idToMap = updatedId ?? selectedPrescriptionId
                        if (!idToMap) return
                        if (
                          !order?.order_id ||
                          !order?.status ||
                          !order?.patient_details?.id ||
                          !order?.doctor_id
                        )
                          return

                        void mapPrescriptionAndContinue(idToMap)
                      }}
                    />
                  )}

                  <FooterRedesigned
                    onNext={() => {
                      handleNextClick(() => {
                        if (isAddSelected) {
                          if (submitForm) submitForm()
                          return
                        }
                        if (submitForm) submitForm()
                        else handleSubmit()
                      })
                    }}
                    nextButtonText='Save & Continue'
                    loadingNext={isNextLocked || postLoading || isRefreshingOrder}
                  />
                </>
              )
            }}
          </Formik>
        </Page>
      </When>

      <When isTrue={showNoPrescriptionsFlow}>
        {/* ---------- NO PRESCRIPTIONS: ADD FLOW ---------- */}
        <Page loading={getByPatientLoading} containerClassName='w-full pb-32'>
          <EmbeddedPrescriptionForm
            patientId={patientId?.toString() ?? ''}
            mode='add'
            setSubmitForm={setSubmitForm}
            orderId={orderId}
            iframeClassName={responsiveIframeClass}
            onSuccess={handleAddPrescriptionSuccess}
          />
          <FooterRedesigned
            onNext={() => {
              handleNextClick(() => submitForm?.())
            }}
            nextButtonText='Save & Continue'
            loadingNext={isNextLocked || postLoading || isRefreshingOrder}
          />
        </Page>
      </When>
    </div>
  )
}
