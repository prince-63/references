import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import dayjs from 'dayjs'
import {Formik} from 'formik'
import {message} from 'antd'
import {useSelector} from 'react-redux'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import Page from 'components/page/Page'
import When from 'components/when/When'
import useDispatchAction from '@hooks/useDispatchAction'
import {safeParseInt} from 'utils/ConstFunctions'
import {RootState} from 'redux/store'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {AuthContext} from 'context/AuthContext'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import {
  getVspCaseRecordsByPatient,
  resetGetVspCaseRecordsByPatientState,
} from 'redux/Slices/AppSlice/VSP/caserecord.slice'
import {createVspOrder} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {useVspOrder} from '../hooks/useVspOrder'
import {VspCaseRecordsForm} from './VspCaseRecordForm'
import VSPFooter from './VSPFooter'
import ExternalLinkConfirmationModal from './ExternalLinkConfirmationModal'

const ADD_CASE_RECORD_OPTION_VALUE = '__ADD_CASE_FILES__'

type SelectorValues = {
  case_record: string | number | null
}

const getLatestCaseRecordId = (
  records: {id?: number; created_at?: string}[] | null | undefined
) => {
  if (!records || records.length === 0) return null

  const latestRecord = [...records].sort((a, b) => {
    const dateA = a.created_at && dayjs(a.created_at).isValid() ? dayjs(a.created_at).valueOf() : 0
    const dateB = b.created_at && dayjs(b.created_at).isValid() ? dayjs(b.created_at).valueOf() : 0
    return dateB - dateA
  })[0]

  return safeParseInt(latestRecord?.id) || null
}

