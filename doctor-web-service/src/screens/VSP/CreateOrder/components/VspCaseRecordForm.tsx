import {UploadFile, message} from 'antd'
import {FieldArray, Formik} from 'formik'
import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import {AuthContext} from 'context/AuthContext'
import {safeParseInt} from 'utils/ConstFunctions'
import {CaseRecordResponse} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {UploadScanFiles} from './UploadScanFiles'
import {UploadExtraOralPhotos} from './UploadExtraOral'
import {UploadIntraOrals} from './UploadIntraOral'
import type {MeshItem} from 'components/three/ExoViewer'
import {UploadXrays} from './UploadXrays'
import SectionContainer from 'screens/CaseRecords/components/SectionContainer'
import Page from 'components/page/Page'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  createVspCaseRecord,
  getVspCaseRecordById,
  getVspCaseRecordsByPatient,
  updateVspCaseRecord,
} from 'redux/Slices/AppSlice/VSP/caserecord.slice'
import {
  createVspOrder,
  getVspOrderById,
  updateVspOrder,
} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import restructureFileList from 'screens/Orders/Steps/helpers/restructureFileList'
import hasValue from 'utils/hasValue'
import {nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import userTypes from '@constants/userTypes'
import {useVspOrder} from '../hooks/useVspOrder'
import {UploadDesiredOcclusion} from './UploadDesiredOcclusion'
import {UploadDicomFiles} from './UploadDicomFiles'
import FormikInput from 'components/atom/Inputs/FormikInput'
import {Link2, Plus, X} from 'lucide-react'

// Helper function to validate URLs
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true // Empty strings are considered valid (they'll be filtered out)

  try {
    const trimmedUrl = url.trim()
    // Check if it starts with http://, https://, or ftp://
    if (!/^https?:\/\//i.test(trimmedUrl) && !/^ftp:\/\//i.test(trimmedUrl)) {
      return false
    }

    // Try to construct URL object - this will validate the URL format
    new URL(trimmedUrl)
    return true
  } catch {
    return false
  }
}

// Validation function for external links
const validateExternalLinks = (links: string[]): string | undefined => {
  const invalidLinks = links.filter((link) => link.trim() !== '' && !isValidUrl(link))

  if (invalidLinks.length > 0) {
    return `Please enter valid URLs (must start with http://, https://, or ftp://)`
  }

  return undefined
}

const sanitizeExternalLinks = (links: string[] = []): string[] => {
  const seen = new Set<string>()

  return links
    .map((link) => String(link || '').trim())
    .filter(Boolean)
    .filter((link) => {
      if (seen.has(link)) return false
      seen.add(link)
      return true
    })
}

const getNewExternalLinks = (
  currentLinks: string[] = [],
  existingLinks: string[] = []
): string[] => {
  const existingSet = new Set(sanitizeExternalLinks(existingLinks))
  return sanitizeExternalLinks(currentLinks).filter((link) => !existingSet.has(link))
}

export interface CaseRecordFormValues {
  chief_complaint: string
  external_links: string[]
}

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
  onExternalLinksChange?: (links: string[]) => void
}

