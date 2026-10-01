import {ChangeEvent, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {Eye, FileText, Trash2, Upload, X} from 'lucide-react'
import {Formik, FormikProps} from 'formik'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import Spinner from 'components/spinner/Spinner'
import FormikSelectList from 'components/atom/Dropdown/FormikSelectList'
import FormikInputTextArea from 'components/atom/Inputs/FormikInputTextArea'
import {getNewTreatmentList} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import type {NewPlanData} from 'screens/PatientDetailsOverview.tsx/types/PlanList.types'
import {arrayOfAligners, safeParseInt} from 'utils/ConstFunctions'
import {Image as DsImage} from 'assets/images/Images/Image'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import {useSearchParams} from 'react-router-dom'

export interface QuickCheckInData {
  treatmentPlanId: number
  treatmentPlanName: string
  alignerNumber: string
  startAlignerNumber: number
  endAlignerNumber: number
  totalAligners: number
  notes: string
  files: File[]
}

interface QuickCheckInModalProps {
  isOpen: boolean
  patientId?: number
  onClose: () => void
  onSave: (data: QuickCheckInData) => void | Promise<void>
}

const MAX_CHECK_IN_ATTACHMENTS = 15

interface QuickCheckInAttachment {
  file: File
  previewUrl: string
  type: 'image' | 'pdf'
}

interface QuickCheckInFormValues {
  treatmentPlan: string
  alignerNumber: string
  notes: string
}

const getAttachmentFileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`

type QuickCheckInPlan = NewPlanData & {
  aligner_details_meta_data?: {
    upper_jaw_details?: {starts_with: number; ends_with: number; range: number[]}
    lower_jaw_details?: {starts_with: number; ends_with: number; range: number[]}
  }
  upper_jaw_details?: {starts_with: number; ends_with: number; range: number[]}
  lower_jaw_details?: {starts_with: number; ends_with: number; range: number[]}
  total_stages?: number | string | null
  stages?: number | string | null
  total_aligner?: number | string | null
  treatment_status?: string | null
}

const isApprovedTreatmentPlan = (plan: QuickCheckInPlan) =>
  [plan.status, plan.initiator_status, plan.approver_status, plan.treatment_status].some(
    (status) => String(status ?? '').toUpperCase() === 'APPROVED'
  )

const getTreatmentPlanDisplayName = (plan: QuickCheckInPlan) => {
  const title = plan.treatment_plan_tag_name || plan.treatment_plan_name || 'Treatment Plan'
  if (plan.version) return `${title} (${plan.version})`
  if (plan.plan_id) return `${title} (#${plan.plan_id})`
  return title
}

export const QuickCheckInModal = ({isOpen, patientId, onClose, onSave}: QuickCheckInModalProps) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const [treatmentPlanId, setTreatmentPlanId] = useState('')
  const [alignerNumber, setAlignerNumber] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<QuickCheckInAttachment[]>([])
  const [treatmentPlans, setTreatmentPlans] = useState<QuickCheckInPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [plansError, setPlansError] = useState('')
  const [error, setError] = useState('')
  const [fileLimitError, setFileLimitError] = useState('')
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false)
  const [activeImagePreviewIndex, setActiveImagePreviewIndex] = useState(0)
  const [activePdfPreview, setActivePdfPreview] = useState<QuickCheckInAttachment | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const formikRef = useRef<FormikProps<QuickCheckInFormValues> | null>(null)
  const [searchParams] = useSearchParams()

  const orderId = searchParams.get('order_id')

  const parsedUserId = safeParseInt(userId)

  const approvedTreatmentPlans = useMemo(
    () => treatmentPlans.filter(isApprovedTreatmentPlan),
    [treatmentPlans]
  )
  const selectedTreatmentPlan = useMemo(
    () => approvedTreatmentPlans.find((plan) => String(plan.plan_id) === treatmentPlanId) ?? null,
    [approvedTreatmentPlans, treatmentPlanId]
  )
  const alignerOptions = useMemo(
    () =>
      arrayOfAligners({
        upper_jaw:
          selectedTreatmentPlan?.aligner_details_meta_data?.upper_jaw_details ??
          (selectedTreatmentPlan as QuickCheckInPlan | null)?.upper_jaw_details,
        lower_jaw:
          selectedTreatmentPlan?.aligner_details_meta_data?.lower_jaw_details ??
          (selectedTreatmentPlan as QuickCheckInPlan | null)?.lower_jaw_details,
      }),
    [selectedTreatmentPlan]
  )
  const treatmentPlanSelectOptions = useMemo(
    () =>
      approvedTreatmentPlans.map((plan) => ({
        value: String(plan.plan_id),
        label: getTreatmentPlanDisplayName(plan),
      })),
    [approvedTreatmentPlans]
  )
  const alignerSelectOptions = useMemo(
    () =>
      alignerOptions.map((option) => ({
        value: option.value,
        label: option.label,
      })),
    [alignerOptions]
  )
  const imagePreviewFiles = useMemo(
    () => selectedFiles.filter((item) => item.type === 'image'),
    [selectedFiles]
  )

  useEffect(() => {
    if (!alignerNumber) return
    if (alignerOptions.some((option) => String(option.value) === alignerNumber)) return
    setAlignerNumber('')
  }, [alignerNumber, alignerOptions])

  useEffect(() => {
    if (!isImageViewerOpen) return
    if (imagePreviewFiles.length === 0) {
      setIsImageViewerOpen(false)
      setActiveImagePreviewIndex(0)
      return
    }
    if (activeImagePreviewIndex >= imagePreviewFiles.length) {
      setActiveImagePreviewIndex(imagePreviewFiles.length - 1)
    }
  }, [activeImagePreviewIndex, imagePreviewFiles.length, isImageViewerOpen])

  useEffect(() => {
    if (!isOpen) return
    if (approvedTreatmentPlans.length !== 1) return

    const onlyPlanId = String(approvedTreatmentPlans[0].plan_id)
    if (treatmentPlanId === onlyPlanId) return

    setTreatmentPlanId(onlyPlanId)
    if (error.toLowerCase().includes('treatment plan')) {
      setError('')
    }
  }, [approvedTreatmentPlans, error, isOpen, treatmentPlanId])

  useEffect(() => {
    if (!isOpen) return
    if (!patientId || !parsedUserId) {
      setTreatmentPlans([])
      return
    }

    let isActive = true
    const loadTreatmentPlans = async () => {
      setLoadingPlans(true)
      setPlansError('')
      setTreatmentPlans([])
      const action = await dispatchAction(
        getNewTreatmentList({
          doctor_id: parsedUserId,
          patient_id: patientId,
          treatment_subtype: 'ALIGNERS',
          ...(orderId && {order_id: orderId}),
          is_latest_order_plan_required: !orderId,
          is_only_approved: true,
        })
      )

      if (!isActive) return

      if (getNewTreatmentList.fulfilled.match(action)) {
        const plansList = action.payload?.plans_list ?? []
        setTreatmentPlans(Array.isArray(plansList) ? plansList : [])
      } else {
        setTreatmentPlans([])
        setPlansError('Unable to load treatment plans.')
      }
      setLoadingPlans(false)
    }

    void loadTreatmentPlans()

    return () => {
      isActive = false
    }
  }, [dispatchAction, isOpen, patientId, parsedUserId])

  if (!isOpen) return null

  const clearSelectedFiles = () => {
    setSelectedFiles((previousFiles) => {
      previousFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      return []
    })
  }

  const resetState = () => {
    setTreatmentPlanId('')
    setAlignerNumber('')
    formikRef.current?.setFieldValue('notes', '', false)
    formikRef.current?.setFieldTouched('notes', false, false)
    clearSelectedFiles()
    setError('')
    setPlansError('')
    setFileLimitError('')
    setIsImageViewerOpen(false)
    setActiveImagePreviewIndex(0)
    setActivePdfPreview(null)
    setIsSaving(false)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles) return
    const selectedFilesArray = Array.from(selectedFiles).filter((file) => {
      const fileType = file.type.toLowerCase()
      return fileType.startsWith('image/') || fileType === 'application/pdf'
    })
    setSelectedFiles((previousFiles) => {
      const existingFileKeys = new Set(previousFiles.map((item) => getAttachmentFileKey(item.file)))
      const nextFiles = [...previousFiles]
      let reachedLimit = false

      selectedFilesArray.forEach((file) => {
        const fileKey = getAttachmentFileKey(file)
        const nextAttachment: QuickCheckInAttachment = {
          file,
          previewUrl: URL.createObjectURL(file),
          type: file.type.toLowerCase() === 'application/pdf' ? 'pdf' : 'image',
        }

        if (existingFileKeys.has(fileKey)) {
          URL.revokeObjectURL(nextAttachment.previewUrl)
          return
        }
        if (nextFiles.length >= MAX_CHECK_IN_ATTACHMENTS) {
          reachedLimit = true
          URL.revokeObjectURL(nextAttachment.previewUrl)
          return
        }
        existingFileKeys.add(fileKey)
        nextFiles.push(nextAttachment)
      })

      if (reachedLimit) {
        setFileLimitError(`Maximum ${MAX_CHECK_IN_ATTACHMENTS} attachments allowed.`)
      } else {
        setFileLimitError('')
      }

      return nextFiles
    })
    event.target.value = ''
  }

  const handlePreviewAttachment = (attachment: QuickCheckInAttachment) => {
    if (attachment.type === 'pdf') {
      setActivePdfPreview(attachment)
      return
    }
    const previewIndex = imagePreviewFiles.findIndex(
      (item) => item.previewUrl === attachment.previewUrl
    )
    if (previewIndex >= 0) {
      setActiveImagePreviewIndex(previewIndex)
      setIsImageViewerOpen(true)
    }
  }

  const handleDeleteAttachment = (fileKey: string) => {
    const activeImagePreviewUrl = isImageViewerOpen
      ? imagePreviewFiles[activeImagePreviewIndex]?.previewUrl
      : null

    setSelectedFiles((previousFiles) =>
      previousFiles.filter((item) => {
        const currentFileKey = getAttachmentFileKey(item.file)
        const shouldDelete = currentFileKey === fileKey
        if (shouldDelete) {
          URL.revokeObjectURL(item.previewUrl)
          if (activeImagePreviewUrl && activeImagePreviewUrl === item.previewUrl) {
            setIsImageViewerOpen(false)
            setActiveImagePreviewIndex(0)
          }
          if (activePdfPreview?.previewUrl === item.previewUrl) {
            setActivePdfPreview(null)
          }
        }
        return !shouldDelete
      })
    )
    setFileLimitError('')
  }

  const handleSave = async () => {
    if (isSaving) return
    if (!treatmentPlanId) {
      setError('Treatment Plan is required')
      return
    }

    if (!alignerNumber) {
      setError('Aligner Number is required')
      return
    }

    const selectedPlan = approvedTreatmentPlans.find(
      (plan) => String(plan.plan_id) === treatmentPlanId
    )
    if (!selectedPlan) {
      setError('Please select a valid approved treatment plan')
      return
    }

    if (alignerOptions.length === 0) {
      setError('No valid aligner numbers found for selected treatment plan')
      return
    }

    const alignerValues = alignerOptions
      .map((option) => Number(option.value))
      .filter((value) => Number.isFinite(value) && value > 0)

    if (alignerValues.length === 0) {
      setError('No valid aligner numbers found for selected treatment plan')
      return
    }

    const startAlignerNumber = Math.min(...alignerValues)
    const endAlignerNumber = Math.max(...alignerValues)
    const totalAlignersCandidate =
      selectedPlan.total_stages ?? selectedPlan.stages ?? selectedPlan.total_aligner
    const totalAligners =
      Number(totalAlignersCandidate) > 0 ? Number(totalAlignersCandidate) : alignerValues.length
    const notes = formikRef.current?.values?.notes ?? ''
    const uniqueFiles = Array.from(
      new Map(selectedFiles.map((item) => [getAttachmentFileKey(item.file), item.file])).values()
    )

    setIsSaving(true)
    try {
      await Promise.resolve(
        onSave({
          treatmentPlanId: selectedPlan.plan_id,
          treatmentPlanName: getTreatmentPlanDisplayName(selectedPlan),
          alignerNumber,
          startAlignerNumber,
          endAlignerNumber,
          totalAligners,
          notes,
          files: uniqueFiles,
        })
      )

      resetState()
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    resetState()
    onClose()
  }

  return (
    <>
      <div className='fixed inset-0 z-[1000] overflow-y-auto bg-black/40 p-4'>
        <div className='flex min-h-full items-start justify-center py-4'>
          <div className='flex max-h-[calc(100vh-4rem)] w-full max-w-md flex-col rounded-lg bg-white shadow-xl'>
            <div className='flex items-center justify-between border-b border-gray-200 px-6 py-4'>
              <h2 className='text-xl font-semibold text-gray-900'>Aligner Check-In</h2>
              <button
                type='button'
                onClick={handleCancel}
                disabled={isSaving}
                className='text-gray-400 transition-colors hover:text-gray-700'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <div className='min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5'>
              <Formik
                innerRef={formikRef}
                initialValues={{
                  treatmentPlan: treatmentPlanId,
                  alignerNumber: alignerNumber,
                  notes: formikRef.current?.values?.notes ?? '',
                }}
                enableReinitialize
                onSubmit={() => undefined}
              >
                {() => (
                  <>
                    <div>
                      <label
                        htmlFor='treatmentPlan'
                        className='mb-1 block text-sm font-medium text-gray-700'
                      >
                        Treatment Plan <span className='text-red-500'>*</span>
                      </label>
                      {loadingPlans ? (
                        <div className='mb-2'>
                          <Spinner loading size={14} />
                        </div>
                      ) : null}
                      <p className='mb-2 text-xs text-gray-500'>
                        Select an approved treatment plan for this check-in
                      </p>
                      <FormikSelectList
                        name='treatmentPlan'
                        items={treatmentPlanSelectOptions}
                        placeholder='Select treatment plan'
                        onChangeMapperFunc={(value) => value}
                        onChangeSuccess={(selectedOption) => {
                          setTreatmentPlanId(String(selectedOption?.value ?? ''))
                          if (error) setError('')
                        }}
                        disabled={loadingPlans || approvedTreatmentPlans.length === 0}
                        showSearch
                      />
                      {plansError ? (
                        <p className='mt-1 text-xs text-red-500'>{plansError}</p>
                      ) : null}
                      {error.toLowerCase().includes('treatment plan') ? (
                        <p className='mt-1 text-xs text-red-500'>{error}</p>
                      ) : null}
                      {!loadingPlans && !plansError && approvedTreatmentPlans.length === 0 ? (
                        <p className='mt-1 text-xs text-amber-600'>
                          No approved treatment plans found for this patient.
                        </p>
                      ) : null}
                    </div>

                    <div className='mt-5'>
                      <label
                        htmlFor='alignerNumber'
                        className='mb-1 block text-sm font-medium text-gray-700'
                      >
                        Aligner Number <span className='text-red-500'>*</span>
                      </label>
                      <p className='mb-2 text-xs text-gray-500'>
                        Select the aligner number from selected treatment plan upper/lower jaw
                        ranges
                      </p>
                      <FormikSelectList
                        name='alignerNumber'
                        items={alignerSelectOptions}
                        placeholder={
                          !selectedTreatmentPlan
                            ? 'Select treatment plan first'
                            : alignerOptions.length === 0
                              ? 'No aligner range found'
                              : 'Select aligner number'
                        }
                        onChangeMapperFunc={Number}
                        onChangeSuccess={(selectedOption) => {
                          setAlignerNumber(String(selectedOption?.value ?? ''))
                          if (error) setError('')
                        }}
                        disabled={!selectedTreatmentPlan || alignerOptions.length === 0}
                        showSearch
                      />
                      {error.toLowerCase().includes('aligner') ? (
                        <p className='mt-1 text-xs text-red-500'>{error}</p>
                      ) : null}
                      {selectedTreatmentPlan && alignerOptions.length === 0 ? (
                        <p className='mt-1 text-xs text-amber-600'>
                          No aligner data available for selected treatment plan.
                        </p>
                      ) : null}
                    </div>

                    <FormikInputTextArea
                      name='notes'
                      label='Notes'
                      placeholder='Add any additional notes or observations...'
                      rows={4}
                      className='w-full resize-none break-all rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primaryColor focus:outline-none focus:ring-1 focus:ring-primaryColor'
                      style={{
                        overflowWrap: 'anywhere',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }}
                    />
                  </>
                )}
              </Formik>

              <div>
                <label
                  htmlFor='fileUpload'
                  className='mb-1 block text-sm font-medium text-gray-700'
                >
                  File Upload
                </label>
                <p className='mb-2 text-xs text-gray-500'>Upload images or PDF files</p>
                <label
                  htmlFor='fileUpload'
                  className='flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 transition-colors hover:border-primaryColor'
                >
                  <Upload className='h-4 w-4 text-gray-500' />
                  <span className='text-sm text-gray-600'>
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) selected`
                      : 'Click to upload files'}
                  </span>
                </label>
                <input
                  id='fileUpload'
                  type='file'
                  accept='image/*,.pdf'
                  multiple
                  onChange={handleFileChange}
                  className='hidden'
                />
                {fileLimitError ? (
                  <p className='mt-1 text-xs text-red-500'>{fileLimitError}</p>
                ) : null}
                {selectedFiles.length > 0 ? (
                  <div className='mt-2 flex flex-wrap gap-2'>
                    {selectedFiles.map((item) => {
                      const fileKey = getAttachmentFileKey(item.file)
                      return (
                        <div
                          key={fileKey}
                          className='w-20 rounded-md border border-gray-200 bg-gray-50 p-2'
                        >
                          <div className='flex items-center justify-center'>
                            {item.type === 'image' ? (
                              <DsImage
                                src={item.previewUrl}
                                alt={item.file.name}
                                className='h-12 w-12 rounded object-cover'
                                showLoading
                                size={10}
                              />
                            ) : (
                              <div className='flex h-12 w-12 items-center justify-center rounded border border-gray-200 bg-white'>
                                <FileText className='h-5 w-5 text-primaryColor' />
                              </div>
                            )}
                          </div>
                          <p className='mt-1 truncate text-[10px] leading-4 text-gray-600'>
                            {item.file.name}
                          </p>
                          <div className='mt-1 flex items-center justify-between'>
                            <button
                              type='button'
                              onClick={() => handlePreviewAttachment(item)}
                              className='rounded p-1 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800'
                              aria-label='Preview file'
                            >
                              <Eye className='h-3.5 w-3.5' />
                            </button>
                            <button
                              type='button'
                              onClick={() => handleDeleteAttachment(fileKey)}
                              className='rounded p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600'
                              aria-label='Delete file'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className='flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4'>
              <button
                type='button'
                onClick={handleCancel}
                disabled={isSaving}
                className='rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={() => {
                  void handleSave()
                }}
                disabled={isSaving || loadingPlans || approvedTreatmentPlans.length === 0}
                className='rounded-md bg-primaryColor px-4 py-2 text-sm font-medium text-white transition-colors hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {activePdfPreview ? (
        <PDFWebview
          pdfUrl={activePdfPreview.previewUrl}
          fileName={activePdfPreview.file.name}
          onBack={() => setActivePdfPreview(null)}
        />
      ) : null}

      {isImageViewerOpen && imagePreviewFiles.length > 0 ? (
        <ImageViewer
          selectedImagesList={imagePreviewFiles.map((item) => ({src: item.previewUrl}))}
          selectedIndex={Math.min(activeImagePreviewIndex, imagePreviewFiles.length - 1)}
          setIsShowPhotos={(isVisible: boolean) => {
            setIsImageViewerOpen(isVisible)
            if (!isVisible) {
              setActiveImagePreviewIndex(0)
            }
          }}
        />
      ) : null}
    </>
  )
}