export const VspCaseFilesSelector: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const patientIdFromParams = searchParams.get('patient_id')
  const {vspOrderDetails, orderId: routeOrderId} = useVspOrder(true)
  const {profileId, userId} = React.useContext(AuthContext)
  const {isEnterprisePlanUser} = useAllUserPlan()
  const {planningProductSelected} = useSelector((state: RootState) => state.productionSetup)
  const {data: patientDetails} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const assignedPractice = patientDetails?.patient_details?.assigned_practice
  const {vspCaseRecordsByPatient, getVspCaseRecordsByPatientLoading} = useSelector(
    (state: RootState) => state.vspCaseRecord
  )
  const existingOrderId = String(vspOrderDetails?.order_id ?? routeOrderId ?? '').trim()

  const [showAddForm, setShowAddForm] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState(existingOrderId)
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingCaseRecord, setIsSavingCaseRecord] = useState(false)
  const [externalLinks, setExternalLinks] = useState<string[]>([])
  const [showExternalLinkConfirmModal, setShowExternalLinkConfirmModal] = useState(false)
  const submitRef = useRef<(() => Promise<boolean>) | null>(null)
  const confirmActionRef = useRef<(() => void | Promise<void>) | null>(null)

  useEffect(() => {
    if (existingOrderId && !currentOrderId) {
      setCurrentOrderId(existingOrderId)
    }
  }, [existingOrderId, currentOrderId])

  const resolvedPatientId = safeParseInt(patientIdFromParams)

  const getNextButtonText = () => {
    if (isUploading) return 'Uploading files...'
    if (isSavingCaseRecord) return 'Saving case files...'
    return 'Save & continue'
  }

  useEffect(() => {
    if (!resolvedPatientId) return
    dispatchAction(getVspCaseRecordsByPatient({patient_id: resolvedPatientId}))
    dispatchAction(
      getLeadsProfileDetails({
        patient_id: resolvedPatientId,
        doctor_id: safeParseInt(userId),
      } as any)
    )
    return () => {
      dispatchAction(resetGetVspCaseRecordsByPatientState())
    }
  }, [dispatchAction, resolvedPatientId, userId])

  const caseRecordOptions = useMemo(
    () => [
      {value: ADD_CASE_RECORD_OPTION_VALUE, label: 'Add Case Files'},
      ...((vspCaseRecordsByPatient ?? []).map((record, index) => ({
        value: record.id,
        label: `Case Record #${index + 1}${
          record?.created_at && dayjs(record.created_at).isValid()
            ? ` (${dayjs(record.created_at).format('DD-MMM-YYYY, hh:mm A')})`
            : ''
        }`,
      })) || []),
    ],
    [vspCaseRecordsByPatient]
  )

  const latestCaseRecordId = useMemo(() => {
    return getLatestCaseRecordId(vspCaseRecordsByPatient)
  }, [vspCaseRecordsByPatient])

  const ensureDraftOrder = useCallback(async () => {
    if (currentOrderId) return currentOrderId

    const patient_id = resolvedPatientId
    const service_product_id = safeParseInt(vspOrderDetails?.service_product_id)
    if (!patient_id || !service_product_id) {
      message.error('Order details missing. Please complete Order Details first.')
      return ''
    }

    const receiverProfileId = isEnterprisePlanUser
      ? safeParseInt(planningProductSelected?.profile_id) || safeParseInt(profileId)
      : safeParseInt(planningProductSelected?.profile_id)

    const senderProfileId = isEnterprisePlanUser
      ? safeParseInt(assignedPractice?.practice_profile_id) || safeParseInt(profileId)
      : safeParseInt(profileId)

    const createdOrder = await dispatchAction(
      createVspOrder({
        patient_id,
        service_product_id,
        oral_surgeon_name: vspOrderDetails?.oral_surgeon_name,
        orthodontist_name: vspOrderDetails?.orthodontist_name,
        status: 'DRAFT',
        receiver_profile_id: receiverProfileId > 0 ? receiverProfileId : undefined,
        sender_profile_id: senderProfileId > 0 ? senderProfileId : undefined,
      })
    ).unwrap()

    const createdOrderId = String(createdOrder?.order_id ?? '').trim()
    if (createdOrderId) {
      setCurrentOrderId(createdOrderId)
      navigate(`/vsp/create-order/${createdOrderId}?patient_id=${patientIdFromParams}`, {
        replace: true,
      })
    }
    return createdOrderId
  }, [currentOrderId, dispatchAction, resolvedPatientId, vspOrderDetails])

  const attachSubmit = (fn: () => Promise<boolean>) => {
    submitRef.current = fn
  }

  const handleSubmitCaseRecord = async () => {
    if (!submitRef.current) return
    if (isUploading || isSavingCaseRecord) return
    setIsSavingCaseRecord(true)
    try {
      await submitRef.current()
    } finally {
      setIsSavingCaseRecord(false)
    }
  }

  const handleCaseRecordNext = async () => {
    if (isUploading || isSavingCaseRecord) return

    if (externalLinks.length > 0) {
      confirmActionRef.current = async () => {
        if (!currentOrderId) {
          const ensuredOrderId = await ensureDraftOrder()
          if (!ensuredOrderId) return
        }

        await handleSubmitCaseRecord()
      }
      setShowExternalLinkConfirmModal(true)
      return
    }

    if (!currentOrderId) {
      const ensuredOrderId = await ensureDraftOrder()
      if (!ensuredOrderId) return
    }

    await handleSubmitCaseRecord()
  }

  const handleConfirmCaseRecordSave = async () => {
    setShowExternalLinkConfirmModal(false)
    await confirmActionRef.current?.()
    confirmActionRef.current = null
  }

  const noCaseRecords =
    !getVspCaseRecordsByPatientLoading && (vspCaseRecordsByPatient?.length ?? 0) === 0

  return (
    <Page loading={getVspCaseRecordsByPatientLoading}>
      <When isTrue={!showAddForm && !noCaseRecords}>
        <Formik<SelectorValues>
          enableReinitialize
          initialValues={{
            case_record: latestCaseRecordId || null,
          }}
          onSubmit={async (values) => {
            try {
              if (!values.case_record || values.case_record === ADD_CASE_RECORD_OPTION_VALUE) {
                setShowAddForm(true)
                return
              }

              const resolvedOrderId = await ensureDraftOrder()
              if (!resolvedOrderId) return
              await handleSubmitCaseRecord()
            } catch (error: any) {
              message.error(
                error?.status?.message ?? error?.message ?? 'Unable to save case files.'
              )
            }
          }}
        >
          {({handleSubmit, values}) => {
            const selectedCaseRecordId =
              values.case_record && values.case_record !== ADD_CASE_RECORD_OPTION_VALUE
                ? safeParseInt(values.case_record)
                : undefined

            return (
              <div className='flex flex-col gap-2'>
                <FormikSelectList
                  name='case_record'
                  items={caseRecordOptions}
                  label='Select Case Record'
                  placeholder={
                    getVspCaseRecordsByPatientLoading ? 'Loading...' : 'Select a case record'
                  }
                  disabled={getVspCaseRecordsByPatientLoading}
                  allowClear
                  onChangeMapperFunc={(value) => value}
                  onChangeSuccess={(selected) => {
                    if (selected?.value === ADD_CASE_RECORD_OPTION_VALUE) {
                      setShowAddForm(true)
                    } else {
                      setShowAddForm(false)
                    }
                  }}
                />

                <VspCaseRecordsForm
                  patientId={resolvedPatientId || undefined}
                  caseRecordId={selectedCaseRecordId}
                  isEditMode
                  hideSectionHeader
                  hideChiefComplaint
                  orderId={currentOrderId || undefined}
                  onSubmitRef={attachSubmit}
                  onUploadingChange={setIsUploading}
                  onExternalLinksChange={setExternalLinks}
                />

                <VSPFooter
                  onNext={() => {
                    if (isUploading || isSavingCaseRecord) return
                    if (
                      externalLinks.length > 0 &&
                      values.case_record !== ADD_CASE_RECORD_OPTION_VALUE
                    ) {
                      confirmActionRef.current = async () => {
                        handleSubmit()
                      }
                      setShowExternalLinkConfirmModal(true)
                      return
                    }
                    handleSubmit()
                  }}
                  nextButtonText={getNextButtonText()}
                  disableNext={isUploading || isSavingCaseRecord}
                  loadingNext={isUploading || isSavingCaseRecord}
                />
              </div>
            )
          }}
        </Formik>
      </When>

      <When isTrue={showAddForm || noCaseRecords}>
        <Formik initialValues={{case_record: null}} onSubmit={() => undefined}>
          {() => (
            <>
              <VspCaseRecordsForm
                patientId={resolvedPatientId || undefined}
                isEditMode
                hideSectionHeader
                hideChiefComplaint
                orderId={currentOrderId || undefined}
                onSubmitRef={attachSubmit}
                onUploadingChange={setIsUploading}
                onExternalLinksChange={setExternalLinks}
              />

              <VSPFooter
                onNext={handleCaseRecordNext}
                nextButtonText={getNextButtonText()}
                disableNext={isUploading || isSavingCaseRecord}
                loadingNext={isUploading || isSavingCaseRecord}
              />
            </>
          )}
        </Formik>
      </When>

      <ExternalLinkConfirmationModal
        open={showExternalLinkConfirmModal}
        title='Confirm send'
        confirmText='Confirm'
        loading={isSavingCaseRecord}
        onCancel={() => {
          confirmActionRef.current = null
          setShowExternalLinkConfirmModal(false)
        }}
        onConfirm={handleConfirmCaseRecordSave}
      />
    </Page>
  )
}
