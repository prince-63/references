import {useContext, useEffect, useRef, useState} from 'react'
import {Plus, Edit, Trash2, Eye, Download, MoreVertical} from 'lucide-react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import ModalLayout from 'components/modal/ModalLayout'
import {CaseRecordsForm} from 'screens/CaseRecords/components'
import {getAllCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {CaseRecordFile, CaseRecordResponse} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {deleteCaseRecord} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import getColorPalette from 'utils/getColorPalette'
import {safeParseInt} from 'utils/ConstFunctions'
import Page from 'components/page/Page'
import {DeleteCaseRecordModal} from '../components/DeleteCaseRecordModal'
import {useParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import JSZip from 'jszip'
import {downloadBlob} from 'utils/download'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import AntdMessage from 'components/modal/Alert/AntdMessage'
import Spinner from 'components/spinner/Spinner'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {Dropdown} from 'antd'
import type {MenuProps} from 'antd'
import EmptyDataCard from 'components/atom/EmptyState/EmptyDataCard'
import useAllUserPlan from '@hooks/useAllUserPlan'

interface AddCaseRecordModalProps {
  isModalVisible: boolean
  onClose: () => void
  patientId: string
  caseRecordId?: number
  isEditMode?: boolean
  onSuccess?: () => void
  onCaseRecordCreated?: (record: CaseRecordResponse) => void
}

export const AddCaseRecordModal = ({
  isModalVisible,
  onClose,
  patientId,
  caseRecordId,
  isEditMode = false,
  onSuccess,
  onCaseRecordCreated,
}: AddCaseRecordModalProps) => {
  const submitFormRef = useRef<(() => Promise<boolean>) | null>(null)
  const {uploadingFiles} = useSelector((state: RootState) => state.leadsProfileFiles)
  const [hasUploaderInProgress, setHasUploaderInProgress] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!isModalVisible) return null

  const handleSave = async () => {
    if (isSaving) return
    if (submitFormRef.current) {
      setIsSaving(true)
      try {
        const wasSuccessful = await submitFormRef.current() // wait for form submit
        if (wasSuccessful) {
          onSuccess?.() // ✅ close modal after success
        }
      } finally {
        setIsSaving(false)
      }
    }
  }

  const isViewMode = !!caseRecordId && !isEditMode
  const isUploading = uploadingFiles || hasUploaderInProgress
  const isSubmitting = isUploading || isSaving
  return (
    <ModalLayout
      isResponsive
      className='md:!w-[60%] !h-[100vh] flex flex-col'
      title={
        caseRecordId ? (
          isEditMode ? (
            `Upload Case Record`
          ) : (
            `View Case Record #${caseRecordId}`
          )
        ) : (
          <div>
            <h2 className='text-xl font-semibold'>Upload Case Record</h2>
            <p className='text-textColor font-normal text-sm'>
              Upload all relevant files to maintain complete case documentation.
            </p>
          </div>
        )
      }
      onClose={onClose}
    >
      <div className='flex-1 overflow-y-auto pb-28'>
        <CaseRecordsForm
          hideSectionHeader
          hideChiefComplaint
          patientId={safeParseInt(patientId)}
          // pass to form to load existing data
          onSubmitRef={(handleSubmit) => {
            submitFormRef.current = handleSubmit
          }}
          isEditMode={isEditMode}
          caseRecordId={caseRecordId}
          onUploadingChange={setHasUploaderInProgress}
          onCreateSuccess={onCaseRecordCreated}
        />
      </div>
      {!isViewMode && (
        <div className='absolute bottom-0 left-0 right-0 border-t pt-4 pb-4 pr-4 bg-white z-50 flex justify-end'>
          <div className='flex flex-wrap w-full sm:w-1/2 md:w-auto justify-end gap-2 ml-auto'>
            {(!caseRecordId || isEditMode) && (
              <AntdButton
                onClick={handleSave}
                text={isUploading ? 'Uploading files...' : isSaving ? 'Saving...' : 'Save'}
                className='h-[3rem] w-full sm:w-auto min-w-[10rem] font-semibold rounded-lg bg-primaryColor hover:bg-primaryColor font-figtree shadow-sm'
                loading={isSubmitting}
                disabled={isSubmitting}
              />
            )}
          </div>
        </div>
      )}
    </ModalLayout>
  )
}

export const CaseFiles = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dispatchAction} = useDispatchAction()
  const palette = getColorPalette()
  const {patientId} = useParams<{patientId: string}>()
  const {userId} = useContext(AuthContext)

  const {
    allCaseRecords: allCaseRecordsRaw,
    loadingGetAll,
    loadingDelete,
  } = useSelector((state: RootState) => state.caseRecord)
  const allCaseRecords: CaseRecordResponse[] = allCaseRecordsRaw ?? []

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCaseRecordId, setSelectedCaseRecordId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [caseRecordIdToDelete, setCaseRecordIdToDelete] = useState<number | null>(null)
  const [optimisticRecords, setOptimisticRecords] = useState<CaseRecordResponse[]>([])
  const [recordDownloadingId, setRecordDownloadingId] = useState<number | null>(null)
  const {permissionChecks} = useFeatureAccess()
  const {isStarterPlanUser, isGrowthPlanUser, isPractice} = useAllUserPlan()
  const isCustomerScanFileViewEnabled = data?.is_customer_scan_file_view_enabled
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const caseFilesAccess = permissionChecks?.patientProfileActions?.caseFiles
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    getAllCaseRecords()
  }, [patientId])

  useEffect(() => {
    setOptimisticRecords([])
  }, [patientId])

  const getAllCaseRecords = async () => {
    const idFromUrl = hasValue(patientId) ? safeParseInt(patientId) : null
    const id = idFromUrl || data?.patient_details?.id || null
    if (id) {
      await dispatchAction(getAllCaseRecord({patient_id: id}))
    }
  }

  const openDeleteModal = (id: number) => {
    setCaseRecordIdToDelete(id)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setCaseRecordIdToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (caseRecordIdToDelete == null) return
    try {
      await dispatchAction(deleteCaseRecord(caseRecordIdToDelete)).unwrap()
      setOptimisticRecords((prev) =>
        prev.filter((record) => record.case_record_id !== caseRecordIdToDelete)
      )
      getAllCaseRecords()
    } catch (err) {
      console.error('Failed to delete case record', err)
    } finally {
      closeDeleteModal()
    }
  }
  const handleCaseRecordCreated = (record: CaseRecordResponse) => {
    if (!record) return
    setOptimisticRecords((prev) => {
      const recordId = record.case_record_id
      if (
        prev.some((item) => item.case_record_id === recordId) ||
        allCaseRecords.some((item) => item.case_record_id === recordId)
      ) {
        return prev
      }
      return [record, ...prev]
    })
  }
  const handleOpenModal = () => {
    setSelectedCaseRecordId(null) // reset ID
    setIsEditMode(false) // reset edit mode
    setIsModalOpen(true)
  }
  //const handleCloseModal = () => setIsModalOpen(false)

  useEffect(() => {
    const actualRecords = allCaseRecordsRaw ?? []
    setOptimisticRecords((prev) =>
      prev.filter(
        (record) => !actualRecords.some((item) => item.case_record_id === record.case_record_id)
      )
    )
  }, [allCaseRecordsRaw])

  const recordsToDisplay = [...optimisticRecords, ...allCaseRecords]

  const gatherFilesFromRecord = (record: CaseRecordResponse) => {
    const groups = [
      record?.pre_treatment_files ?? [],
      record?.scan_files ?? [],
      record?.xray_files ?? [],
    ]
    const uniqueFiles = new Map<number, CaseRecordFile>()
    groups.forEach((files) => {
      files.forEach((file) => {
        if (file?.file_id) {
          uniqueFiles.set(file.file_id, file)
        }
      })
    })
    return Array.from(uniqueFiles.values())
  }

  const handleDownloadRecord = async (record: CaseRecordResponse) => {
    const files = gatherFilesFromRecord(record)
    if (!files.length) {
      AntdMessage({type: 'info', text: 'No files available to download for this case record'})
      return
    }
    if (!userId) {
      AntdMessage({type: 'error', text: 'Unable to download files. Missing user context.'})
      return
    }

    try {
      setRecordDownloadingId(record.case_record_id)
      const zip = new JSZip()
      let successfulDownloads = 0
      for (const file of files) {
        try {
          const response = await dispatchAction(
            downloadFile({
              requester_user_id: safeParseInt(userId),
              requester_user_type: userTypes.DOCTOR,
              file_id: safeParseInt(file.file_id),
            })
          ).unwrap()

          const blob = new Blob([response], {
            type: file?.type || 'application/octet-stream',
          })

          zip.file(file?.name || `file-${file?.file_id}.dat`, blob)
          successfulDownloads += 1
        } catch (err) {
          console.error(`Error downloading file_id ${file?.file_id}`, err)
        }
      }

      if (successfulDownloads === 0) {
        AntdMessage({type: 'error', text: 'Unable to download case files'})
        return
      }

      const zipBlob = await zip.generateAsync({type: 'blob'})
      downloadBlob(zipBlob, `CaseRecord_${record.case_record_id}_files.zip`)
      SuccessToast('Case files downloaded successfully')
    } catch (err) {
      AntdMessage({type: 'error', text: 'Error downloading case files'})
    } finally {
      setRecordDownloadingId(null)
    }
  }

  return (
    <Page loading={loadingGetAll}>
      <div className='w-full mx-auto flex flex-col min-h-0 h-full'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6 gap-2'>
          <h2 className='text-lg font-semibold text-gray-900'>Case Files</h2>
          <div className='flex items-center gap-2'>
            {((caseFilesAccess?.isAddable && serviceConfig?.ALIGNER_PLANNING_MANUFACTURING) ||
              isStarterPlanUser ||
              (isPractice && serviceConfig?.PLANNING)) && (
              <button
                onClick={handleOpenModal}
                style={{
                  background: palette.primaryColor,
                  border: `1px solid ${palette.primaryColor}`,
                  color: palette.white,
                }}
                className='flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm hover:opacity-90'
              >
                <Plus size={20} />
                <span>Add Case Record</span>
              </button>
            )}
          </div>
        </div>

        {recordDownloadingId !== null && (
          <div className='mb-4 flex items-center gap-2 rounded-lg border border-lightGray bg-white px-3 py-2'>
            <Spinner loading size={16} />
            <span className='text-sm text-gray-700'>Downloading case files...</span>
          </div>
        )}

        {/* Empty state */}
        {recordsToDisplay.length === 0 ? (
          <EmptyDataCard emptyText='No case records uploaded yet' />
        ) : (
          <div className='flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1 pb-4'>
            {recordsToDisplay
              .filter((record) => {
                const isCaseRecordAddedByCustomer =
                  record?.is_added_by_customer || record?.is_added_by_admin
                const canViewScanFile =
                  (isPractice || isGrowthPlanUser) && !isCaseRecordAddedByCustomer
                    ? isCustomerScanFileViewEnabled
                    : true
                const hasPhotos = (record?.pre_treatment_files?.length ?? 0) > 0
                const hasXrays = (record?.xray_files?.length ?? 0) > 0
                const hasScans = (record?.scan_files?.length ?? 0) > 0

                if (!canViewScanFile && !hasPhotos && !hasXrays && hasScans) {
                  return false
                }

                return true
              })
              .map((record: CaseRecordResponse) => {
                const actionItems: MenuProps['items'] = []
                const isDownloadingCurrent = recordDownloadingId === record.case_record_id
                const isAnyDownloadInProgress = recordDownloadingId !== null

                if (caseFilesAccess?.isViewable || serviceConfig?.PLANNING) {
                  actionItems.push(
                    {
                      key: 'view',
                      label: (
                        <div className='flex items-center gap-2 text-textColor'>
                          <Eye className='w-4 h-4' />
                          <span>View</span>
                        </div>
                      ),
                    },
                    {
                      key: 'download',
                      disabled: isAnyDownloadInProgress,
                      label: (
                        <div className='flex items-center gap-2 text-textColor'>
                          {isDownloadingCurrent ? (
                            <Spinner loading size={14} />
                          ) : (
                            <Download className='w-4 h-4' />
                          )}
                          <span>{isDownloadingCurrent ? 'Preparing...' : 'Download all'}</span>
                        </div>
                      ),
                    }
                  )
                }

                if (
                  (caseFilesAccess?.isEditable || isStarterPlanUser) &&
                  serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
                ) {
                  actionItems.push({
                    key: 'edit',
                    label: (
                      <div className='flex items-center gap-2 text-textColor'>
                        <Edit className='w-4 h-4' />
                        <span>Edit</span>
                      </div>
                    ),
                  })
                }

                if (
                  (caseFilesAccess?.isDeletable || isStarterPlanUser) &&
                  serviceConfig?.ALIGNER_PLANNING_MANUFACTURING
                ) {
                  actionItems.push({
                    key: 'delete',
                    disabled: loadingDelete,
                    label: (
                      <div className='flex items-center gap-2 text-red'>
                        <Trash2 className='w-4 h-4' color='#f45045' />
                        <span className='text-red'>Delete</span>
                      </div>
                    ),
                  })
                }

                const handleMenuClick: MenuProps['onClick'] = ({key, domEvent}) => {
                  domEvent?.stopPropagation()
                  switch (key) {
                    case 'view':
                      setIsModalOpen(true)
                      setSelectedCaseRecordId(record.case_record_id)
                      setIsEditMode(false)
                      break
                    case 'download':
                      if (recordDownloadingId !== null) return
                      void handleDownloadRecord(record)
                      break
                    case 'edit':
                      setIsModalOpen(true)
                      setSelectedCaseRecordId(record.case_record_id)
                      setIsEditMode(true)
                      break
                    case 'delete':
                      openDeleteModal(record.case_record_id)
                      break
                    default:
                      break
                  }
                }

                const isCaseRecordAddedByCustomer =
                  record?.is_added_by_customer || record?.is_added_by_admin
                const canViewScanFile =
                  (isPractice || isGrowthPlanUser) && !isCaseRecordAddedByCustomer
                    ? isCustomerScanFileViewEnabled
                    : true

                return (
                  <div
                    key={record.case_record_id}
                    className='bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 w-full flex justify-between items-stretch cursor-pointer hover:shadow-md transition-shadow'
                    onClick={() => {
                      setIsModalOpen(true)
                      setSelectedCaseRecordId(record.case_record_id)
                      setIsEditMode(false)
                    }}
                  >
                    <div>
                      <h3 className='text-base md:text-lg font-semibold text-gray-900 mb-2'>
                        Case Record #{record.case_record_id}
                      </h3>
                      <p className='text-sm md:text-base text-gray-900 mb-1'>
                        Photographs:{' '}
                        {record?.pre_treatment_files?.length
                          ? `${record.pre_treatment_files.length} ${
                              record.pre_treatment_files.length === 1 ? 'file' : 'files'
                            }`
                          : '-'}
                      </p>
                      {canViewScanFile && (
                        <p className='text-sm md:text-base text-gray-900 mb-1'>
                          Scan Files:{' '}
                          {record?.scan_files?.length
                            ? `${record.scan_files.length} ${
                                record.scan_files.length === 1 ? 'file' : 'files'
                              }`
                            : '-'}
                        </p>
                      )}
                      <p className='text-sm md:text-base text-gray-900 mb-1'>
                        Radiographs:{' '}
                        {record?.xray_files?.length
                          ? `${record.xray_files.length} ${
                              record.xray_files.length === 1 ? 'file' : 'files'
                            }`
                          : '-'}
                      </p>
                    </div>
                    <div className='ml-4 flex flex-col items-end justify-between'>
                      {actionItems.length > 0 && (
                        <Dropdown
                          menu={{items: actionItems, onClick: handleMenuClick}}
                          trigger={['click']}
                          placement='bottomRight'
                        >
                          <button
                            type='button'
                            onClick={(e) => e.stopPropagation()}
                            className='p-2  rounded-sm hover:!bg-primarySupport  flex-end'
                          >
                            <MoreVertical className='w-5 h-5 hover:!bg-primarySupport  ' />
                          </button>
                        </Dropdown>
                      )}
                      <p className='text-gray-500 text-sm mt-4 text-right'>
                        Created On:{' '}
                        {record.pre_treatment_files.length > 0
                          ? formatDate(record.pre_treatment_files[0].created_at)
                          : record.scan_files.length > 0
                            ? formatDate(record.scan_files[0].created_at)
                            : record.xray_files.length > 0
                              ? formatDate(record.xray_files[0].created_at)
                              : record.created_at
                                ? formatDate(record.created_at)
                                : 'N/A'}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        <AddCaseRecordModal
          isModalVisible={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedCaseRecordId(null)
            setIsEditMode(false) // reset edit mode
          }}
          patientId={data?.patient_details?.id.toString() ?? ''}
          caseRecordId={selectedCaseRecordId ?? undefined}
          isEditMode={isEditMode}
          onCaseRecordCreated={handleCaseRecordCreated}
          onSuccess={() => {
            setIsModalOpen(false) // ✅ close modal after save
            setSelectedCaseRecordId(null)
            setIsEditMode(false)
            // optional: refresh case records
            if (data?.patient_details?.id) {
              dispatchAction(getAllCaseRecord({patient_id: data.patient_details.id}))
            }
          }}
        />

        <DeleteCaseRecordModal
          caseRecordId={caseRecordIdToDelete ?? 0}
          isModalVisible={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmDelete}
          loading={loadingDelete}
        />
      </div>
    </Page>
  )
}
