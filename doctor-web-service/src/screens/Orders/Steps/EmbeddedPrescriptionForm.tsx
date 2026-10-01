import Page from 'components/page/Page'
import {Formik} from 'formik'
import {useSelector} from 'react-redux'
import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {safeParseInt} from 'utils/ConstFunctions'
import useDispatchAction from '@hooks/useDispatchAction'
import {validate} from './helpers/validationDynamic'
import getBrandConfig from 'utils/getBrandConfig'
import {
  getApiDataPrescription,
  postApiDataPrescriptionAdd,
  resetPrescriptionState,
  updatePrescription,
} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import {RootState} from 'redux/store'
import type {PrescriptionData} from 'redux/Slices/AppSlice/Prescription/Prescription.slice'
import {useNavigate} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {createOrder, nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import userOrderDetails from '../hooks/userOrderDetails'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import {postApiLeadsProfileDetailsUpdate} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import {getPatientDetails} from 'redux/Slices/AppSlice/Profile/Profile.slice'
import {logToConsole} from '@utils/logToConsole'
import {getEnvVariable, sanitizeBaseUrl} from 'utils/envUtils'

const brandConfig = getBrandConfig()
const DEFAULT_FORM_ID = brandConfig.formId
const BRACES_FORM_ID = brandConfig.bracesFormId
const brand = brandConfig.brand.toLowerCase().replace(/\s+/g, '')
const fallbackFormEnvType = process.env.REACT_APP_FORM_ENV_TYPE
const form_env_type =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'development'
    : fallbackFormEnvType
const FORM_BUILDER_URL = sanitizeBaseUrl(getEnvVariable('REACT_APP_FORM_BUILDER_URL'))
const targetOrigin = FORM_BUILDER_URL ? new URL(FORM_BUILDER_URL).origin : ''

function getInitialPrescriptionValues(
  prescriptionData?: PrescriptionData | null,
  defaultFormId: string = ''
) {
  if (!prescriptionData) {
    return {
      chief_complaint: '',
      treatment_needed: null,
      do_not_move_the_following_tooth: null,
      midline: null,
      attachments: null,
      inter_proximal_reduction: null,
      extraction: null,
      notes: null,
      midline_instructions: null,
      attachments_tooth_selected: null,
      extraction_tooth_selected: null,
      treatment_needed_for_tooth: null,
      do_not_move_the_following_selected_tooth: null,
      data: {},
      form_id: defaultFormId,
      patient_id: 0,
    }
  }
  return {
    chief_complaint: prescriptionData.chief_complaint ?? '',
    treatment_needed: prescriptionData.treatment_needed ?? null,
    do_not_move_the_following_tooth: prescriptionData.do_not_move_the_following_tooth ?? null,
    midline: prescriptionData.midline ?? null,
    attachments: prescriptionData.attachments ?? null,
    inter_proximal_reduction: prescriptionData.inter_proximal_reduction ?? null,
    extraction: prescriptionData.extraction ?? null,
    notes: prescriptionData.notes ?? null,
    midline_instructions: prescriptionData.midline_instructions ?? null,
    attachments_tooth_selected: prescriptionData.attachments_tooth_selected ?? null,
    extraction_tooth_selected: prescriptionData.extraction_tooth_selected ?? null,
    treatment_needed_for_tooth: prescriptionData.treatment_needed_for_tooth ?? null,
    do_not_move_the_following_selected_tooth:
      prescriptionData.do_not_move_the_following_selected_tooth ?? null,
    data: prescriptionData.data ?? {},
    form_id: prescriptionData.form_id ?? '',
    patient_id: prescriptionData.patient_id ?? 0,
  }
}

type EmbeddedPrescriptionFormProps = {
  setSubmitForm?: (fn: () => void) => void
  patientId: string
  prescriptionId?: number | null
  mode?: 'add' | 'edit' | 'view'
  onSuccess?: (prescriptionId?: number) => void
  orderId?: string
  iframeClassName?: string
  template?: 'ALIGNER' | 'ORTHO'
  /** Pass prescription data directly to avoid shared Redux state issues when rendering multiple instances */
  initialData?: PrescriptionData | null
}

export const EmbeddedPrescriptionForm = ({
  setSubmitForm,
  patientId,
  prescriptionId,
  mode = 'add',
  onSuccess,
  orderId,
  iframeClassName = 'block w-full min-h-[900px] border-0',
  template = 'ALIGNER',
  initialData,
}: EmbeddedPrescriptionFormProps) => {
  const {dispatchAction} = useDispatchAction()
  const {prescriptionData: reduxPrescriptionData, getLoading} = useSelector(
    (state: RootState) => state.apiPrescription
  )
  // Use initialData prop if provided (for multi-instance rendering), otherwise fall back to shared Redux state
  const prescriptionData = initialData !== undefined ? initialData : reduxPrescriptionData
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const [data, setData] = useState<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const formikRef = useRef<any>(null)
  const {order} = userOrderDetails()
  const {userId, profileId} = useContext(AuthContext)
  const isEditMode = mode === 'edit'
  const isViewMode = mode === 'view'
  const resolvedFormId = useMemo(() => {
    if (prescriptionData?.form_id) return prescriptionData.form_id
    if (template === 'ORTHO') return BRACES_FORM_ID
    return DEFAULT_FORM_ID
  }, [prescriptionData?.form_id, template])
  const embedUrl = useMemo(
    () =>
      FORM_BUILDER_URL
        ? `${FORM_BUILDER_URL}/embed/${resolvedFormId}/${form_env_type}/${brand}`
        : '',
    [resolvedFormId]
  )
  const isBracesForm = useMemo(
    () => template === 'ORTHO' || resolvedFormId === BRACES_FORM_ID,
    [template, resolvedFormId]
  )

  // Fetch prescription details when in edit or view mode (skip if initialData is provided)
  useEffect(() => {
    if (initialData !== undefined) return
    if (prescriptionId && (isEditMode || isViewMode)) {
      dispatchAction(getApiDataPrescription(prescriptionId))
    }
  }, [dispatchAction, prescriptionId, isEditMode, isViewMode, initialData])

  // Clear any previously loaded prescription when switching to add mode
  useEffect(() => {
    if (mode === 'add') {
      dispatchAction(resetPrescriptionState())
      setData(null)
    }
  }, [mode, dispatchAction])

  // On iframe load → send prefill or summary data
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const postViewData = () => {
      if (!prescriptionData?.data) return

      iframe.contentWindow?.postMessage(
        {
          type: isViewMode
            ? 'SummaryFormData'
            : isEditMode
              ? 'SET_FORM_DATA_WITH_VALUE'
              : 'SET_FORM_DATA',
          data: prescriptionData.data,
        },
        targetOrigin
      )
    }

    const onLoad = () => {
      // Safari needs delay
      setTimeout(() => postViewData(), 300)
    }

    iframe.addEventListener('load', onLoad)

    // SAFARI FIX: If iframe is already loaded before listener attaches
    if (iframe.contentDocument?.readyState === 'complete') {
      setTimeout(() => postViewData(), 300)
    }

    return () => iframe.removeEventListener('load', onLoad)
  }, [prescriptionData, isViewMode, isEditMode])

  // Listen for data updates from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== targetOrigin) return
      if (e.data?.type === 'FORM_DATA_UPDATED') {
        logToConsole('[EmbeddedPrescriptionForm] iframe data received:', e.data.data)
        setData(e.data.data)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <Page loading={getLoading} exitConfirmPredicate={false} containerClassName='h-full'>
      <Formik
        innerRef={formikRef}
        initialValues={getInitialPrescriptionValues(prescriptionData, resolvedFormId)}
        enableReinitialize
        onSubmit={async () => {
          if (!patientId || isViewMode) return
          // :white_check_mark: prepare payload in correct shape
          const payload = {
            data: {
              ...(data || {}), // dynamic form fields from iframe
              isBracesForm: isBracesForm,
            },
            form_id: resolvedFormId,
            patient_id: safeParseInt(patientId),
          }

          if (isEditMode && !!prescriptionId) {
            await dispatchAction(updatePrescription({data: payload, prescriptionId}))
              .unwrap()
              .then(() => {
                if (hasValue(orderId)) {
                  navigate(`${profileBasePath}/${patientId}/details/prescriptions`)
                  onSuccess?.(prescriptionId)
                } else {
                  onSuccess?.(prescriptionId)
                }
              })
            return
          }
          await dispatchAction(postApiDataPrescriptionAdd({data: payload}))
            .unwrap()
            .then(async (res: any) => {
              const createdPrescriptionIdValue =
                res?.prescription_id ?? res?.id ?? res?.data?.prescription_id ?? res?.data?.id
              const createdPrescriptionId = createdPrescriptionIdValue
                ? safeParseInt(createdPrescriptionIdValue)
                : undefined

              if (hasValue(orderId) && order) {
                if (onSuccess) {
                  onSuccess(createdPrescriptionId)
                  return
                }

                await dispatchAction(
                  createOrder({
                    order_id: order?.order_id,
                    status: order?.status,
                    patient_id: order?.patient_details?.id,
                    prescription_details: {
                      id: createdPrescriptionId,
                    },
                    doctor_id: safeParseInt(userId),
                    profile_id: safeParseInt(profileId),
                    practice_doctor_id: safeParseInt(order?.doctor_id),
                    practice_profile_id: safeParseInt(order?.profile_id),
                    practice_organization_id: safeParseInt(order?.organization_id),
                  })
                )
                  .unwrap()
                  .then(() => dispatchAction(nextStep()))
                return
              }
              dispatchAction(getPatientDetails({patientId: safeParseInt(patientId)}))
                .unwrap()
                .then((res: any) => {
                  const postData = {
                    data: {
                      first_name: res.first_name,
                      last_name: res.last_name,
                      email: res.email !== '' ? res.email?.toLocaleLowerCase() : null,
                      mobile: res.mobile !== '' ? res.mobile : null,
                      country_code: res.country_code,
                      practice_location:
                        res.practice_location !== '' ? res.practice_location : null,
                      inviter_id: userId,
                      inviter_user_type: userTypes.DOCTOR,
                      customer_mapped_id: res.customer_mapped_id.trim(),
                      age: res.age,
                      gender: res.gender,
                      practice_location_id: null,
                      country: res.country,
                      state: res.state,
                      city: res.city,
                      practice_profile_id: profileId,
                      practice_invite_code: null,
                      current_step: 5,
                      patient_id: patientId,
                    },
                  }
                  dispatchAction(postApiLeadsProfileDetailsUpdate(postData as any))
                    .unwrap()
                    .then(() => {
                      dispatchAction(nextStep())
                    })
                })
              // Only navigate if onSuccess is not provided (standalone usage)
              // If onSuccess exists, the parent (stepper/modal) handles navigation
              if (onSuccess) {
                onSuccess(createdPrescriptionId)
              } else {
                navigate(`${profileBasePath}/${patientId}/details/prescriptions`)
              }
            })
        }}
      >
        {(formik) => {
          // Expose submit logic for add/edit only
          useEffect(() => {
            if (setSubmitForm && !isViewMode) {
              setSubmitForm(() => () => {
                const errors = validate(data || {}, {showToast: true})
                if (Object.values(errors).length > 0) {
                  iframeRef.current?.contentWindow?.postMessage(
                    {type: 'ValidationError', errors},
                    targetOrigin
                  )
                } else if (!hasValue(data)) {
                  return
                } else {
                  formik.handleSubmit()
                }
              })
            }
          }, [setSubmitForm, data, isViewMode, formik])

          if (!embedUrl) {
            return (
              <div className='flex items-center justify-center h-full text-red-500'>
                Configuration Error: Prescription form builder URL is missing.
              </div>
            )
          }

          return (
            <iframe
              src={embedUrl}
              width='100%'
              className={iframeClassName}
              ref={iframeRef}
              title='Embedded Form'
            />
          )
        }}
      </Formik>
    </Page>
  )
}
