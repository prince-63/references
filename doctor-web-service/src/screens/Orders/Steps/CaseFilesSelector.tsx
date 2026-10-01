import React, {useContext, useEffect, useMemo, useRef, useState} from 'react'
import dayjs from 'dayjs'
import {useSelector} from 'react-redux'
import {useSearchParams} from 'react-router-dom'
import {Formik} from 'formik'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import Page from 'components/page/Page'
import {
  getAllCaseRecord,
  resetCaseRecordState,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {CaseRecordsForm} from 'screens/CaseRecords/components'
import Footer from '../components/Footer'
import {nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import When from 'components/when/When'
import userOrderDetails from '../hooks/userOrderDetails'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {UploadFile, message} from 'antd'
import {APIPostData, CaseRecordResponse} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {useCreateCaseRecordAction} from 'screens/CaseRecords/hook'
import useCreateOrder from '@hooks/useCreateOrder'

export const CaseFilesSelector: React.FC = () => {
  const {dispatchAction} = useDispatchAction()
  const {createNewCaseRecord} = useCreateCaseRecordAction()
  const {handleCreateOrder} = useCreateOrder()
  const [hideAddButton, setHideButton] = useState<boolean>(false)
  const AddCaseRecordButtonText = 'Add Case Files'
  const [isUploading, setIsUploading] = useState(false)
  const [isSavingCaseRecord, setIsSavingCaseRecord] = useState(false)
  const [isFetchingCaseRecords, setIsFetchingCaseRecords] = useState(false)
  const isSubmittingRef = useRef(false)
  const {profileId, userId} = useContext(AuthContext)
  const [searchParams] = useSearchParams()
  const isRefinementFlow =
    searchParams.get('refinement') === 'true' || searchParams.get('refinement-draft') === 'true'
  const {allCaseRecords, loadingGetAll} = useSelector((state: RootState) => state.caseRecord)
  const caseRecords = useMemo(() => allCaseRecords ?? [], [allCaseRecords])
  const hasLoadedCaseRecords =
    !isFetchingCaseRecords && !loadingGetAll && Array.isArray(allCaseRecords)
  const noCaseRecords = hasLoadedCaseRecords && caseRecords.length === 0
  const {order} = userOrderDetails()
  const caseRecordIdFromOrder = safeParseInt(order?.case_record_id) || null
  const orderId = order?.order_id
  const patientId = order?.patient_details?.id
  const submitRef = useRef<(() => Promise<boolean>) | null>(null)
  const attachSubmit = (fn: () => Promise<boolean>) => {
    submitRef.current = fn
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [uploadedScanFiles, setUploadedScanFiles] = useState<UploadFile[]>([])
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<UploadFile[]>([])
  const addCaseRecordOptionValue = '__ADD_CASE_FILES__'
  const initialDropdownCaseRecordId = useMemo(() => {
    if (!caseRecordIdFromOrder) return null
    const hasOrderCaseRecord = caseRecords.some(
      (record) => safeParseInt(record.case_record_id) === caseRecordIdFromOrder
    )
    return hasOrderCaseRecord ? caseRecordIdFromOrder : null
  }, [caseRecordIdFromOrder, caseRecords])
  const getNextButtonText = () => {
    if (isUploading) return 'Uploading files...'
    if (isSavingCaseRecord) return 'Saving case files...'
    return 'Save & continue'
  }

  const extractNewFileIds = (files: UploadFile[]) =>
    files
      .filter((file) => typeof file.uid !== 'string')
      .map((file) => {
        if (typeof file.uid === 'number') return file.uid
        return safeParseInt(file.uid)
      })
      .filter((id) => !!id && !Number.isNaN(id))

  const handleSubmitCaseRecord = async () => {
    if (isUploading || isSavingCaseRecord || isSubmittingRef.current) return
    if (!submitRef.current) return
    isSubmittingRef.current = true
    setIsSavingCaseRecord(true)
    try {
      await submitRef.current()
    } finally {
      setIsSavingCaseRecord(false)
      isSubmittingRef.current = false
    }
  }

  const getCaseRecordById = (caseRecordId?: number | null): CaseRecordResponse | undefined =>
    caseRecords.find((record) => safeParseInt(record.case_record_id) === safeParseInt(caseRecordId))

  const saveSelectedCaseRecordAndContinue = async (selectedCaseRecordId?: number | null) => {
    if (
      !selectedCaseRecordId ||
      !order?.order_id ||
      !order?.status ||
      !order?.patient_details?.id ||
      !order?.doctor_id
    ) {
      return
    }

    try {
      const selectedCaseRecord = getCaseRecordById(selectedCaseRecordId)

      const requestBody: APIPostData = {
        chief_complaint: selectedCaseRecord?.chief_complaint ?? '',
        pre_treatment_file_ids: extractNewFileIds(uploadedFiles),
        scan_file_ids: extractNewFileIds(uploadedScanFiles),
        xray_file_ids: extractNewFileIds(uploadedXrayFiles),
        patient_id: safeParseInt(patientId),
        profile_id: safeParseInt(profileId),
        doctor_id: safeParseInt(userId),
        case_record_id: selectedCaseRecordId ?? null,
      }

      const caseRecordResponse = await createNewCaseRecord(requestBody)
      const resolvedCaseRecordId =
        safeParseInt(caseRecordResponse?.case_record_id) ||
        safeParseInt(caseRecordResponse?.case_record?.case_record_id) ||
        safeParseInt(caseRecordResponse?.case_record_details?.case_record_id) ||
        selectedCaseRecordId

      await handleCreateOrder({
        orderPayload: {
          case_record_id: resolvedCaseRecordId,
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
      dispatchAction(nextStep())
    } catch (error) {
      console.error('Failed to save case record before creating order', error)
      message.error('Unable to save case files. Please try again.')
    }
  }

  const submitSelectedCaseRecord = async (selectedCaseRecordId?: number | null) => {
    if (isUploading || isSavingCaseRecord || isSubmittingRef.current) return

    isSubmittingRef.current = true
    setIsSavingCaseRecord(true)
    try {
      await saveSelectedCaseRecordAndContinue(selectedCaseRecordId)
    } finally {
      setIsSavingCaseRecord(false)
      isSubmittingRef.current = false
    }
  }

  useEffect(() => {
    let isCurrentRequest = true

    const fetchCaseRecords = async () => {
      setHideButton(false)
      setUploadedFiles([])
      setUploadedScanFiles([])
      setUploadedXrayFiles([])
      setIsFetchingCaseRecords(true)

      dispatchAction(resetCaseRecordState())

      try {
        if (!patientId) return

        if (orderId) {
          const orderedCaseRecords = await dispatchAction(
            getAllCaseRecord({patient_id: patientId, orderId: orderId})
          ).unwrap()

          if (!isCurrentRequest) return

          if (
            Array.isArray(orderedCaseRecords) &&
            (orderedCaseRecords.length > 0 || isRefinementFlow)
          ) {
            return
          }
        }

        if (isRefinementFlow) return

        await dispatchAction(getAllCaseRecord({patient_id: patientId})).unwrap()
      } catch (error) {
        console.error('Failed to fetch case records', error)
      } finally {
        if (isCurrentRequest) {
          setIsFetchingCaseRecords(false)
        }
      }
    }

    fetchCaseRecords()

    return () => {
      isCurrentRequest = false
    }
  }, [dispatchAction, patientId, orderId, isRefinementFlow])

  const shouldShowAddForm = hideAddButton || (hasLoadedCaseRecords && noCaseRecords)
  const shouldShowDropdown = hasLoadedCaseRecords && caseRecords.length > 0 && !hideAddButton
  // Options for select dropdown
  const caseRecordOptions = caseRecords.map((record) => ({
    value: record.case_record_id,
    label: `Case Record #${record.case_record_id}${
      record?.created_at && dayjs(record.created_at).isValid()
        ? ` (${dayjs(record.created_at).format('DD-MMM-YYYY, hh:mm A')})`
        : ''
    }`,
  }))

  const caseRecordDropdownOptions = [
    {value: addCaseRecordOptionValue, label: AddCaseRecordButtonText},
    ...caseRecordOptions,
  ]

  return (
    <Page loading={loadingGetAll || isFetchingCaseRecords} containerClassName='min-h-full'>
      <When isTrue={shouldShowDropdown}>
        <Formik
          enableReinitialize
          initialValues={{case_record: initialDropdownCaseRecordId}}
          onSubmit={async (values) => {
            await submitSelectedCaseRecord(safeParseInt(values.case_record) || null)
          }}
        >
          {({values, handleSubmit}) => {
            const selectedCaseRecordId = safeParseInt(values.case_record)
            const hasSelectedCaseRecord = selectedCaseRecordId > 0

            return (
              <>
                <FormikSelectList
                  name='case_record'
                  items={caseRecordDropdownOptions}
                  label='Select Case Record'
                  placeholder={loadingGetAll ? 'Loading...' : 'Select a case record'}
                  disabled={loadingGetAll}
                  allowClear
                  onChangeMapperFunc={(value) => value}
                  onChangeSuccess={(selected) => {
                    if (selected?.value === addCaseRecordOptionValue) {
                      dispatchAction(resetCaseRecordState())
                      setHideButton(true)
                    }
                  }}
                />

                {hasSelectedCaseRecord && (
                  <div className='mt-6'>
                    <CaseRecordsForm
                      key={`case-record-${selectedCaseRecordId}`}
                      patientId={patientId}
                      isEditMode={true}
                      hideSectionHeader
                      hideChiefComplaint
                      caseRecordId={selectedCaseRecordId}
                      orderId={orderId}
                      onUploadingChange={setIsUploading}
                      enforceScanFileViewCondition
                      setExternalExistingPreTreatmentFileIds={setUploadedFiles}
                      setExternalExistingXrayFileIds={setUploadedXrayFiles}
                      setExternalExistingScanFileIds={setUploadedScanFiles}
                    />
                  </div>
                )}
                <Footer
                  onNext={() => {
                    if (isUploading || isSavingCaseRecord || isSubmittingRef.current) return
                    handleSubmit()
                  }}
                  nextButtonText={getNextButtonText()}
                  disableNext={isUploading || isSavingCaseRecord || !hasSelectedCaseRecord}
                  loadingNext={isUploading || isSavingCaseRecord}
                />
              </>
            )
          }}
        </Formik>
      </When>
      <When isTrue={shouldShowAddForm}>
        <Formik initialValues={{case_record: null}} onSubmit={() => {}}>
          {({}) => (
            <>
              <CaseRecordsForm
                patientId={patientId}
                isEditMode={true}
                hideSectionHeader
                hideChiefComplaint
                orderId={orderId}
                onSubmitRef={attachSubmit}
                onUploadingChange={setIsUploading}
              />
              <Footer
                onNext={() => {
                  void handleSubmitCaseRecord()
                }}
                nextButtonText={getNextButtonText()}
                disableNext={isUploading || isSavingCaseRecord}
                loadingNext={isUploading || isSavingCaseRecord}
              />
            </>
          )}
        </Formik>
      </When>
    </Page>
  )
}
