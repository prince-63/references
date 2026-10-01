import {Divider, UploadFile, message} from 'antd'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {Formik} from 'formik'
import {useContext, useEffect, useRef, useState} from 'react'
import {useCreateCaseRecordAction} from '../hook'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {
  APIPostData,
  CaseRecordFile,
  CaseRecordResponse,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {UploadPreTreatmentPhotos} from './UploadPreTreatmentPhotos'
import {UploadScanFiles} from './UploadScanFiles'
import type {MeshItem} from 'components/three/ExoViewer'
import {UploadXrays} from './UploadXrays'
import SectionContainer from './SectionContainer'
import Page from 'components/page/Page'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getAllCaseRecord,
  getSingleCaseRecord,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import restructureFileList from 'screens/Orders/Steps/helpers/restructureFileList'
import hasValue from 'utils/hasValue'
import {nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import userTypes from '@constants/userTypes'
import useCreateOrder from '@hooks/useCreateOrder'
import useAllUserPlan from '@hooks/useAllUserPlan'

export interface CaseRecordFormValues {
  chief_complaint: string
}

const SectionLabel = ({children, required}: {children: React.ReactNode; required?: boolean}) => (
  <label className='text-black font-semibold text-base mb-2'>
    {children}
    {required && <span className='text-red ml-1'>*</span>}
  </label>
)

interface CaseRecordsFormProps {
  hideSectionHeader?: boolean
  hideChiefComplaint?: boolean
  patientId?: number
  caseRecordId?: number
  onSubmitRef?: (submitFn: () => Promise<boolean>) => void
  isEditMode?: boolean
  orderId?: string // ✅ new
  onUploadingChange?: (isUploading: boolean) => void
  onCreateSuccess?: (record: CaseRecordResponse) => void
  enforceScanFileViewCondition?: boolean
  // Inline 3D viewer passthrough for Add Prescription sidebar only
  useInlineViewer?: boolean
  onOpenInlineViewer?: (payload: {meshes: MeshItem[]; tempUrls: string[]}) => void
  setExternalExistingPreTreatmentFileIds?: (files: UploadFile[]) => void
  setExternalExistingScanFileIds?: (files: UploadFile[]) => void
  setExternalExistingXrayFileIds?: (files: UploadFile[]) => void
}

export const CaseRecordsForm = ({
  hideSectionHeader = false,
  hideChiefComplaint = false,
  patientId,
  caseRecordId,
  onSubmitRef,
  isEditMode,
  orderId,
  onUploadingChange,
  onCreateSuccess,
  enforceScanFileViewCondition = false,
  useInlineViewer,
  onOpenInlineViewer,
  setExternalExistingPreTreatmentFileIds,
  setExternalExistingScanFileIds,
  setExternalExistingXrayFileIds,
}: CaseRecordsFormProps) => {
  const {dispatchAction} = useDispatchAction()
  const {createNewCaseRecord} = useCreateCaseRecordAction()
  const {handleCreateOrder} = useCreateOrder()
  const {profileId, userId} = useContext(AuthContext)
  const {caseRecordData, loadingGet, loadingGetSingle} = useSelector(
    (state: RootState) => state.caseRecord
  )
  const {isGrowthPlanUser, isPractice} = useAllUserPlan()

  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const isCustomerScanFileViewEnabled = data?.is_customer_scan_file_view_enabled

  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [existingPreTreatmentFileIds, setExistingPreTreatmentFileIds] = useState<number[]>([])
  const [uploadedScanFiles, setUploadedScanFiles] = useState<UploadFile[]>([])
  const [existingScanFileIds, setExistingScanFileIds] = useState<number[]>([])
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<UploadFile[]>([])
  const [existingXrayFileIds, setExistingXrayFileIds] = useState<number[]>([])
  const {order} = userOrderDetails(true)
  const [sectionUploadingState, setSectionUploadingState] = useState({
    photos: false,
    scans: false,
    xrays: false,
  })
  const submitResolverRef = useRef<((success: boolean) => void) | null>(null)

  const isViewMode = !!caseRecordId && !isEditMode

  const isDisabled = isViewMode // disable all inputs in view mode

  const isCaseRecordAddedByCustomer =
    caseRecordData?.is_added_by_customer || caseRecordData?.is_added_by_admin

  const canViewScanFile =
    (isPractice || isGrowthPlanUser) && !isCaseRecordAddedByCustomer
      ? isCustomerScanFileViewEnabled
      : true

  const shouldApplyScanFileViewCondition = isViewMode || enforceScanFileViewCondition

  // Fetch either single CaseRecord (view mode) or latest (create mode)
  const getCaseRecordData = async () => {
    if ((isViewMode || isEditMode) && !!caseRecordId) {
      await dispatchAction(getSingleCaseRecord(caseRecordId)).unwrap()
    }
  }

  useEffect(() => {
    getCaseRecordData()
  }, [patientId, caseRecordId])

  useEffect(() => {
    if ((isViewMode || isEditMode) && caseRecordData) {
      setExistingPreTreatmentFileIds(
        (caseRecordData.pre_treatment_files || []).map((f) => safeParseInt(f.file_id))
      )
      setExistingScanFileIds((caseRecordData.scan_files || []).map((f) => safeParseInt(f.file_id)))
      setExistingXrayFileIds((caseRecordData.xray_files || []).map((f) => safeParseInt(f.file_id)))

      const photos = restructureFileList(caseRecordData.pre_treatment_files || [])
      const scans = restructureFileList(caseRecordData.scan_files || [])
      const xrays = restructureFileList(caseRecordData.xray_files || [])

      setUploadedFiles(photos)
      setUploadedScanFiles(scans)
      setUploadedXrayFiles(xrays)
      setExternalExistingPreTreatmentFileIds?.(photos)
      setExternalExistingScanFileIds?.(scans)
      setExternalExistingXrayFileIds?.(xrays)
    }
  }, [caseRecordData])

  useEffect(() => {
    setExternalExistingPreTreatmentFileIds?.(uploadedFiles)
  }, [uploadedFiles, setExternalExistingPreTreatmentFileIds])

  useEffect(() => {
    setExternalExistingScanFileIds?.(uploadedScanFiles)
  }, [uploadedScanFiles, setExternalExistingScanFileIds])

  useEffect(() => {
    setExternalExistingXrayFileIds?.(uploadedXrayFiles)
  }, [uploadedXrayFiles, setExternalExistingXrayFileIds])

  const lastReportedUploadingRef = useRef<boolean | null>(null)
  const onUploadingChangeRef = useRef<typeof onUploadingChange>(onUploadingChange)

  useEffect(() => {
    onUploadingChangeRef.current = onUploadingChange
  }, [onUploadingChange])

  useEffect(() => {
    const callback = onUploadingChangeRef.current
    if (!callback) return
    const hasUploadInProgress = Object.values(sectionUploadingState).some(Boolean)
    if (lastReportedUploadingRef.current !== hasUploadInProgress) {
      lastReportedUploadingRef.current = hasUploadInProgress
      callback(hasUploadInProgress)
    }
  }, [sectionUploadingState])

  useEffect(() => {
    return () => {
      const callback = onUploadingChangeRef.current
      if (callback) {
        lastReportedUploadingRef.current = false
        callback(false)
      }
    }
  }, [])

  const handleSectionUploadingChange =
    (section: 'photos' | 'scans' | 'xrays') => (isUploading: boolean) => {
      setSectionUploadingState((prev) => {
        if (prev[section] === isUploading) return prev
        return {
          ...prev,
          [section]: isUploading,
        }
      })
    }

  const mapUploadFileToCaseRecordFile = (file: UploadFile): CaseRecordFile => {
    const extension = file.name?.split('.').pop()?.toLowerCase() ?? ''
    const createdAt = new Date().toISOString()
    const responseFile = (file as any)?.response?.uploaded_file
    const url = file.url ?? responseFile?.url ?? ''
    const fileIdSource = responseFile?.file_id ?? file.uid
    const parsedId = typeof fileIdSource === 'number' ? fileIdSource : safeParseInt(fileIdSource)
    const fileId = parsedId || Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`)
    return {
      file_id: fileId,
      name: file.name ?? '',
      url,
      full_path: url,
      created_by: safeParseInt(userId),
      created_by_user_type: userTypes.DOCTOR,
      deleted_by: null,
      deleted_by_user_type: null,
      folder: false,
      type: extension,
      extension,
      child_file_count: 0,
      child_folder_count: 0,
      children_files: [],
      size: (file as any)?.size ?? 0,
      created_at: createdAt,
      default_folder: false,
      patient_folder: false,
      files_from_treatment_plan: false,
      file_display_to_patient: false,
    }
  }
  const resolveSubmit = (success: boolean) => {
    if (submitResolverRef.current) {
      submitResolverRef.current(success)
      submitResolverRef.current = null
    }
  }

  return (
    <Page loading={loadingGetSingle}>
      <Formik<CaseRecordFormValues>
        initialValues={{
          chief_complaint: caseRecordData?.chief_complaint || '',
        }}
        onSubmit={async (values, formikHelpers) => {
          if (isViewMode) {
            resolveSubmit(false)
            formikHelpers.setSubmitting(false)
            return // do nothing in view mode
          }
          // Validation: must have at least one file
          const hasAnyFile =
            uploadedFiles.length > 0 || uploadedScanFiles.length > 0 || uploadedXrayFiles.length > 0
          if (!hasAnyFile && !hasValue(orderId)) {
            message.error(
              'Please upload at least one file (photo, scan, or x-ray) to submit the case record.'
            )
            formikHelpers.setSubmitting(false)
            resolveSubmit(false)
            return
          } else if (!hasAnyFile && hasValue(orderId)) {
            dispatchAction(nextStep())
            formikHelpers.setSubmitting(false)
            resolveSubmit(true)
            return
          }
          const requestBody: APIPostData = {
            chief_complaint: values.chief_complaint,
            pre_treatment_file_ids: uploadedFiles
              .map((file) => safeParseInt(file.uid))
              .filter((id) => !existingPreTreatmentFileIds.includes(id)),
            scan_file_ids: uploadedScanFiles
              .map((file) => safeParseInt(file.uid))
              .filter((id) => !existingScanFileIds.includes(id)),
            xray_file_ids: uploadedXrayFiles
              .map((file) => safeParseInt(file.uid))
              .filter((id) => !existingXrayFileIds.includes(id)),
            patient_id: safeParseInt(patientId),
            profile_id: safeParseInt(profileId),
            doctor_id: safeParseInt(userId),
            case_record_id: !!caseRecordId && !!isEditMode ? caseRecordId : null,
          }

          try {
            const res: any = await createNewCaseRecord(requestBody)
            const isNewRecord = !(isEditMode && hasValue(caseRecordId))
            if (isNewRecord && onCreateSuccess) {
              const serverRecord =
                res?.case_record ?? res?.data?.case_record ?? res?.case_record_details ?? null

              if (serverRecord) {
                onCreateSuccess({
                  ...serverRecord,
                  case_record_id: safeParseInt(serverRecord.case_record_id),
                  chief_complaint: serverRecord.chief_complaint ?? values.chief_complaint,
                  pre_treatment_files: serverRecord.pre_treatment_files ?? [],
                  scan_files: serverRecord.scan_files ?? [],
                  xray_files: serverRecord.xray_files ?? [],
                  created_at: serverRecord.created_at ?? new Date().toISOString(),
                })
              } else {
                const fallbackIdSource = res?.case_record_id ?? Date.now()
                const fallbackId =
                  typeof fallbackIdSource === 'number'
                    ? fallbackIdSource
                    : safeParseInt(fallbackIdSource)
                const fallbackRecord: CaseRecordResponse = {
                  case_record_id: fallbackId,
                  chief_complaint: values.chief_complaint,
                  pre_treatment_files: uploadedFiles.map(mapUploadFileToCaseRecordFile),
                  scan_files: uploadedScanFiles.map(mapUploadFileToCaseRecordFile),
                  xray_files: uploadedXrayFiles.map(mapUploadFileToCaseRecordFile),
                  created_at: new Date().toISOString(),
                }
                onCreateSuccess(fallbackRecord)
              }
            }
            if (hasValue(orderId) && order) {
              await handleCreateOrder({
                orderPayload: {
                  case_record_id: res?.case_record_id,
                  patient_id: order?.patient_details?.id,
                  order_id: order.order_id,
                  status: order.status,
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
              await getCaseRecordData()
            } else {
              await dispatchAction(getAllCaseRecord({patient_id: safeParseInt(patientId)}))
            }
            resolveSubmit(true)
          } catch (error) {
            console.error('Failed to create case record', error)
            message.error('Failed to save case record. Please try again.')
            resolveSubmit(false)
          } finally {
            formikHelpers.setSubmitting(false)
          }
        }}
      >
        {(formik) => {
          useEffect(() => {
            if (!onSubmitRef) return
            const submitViaRef = () => {
              if (submitResolverRef.current) {
                submitResolverRef.current(false)
              }
              return new Promise<boolean>((resolve) => {
                submitResolverRef.current = resolve
                formik.submitForm()
              })
            }
            onSubmitRef(submitViaRef)
          }, [onSubmitRef, formik.submitForm])
          const formContent = (
            <>
              {!hideChiefComplaint && (
                <>
                  <SectionLabel>Chief complaint</SectionLabel>
                  <FormikInputTextArea
                    name='chief_complaint'
                    className='py-3'
                    maxLength={2000}
                    placeholder="Enter patient's chief complaint"
                    disabled={isDisabled}
                  />
                  <Divider />
                </>
              )}

              <div className='flex flex-col gap-4 min-w-3/4'>
                <UploadPreTreatmentPhotos
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  viewMode={isViewMode}
                  patient_id={hasValue(orderId) ? order?.patient_details?.id : patientId}
                  onUploadingChange={handleSectionUploadingChange('photos')}
                />

                {(!shouldApplyScanFileViewCondition || canViewScanFile) && (
                  <UploadScanFiles
                    uploadedFiles={uploadedScanFiles}
                    setUploadedFiles={setUploadedScanFiles}
                    viewMode={isViewMode}
                    patient_id={hasValue(orderId) ? order?.patient_details?.id : patientId}
                    onUploadingChange={handleSectionUploadingChange('scans')}
                    useInlineViewer={useInlineViewer}
                    onOpenInlineViewer={onOpenInlineViewer}
                  />
                )}

                <UploadXrays
                  uploadedFiles={uploadedXrayFiles}
                  setUploadedFiles={setUploadedXrayFiles}
                  viewMode={isViewMode}
                  patient_id={hasValue(orderId) ? order?.patient_details?.id : patientId}
                  onUploadingChange={handleSectionUploadingChange('xrays')}
                />
              </div>
            </>
          )

          return hideSectionHeader ? (
            <form id='case-record-form'>{formContent}</form>
          ) : (
            <div className='flex flex-col'>
              <SectionContainer
                title='Case Records'
                titleClassName='text-2xl'
                subTitle={
                  <>
                    <div>
                      Includes patient case information like chief complaint, photos, scans, and
                      X-rays.
                    </div>
                    <div>
                      Same files are stored in Patient profile/Files/Treatment. Removing from here
                      will automatically remove from the older as well.
                    </div>
                  </>
                }
                isSubmitting={loadingGet || loadingGetSingle}
                showSubmitButton={!isViewMode} // hide submit button in view mode
              >
                <form id='case-record-form'>{formContent}</form>
              </SectionContainer>
            </div>
          )
        }}
      </Formik>
    </Page>
  )
}