export const VspCaseRecordsForm = ({
  hideSectionHeader = false,
  patientId,
  caseRecordId,
  onSubmitRef,
  isEditMode,
  orderId,
  onUploadingChange,
  onCreateSuccess,
  useInlineViewer,
  onOpenInlineViewer,
  setExternalExistingPreTreatmentFileIds,
  setExternalExistingScanFileIds,
  setExternalExistingXrayFileIds,
  onExternalLinksChange,
}: CaseRecordsFormProps) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {vspOrderDetails} = useVspOrder(false)
  const {
    vspCaseRecordDetails,
    createVspCaseRecordLoading,
    updateVspCaseRecordLoading,
    getVspCaseRecordByIdLoading,
  } = useSelector((state: RootState) => state.vspCaseRecord)

  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([])
  const [existingPreTreatmentFileIds, setExistingPreTreatmentFileIds] = useState<number[]>([])
  const [uploadedIntraOralFiles, setUploadedIntraOralFiles] = useState<UploadFile[]>([])
  const [existingIntraOralFileIds, setExistingIntraOralFileIds] = useState<number[]>([])
  const [uploadedScanFiles, setUploadedScanFiles] = useState<UploadFile[]>([])
  const [existingScanFileIds, setExistingScanFileIds] = useState<number[]>([])
  const [uploadedDesiredOcclusionFiles, setUploadedDesiredOcclusionFiles] = useState<UploadFile[]>(
    []
  )
  const [existingDesiredOcclusionFileIds, setExistingDesiredOcclusionFileIds] = useState<number[]>(
    []
  )
  const [uploadedDicomFiles, setUploadedDicomFiles] = useState<UploadFile[]>([])
  const [existingDicomFileIds, setExistingDicomFileIds] = useState<number[]>([])
  const [uploadedXrayFiles, setUploadedXrayFiles] = useState<UploadFile[]>([])
  const [existingXrayFileIds, setExistingXrayFileIds] = useState<number[]>([])
  const [sectionUploadingState, setSectionUploadingState] = useState({
    extraoral: false,
    intraoral: false,
    scans: false,
    occlusion: false,
    xrays: false,
  })
  const submitResolverRef = useRef<((success: boolean) => void) | null>(null)

  const isViewMode = !!caseRecordId && !isEditMode
  const selectedOrderCaseRecord = useMemo(
    () =>
      vspOrderDetails?.case_records?.find(
        (record) => safeParseInt(record.id) === safeParseInt(caseRecordId)
      ) ?? null,
    [caseRecordId, vspOrderDetails?.case_records]
  )
  const activeCaseRecord = selectedOrderCaseRecord ?? vspCaseRecordDetails

  // Fetch either single CaseRecord (view mode) or latest (create mode)
  const getCaseRecordData = async () => {
    if ((isViewMode || isEditMode) && !!caseRecordId) {
      await dispatchAction(getVspCaseRecordById({case_record_id: caseRecordId})).unwrap()
    }
  }

  useEffect(() => {
    getCaseRecordData()
  }, [caseRecordId, dispatchAction, isEditMode, isViewMode, patientId])

  useEffect(() => {
    if ((isViewMode || isEditMode) && !!caseRecordId && activeCaseRecord) {
      setExistingPreTreatmentFileIds(
        [
          ...(activeCaseRecord.extraoral_photo_files || []),
          ...(activeCaseRecord.intraoral_photo_files || []),
        ].map((f) => safeParseInt(f.file_id))
      )
      setExistingIntraOralFileIds(
        (activeCaseRecord.intraoral_photo_files || []).map((f) => safeParseInt(f.file_id))
      )
      setExistingScanFileIds(
        (activeCaseRecord.intraoral_scan_files || []).map((f) => safeParseInt(f.file_id))
      )
      setExistingDesiredOcclusionFileIds(
        (activeCaseRecord.stone_cast_files || []).map((f) => safeParseInt(f.file_id))
      )
      setExistingXrayFileIds(
        (activeCaseRecord.radio_grap_files || []).map((f) => safeParseInt(f.file_id))
      )
      setExistingDicomFileIds(
        (activeCaseRecord.dicom_files || []).map((f) => safeParseInt(f.file_id))
      )

      const extraoralPhotos = restructureFileList(
        (activeCaseRecord.extraoral_photo_files || []) as any
      )
      const intraoralPhotos = restructureFileList(
        (activeCaseRecord.intraoral_photo_files || []) as any
      )
      const scans = restructureFileList((activeCaseRecord.intraoral_scan_files || []) as any)
      const occlusion = restructureFileList((activeCaseRecord.stone_cast_files || []) as any)
      const xrays = restructureFileList((activeCaseRecord.radio_grap_files || []) as any)
      const dicoms = restructureFileList((activeCaseRecord.dicom_files || []) as any)

      setUploadedFiles(extraoralPhotos)
      setUploadedIntraOralFiles(intraoralPhotos)
      setUploadedScanFiles(scans)
      setUploadedDesiredOcclusionFiles(occlusion)
      setUploadedDicomFiles(dicoms)
      setUploadedXrayFiles(xrays)
      setExternalExistingPreTreatmentFileIds?.([...extraoralPhotos, ...intraoralPhotos])
      setExternalExistingScanFileIds?.(scans)
      setExternalExistingXrayFileIds?.(xrays)
      return
    }

    // Add-new mode: clear any stale files from previously selected case record
    setExistingPreTreatmentFileIds([])
    setExistingIntraOralFileIds([])
    setExistingScanFileIds([])
    setExistingDesiredOcclusionFileIds([])
    setExistingDicomFileIds([])
    setExistingXrayFileIds([])
    setUploadedFiles([])
    setUploadedIntraOralFiles([])
    setUploadedScanFiles([])
    setUploadedDesiredOcclusionFiles([])
    setUploadedDicomFiles([])
    setUploadedXrayFiles([])
    setExternalExistingPreTreatmentFileIds?.([])
    setExternalExistingScanFileIds?.([])
    setExternalExistingXrayFileIds?.([])
  }, [
    caseRecordId,
    isEditMode,
    isViewMode,
    setExternalExistingPreTreatmentFileIds,
    setExternalExistingScanFileIds,
    setExternalExistingXrayFileIds,
    activeCaseRecord,
  ])

  useEffect(() => {
    setExternalExistingPreTreatmentFileIds?.([...uploadedFiles, ...uploadedIntraOralFiles])
  }, [uploadedFiles, uploadedIntraOralFiles, setExternalExistingPreTreatmentFileIds])

  useEffect(() => {
    setExternalExistingScanFileIds?.(uploadedScanFiles)
  }, [uploadedScanFiles, setExternalExistingScanFileIds])

  useEffect(() => {
    setExternalExistingXrayFileIds?.([...uploadedDicomFiles, ...uploadedXrayFiles])
  }, [uploadedDicomFiles, uploadedXrayFiles, setExternalExistingXrayFileIds])

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
    (section: 'extraoral' | 'intraoral' | 'scans' | 'occlusion' | 'xrays') =>
    (isUploading: boolean) => {
      setSectionUploadingState((prev) => {
        if (prev[section] === isUploading) return prev
        return {
          ...prev,
          [section]: isUploading,
        }
      })
    }

  const mapUploadFileToCaseRecordFile = (file: UploadFile): any => {
    const extension = file.name?.split('.').pop()?.toLowerCase() ?? ''
    const createdAt = new Date().toISOString()
    const responseFile = (file as any)?.response?.uploaded_file
    const url = file.url ?? responseFile?.url ?? ''
    const fileIdSource = responseFile?.file_id ?? file.uid
    const parsedId = typeof fileIdSource === 'number' ? fileIdSource : safeParseInt(fileIdSource)
    const fileId = parsedId || Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`)
    return {
      file_id: fileId,
      drive_file_id: undefined,
      name: file.name ?? '',
      url,
      thumbnail_url: undefined,
      download_url: undefined,
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

  const getFileIdsFromUploads = (files: UploadFile[]) =>
    files.map((file) => safeParseInt(file.uid)).filter(Boolean)

  const getRemovedFileIds = () => {
    if (!activeCaseRecord) return []

    const existingFileIds = [
      ...(activeCaseRecord.extraoral_photo_files || []).map((f) => safeParseInt(f.file_id)),
      ...(activeCaseRecord.intraoral_photo_files || []).map((f) => safeParseInt(f.file_id)),
      ...(activeCaseRecord.intraoral_scan_files || []).map((f) => safeParseInt(f.file_id)),
      ...(activeCaseRecord.stone_cast_files || []).map((f) => safeParseInt(f.file_id)),
      ...(activeCaseRecord.dicom_files || []).map((f) => safeParseInt(f.file_id)),
      ...(activeCaseRecord.radio_grap_files || []).map((f) => safeParseInt(f.file_id)),
    ].filter(Boolean)

    const currentFileIds = [
      ...getFileIdsFromUploads(uploadedFiles),
      ...getFileIdsFromUploads(uploadedIntraOralFiles),
      ...getFileIdsFromUploads(uploadedScanFiles),
      ...getFileIdsFromUploads(uploadedDesiredOcclusionFiles),
      ...getFileIdsFromUploads(uploadedDicomFiles),
      ...getFileIdsFromUploads(uploadedXrayFiles),
    ]

    return existingFileIds.filter((fileId) => !currentFileIds.includes(fileId))
  }

  const initialValues = useMemo<CaseRecordFormValues>(() => {
    const shouldPrefillExistingRecord = Boolean(caseRecordId) && (isViewMode || isEditMode)
    const savedLinks = sanitizeExternalLinks(
      shouldPrefillExistingRecord ? (activeCaseRecord?.external_links ?? []) : []
    )

    return {
      chief_complaint: '',
      external_links: savedLinks.length > 0 ? savedLinks : [''],
    }
  }, [activeCaseRecord, caseRecordId, isEditMode, isViewMode])

  return (
    <Page loading={getVspCaseRecordByIdLoading}>
      <Formik<CaseRecordFormValues>
        initialValues={initialValues}
        enableReinitialize
        validate={(values) => {
          const errors: Partial<Record<keyof CaseRecordFormValues, string>> = {}

          // Validate external links format
          const externalLinksError = validateExternalLinks(values.external_links)
          if (externalLinksError) {
            errors.external_links = externalLinksError
          }

          return errors
        }}
        onSubmit={async (values, formikHelpers) => {
          // Check for validation errors before submitting
          const externalLinksError = validateExternalLinks(values.external_links)
          if (externalLinksError) {
            message.error(externalLinksError)
            formikHelpers.setSubmitting(false)
            resolveSubmit(false)
            return
          }

          if (isViewMode) {
            resolveSubmit(false)
            formikHelpers.setSubmitting(false)
            return // do nothing in view mode
          }

          const hasAnyFile =
            uploadedFiles.length > 0 ||
            uploadedIntraOralFiles.length > 0 ||
            uploadedScanFiles.length > 0 ||
            uploadedDesiredOcclusionFiles.length > 0 ||
            uploadedDicomFiles.length > 0 ||
            uploadedXrayFiles.length > 0

          const externalLinks = sanitizeExternalLinks(values.external_links || [])
          const existingExternalLinks = sanitizeExternalLinks(
            activeCaseRecord?.external_links || []
          )
          const isUpdatingExistingRecord = Boolean(isEditMode && hasValue(caseRecordId))
          const newExternalLinks = isUpdatingExistingRecord
            ? getNewExternalLinks(externalLinks, existingExternalLinks)
            : externalLinks
          const hasAnyLink = externalLinks.length > 0

          if (!hasAnyFile && !hasAnyLink) {
            dispatchAction(nextStep()) // move to next step
            resolveSubmit(true)
            formikHelpers.setSubmitting(false)
            return
          }

          try {
            const resolvedOrderId =
              String(orderId ?? vspOrderDetails?.order_id ?? '').trim() || null
            const resolvedPatientId =
              safeParseInt(patientId) || safeParseInt(vspOrderDetails?.patient_id)

            if (!resolvedPatientId) {
              message.error('Patient details are missing for VSP case record creation.')
              formikHelpers.setSubmitting(false)
              resolveSubmit(false)
              return
            }

            const extraoralPhotoFileIds =
              isEditMode && hasValue(caseRecordId)
                ? getFileIdsFromUploads(uploadedFiles)
                : uploadedFiles
                    .map((file) => safeParseInt(file.uid))
                    .filter((id) => !existingPreTreatmentFileIds.includes(id))
            const intraoralPhotoFileIds =
              isEditMode && hasValue(caseRecordId)
                ? getFileIdsFromUploads(uploadedIntraOralFiles)
                : uploadedIntraOralFiles
                    .map((file) => safeParseInt(file.uid))
                    .filter((id) => !existingIntraOralFileIds.includes(id))
            const intraoralScanFileIds =
              isEditMode && hasValue(caseRecordId)
                ? getFileIdsFromUploads(uploadedScanFiles)
                : uploadedScanFiles
                    .map((file) => safeParseInt(file.uid))
                    .filter((id) => !existingScanFileIds.includes(id))
            const stoneCastFileIds =
              isEditMode && hasValue(caseRecordId)
                ? getFileIdsFromUploads(uploadedDesiredOcclusionFiles)
                : uploadedDesiredOcclusionFiles
                    .map((file) => safeParseInt(file.uid))
                    .filter((id) => !existingDesiredOcclusionFileIds.includes(id))
            const dicomFileIds =
              isEditMode && hasValue(caseRecordId)
                ? getFileIdsFromUploads(uploadedDicomFiles)
                : uploadedDicomFiles
                    .map((file) => safeParseInt(file.uid))
                    .filter((id) => !existingDicomFileIds.includes(id))
            const radioGrapFileIds =
              isEditMode && hasValue(caseRecordId)
                ? getFileIdsFromUploads(uploadedXrayFiles)
                : uploadedXrayFiles
                    .map((file) => safeParseInt(file.uid))
                    .filter((id) => !existingXrayFileIds.includes(id))

            const removeFileIds = isUpdatingExistingRecord ? getRemovedFileIds() : []

            const res: any = await dispatchAction(
              isUpdatingExistingRecord
                ? updateVspCaseRecord({
                    case_record_id: safeParseInt(caseRecordId),
                    patient_id: resolvedPatientId,
                    extraoral_photo_file_ids: extraoralPhotoFileIds,
                    intraoral_photo_file_ids: intraoralPhotoFileIds,
                    intraoral_scan_file_ids: intraoralScanFileIds,
                    stone_cast_file_ids: stoneCastFileIds,
                    dicom_file_ids: dicomFileIds,
                    radio_grap_file_ids: radioGrapFileIds,
                    remove_file_ids: removeFileIds,
                    ...(newExternalLinks.length > 0 ? {external_links: newExternalLinks} : {}),
                  })
                : createVspCaseRecord({
                    record_selection_mode: 'ADD_NEW',
                    order_id: resolvedOrderId,
                    patient_id: resolvedPatientId,
                    extraoral_photo_file_ids: extraoralPhotoFileIds,
                    intraoral_photo_file_ids: intraoralPhotoFileIds,
                    intraoral_scan_file_ids: intraoralScanFileIds,
                    stone_cast_file_ids: stoneCastFileIds,
                    dicom_file_ids: dicomFileIds,
                    radio_grap_file_ids: radioGrapFileIds,
                    external_links: externalLinks,
                  })
            ).unwrap()

            const resolvedCaseRecordId = safeParseInt(res?.id) || safeParseInt(res?.case_record_id)
            const isNewRecord = !(isEditMode && hasValue(caseRecordId))
            if (isNewRecord && onCreateSuccess) {
              const serverRecord = res ?? null

              if (serverRecord) {
                onCreateSuccess({
                  case_record_id: safeParseInt(serverRecord.id),
                  chief_complaint: values.chief_complaint,
                  pre_treatment_files: [
                    ...(serverRecord.extraoral_photo_files ?? []),
                    ...(serverRecord.intraoral_photo_files ?? []),
                  ],
                  scan_files: [
                    ...(serverRecord.intraoral_scan_files ?? []),
                    ...(serverRecord.stone_cast_files ?? []),
                  ],
                  xray_files: [
                    ...(serverRecord.dicom_files ?? []),
                    ...(serverRecord.radio_grap_files ?? []),
                  ],
                  created_at: serverRecord.created_at ?? new Date().toISOString(),
                  is_added_by_customer: false,
                })
              } else {
                const fallbackIdSource = resolvedCaseRecordId ?? Date.now()
                const fallbackId =
                  typeof fallbackIdSource === 'number'
                    ? fallbackIdSource
                    : safeParseInt(fallbackIdSource)
                const fallbackRecord: CaseRecordResponse = {
                  case_record_id: fallbackId,
                  chief_complaint: values.chief_complaint,
                  pre_treatment_files: [
                    ...uploadedFiles.map(mapUploadFileToCaseRecordFile),
                    ...uploadedIntraOralFiles.map(mapUploadFileToCaseRecordFile),
                  ],
                  scan_files: [
                    ...uploadedScanFiles.map(mapUploadFileToCaseRecordFile),
                    ...uploadedDesiredOcclusionFiles.map(mapUploadFileToCaseRecordFile),
                  ],
                  xray_files: [...uploadedDicomFiles, ...uploadedXrayFiles].map(
                    mapUploadFileToCaseRecordFile
                  ),
                  created_at: new Date().toISOString(),
                  is_added_by_customer: false,
                }
                onCreateSuccess(fallbackRecord)
              }
            }
            if (hasValue(resolvedOrderId)) {
              await dispatchAction(
                updateVspOrder({
                  order_id: resolvedOrderId as string,
                  case_record_id: resolvedCaseRecordId,
                  status: vspOrderDetails?.status ?? 'DRAFT',
                  patient_id: resolvedPatientId,
                })
              ).unwrap()
              await dispatchAction(
                getVspOrderById({
                  order_id: resolvedOrderId as string,
                })
              ).unwrap()
              dispatchAction(nextStep())
              await getCaseRecordData()
              await dispatchAction(getVspCaseRecordsByPatient({patient_id: resolvedPatientId}))
            } else if (hasValue(vspOrderDetails?.service_product_id)) {
              const resolvedServiceProductId = safeParseInt(vspOrderDetails?.service_product_id)
              if (!resolvedServiceProductId || !resolvedPatientId) {
                message.error(
                  'Service product or patient details are missing for VSP order creation.'
                )
                resolveSubmit(false)
                formikHelpers.setSubmitting(false)
                return
              }

              await dispatchAction(
                createVspOrder({
                  patient_id: resolvedPatientId,
                  service_product_id: resolvedServiceProductId,
                  oral_surgeon_name: vspOrderDetails?.oral_surgeon_name,
                  orthodontist_name: vspOrderDetails?.orthodontist_name,
                  case_record_id: resolvedCaseRecordId,
                  status: 'DRAFT',
                })
              ).unwrap()

              dispatchAction(nextStep())
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
            const submitViaRef = async () => {
              if (submitResolverRef.current) {
                submitResolverRef.current(false)
              }
              const errors = await formik.validateForm()
              if (Object.keys(errors).length > 0) {
                formik.setTouched(
                  Object.keys(errors).reduce((acc, key) => ({...acc, [key]: true}), {})
                )
                return false
              }
              return new Promise<boolean>((resolve) => {
                submitResolverRef.current = resolve
                formik.submitForm()
              })
            }
            onSubmitRef(submitViaRef)
          }, [onSubmitRef, formik.submitForm, formik.validateForm])
          useEffect(() => {
            onExternalLinksChange?.(sanitizeExternalLinks(formik.values.external_links || []))
          }, [formik.values.external_links, onExternalLinksChange])
          const formContent = (
            <>
              <div className='flex flex-col gap-4 min-w-3/4'>
                <UploadExtraOralPhotos
                  uploadedFiles={uploadedFiles}
                  setUploadedFiles={setUploadedFiles}
                  viewMode={isViewMode}
                  patient_id={safeParseInt(vspOrderDetails?.patient_id) || patientId}
                  onUploadingChange={handleSectionUploadingChange('extraoral')}
                />

                <UploadIntraOrals
                  uploadedFiles={uploadedIntraOralFiles}
                  setUploadedFiles={setUploadedIntraOralFiles}
                  viewMode={isViewMode}
                  patient_id={safeParseInt(vspOrderDetails?.patient_id) || patientId}
                  onUploadingChange={handleSectionUploadingChange('intraoral')}
                />
                <UploadScanFiles
                  uploadedFiles={uploadedScanFiles}
                  setUploadedFiles={setUploadedScanFiles}
                  viewMode={isViewMode}
                  patient_id={safeParseInt(vspOrderDetails?.patient_id) || patientId}
                  onUploadingChange={handleSectionUploadingChange('scans')}
                  useInlineViewer={useInlineViewer}
                  onOpenInlineViewer={onOpenInlineViewer}
                />

                <UploadDesiredOcclusion
                  uploadedFiles={uploadedDesiredOcclusionFiles}
                  setUploadedFiles={setUploadedDesiredOcclusionFiles}
                  viewMode={isViewMode}
                  patient_id={safeParseInt(vspOrderDetails?.patient_id) || patientId}
                  onUploadingChange={handleSectionUploadingChange('occlusion')}
                  useInlineViewer={useInlineViewer}
                  onOpenInlineViewer={onOpenInlineViewer}
                />

                <UploadDicomFiles
                  uploadedFiles={uploadedDicomFiles}
                  setUploadedFiles={setUploadedDicomFiles}
                  viewMode={isViewMode}
                  patient_id={safeParseInt(vspOrderDetails?.patient_id) || patientId}
                  onUploadingChange={handleSectionUploadingChange('xrays')}
                />

                <UploadXrays
                  uploadedFiles={uploadedXrayFiles}
                  setUploadedFiles={setUploadedXrayFiles}
                  viewMode={isViewMode}
                  patient_id={safeParseInt(vspOrderDetails?.patient_id) || patientId}
                  onUploadingChange={handleSectionUploadingChange('xrays')}
                />

                <div className='rounded-2xl border border-[#D0D5DD] bg-white p-4 md:p-6'>
                  <div className='flex items-start gap-3'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF]'>
                      <Link2 className='h-5 w-5 text-[#4A62E8]' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-xl font-semibold leading-[1.25] text-[#1D2939]'>
                        Bulk Upload via External Link
                      </p>
                      <p className='mt-1 text-sm leading-[1.45] text-[#475467] md:text-base'>
                        If you want to submit all of the data in a single folder via a{' '}
                        <span className='font-semibold'>Google Drive / Smash / Wetransfer</span>{' '}
                        link, please paste the link(s) here.
                      </p>
                    </div>
                  </div>

                  <FieldArray
                    name='external_links'
                    render={(helpers) => (
                      <div className='mt-4 space-y-3'>
                        {formik.values.external_links.map((_, index) => (
                          <div key={`external-links-${index}`} className='flex items-center gap-2'>
                            <div className='flex-1'>
                              <FormikInput
                                name={`external_links.${index}`}
                                placeholder='e.g. https://drive.google.com/drive/folders/...'
                                hideErrorMessage
                                className={`!h-12 !rounded-xl !border-[#D0D5DD] !bg-white !px-4 !text-base placeholder:!text-[#98A2B3] ${
                                  formik.touched.external_links && formik.errors.external_links
                                    ? '!border-red-500'
                                    : ''
                                }`}
                              />
                            </div>
                            <button
                              type='button'
                              onClick={() => {
                                if (formik.values.external_links.length === 1) {
                                  formik.setFieldValue(`external_links.${index}`, '')
                                  return
                                }
                                helpers.remove(index)
                              }}
                              className='inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D0D5DD] text-[#98A2B3] hover:bg-[#F8FAFC]'
                              aria-label='Remove link'
                            >
                              <X className='h-5 w-5' />
                            </button>
                          </div>
                        ))}

                        {formik.errors.external_links && (
                          <div className='mt-1 text-sm text-[#F04438]'>
                            {formik.errors.external_links}
                          </div>
                        )}

                        <button
                          type='button'
                          onClick={() => helpers.push('')}
                          className='inline-flex items-center gap-2 text-sm font-semibold text-[#4A62E8] md:text-[18px]'
                        >
                          <Plus className='h-4 w-4' />
                          Add another link
                        </button>
                      </div>
                    )}
                  />
                </div>
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
                isSubmitting={
                  createVspCaseRecordLoading ||
                  updateVspCaseRecordLoading ||
                  getVspCaseRecordByIdLoading
                }
                showSubmitButton={!isViewMode}
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
