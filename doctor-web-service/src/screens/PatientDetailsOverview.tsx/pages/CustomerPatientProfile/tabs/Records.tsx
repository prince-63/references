import userTypes from '@constants/userTypes'
import useDispatchAction from '@hooks/useDispatchAction'
import Page from 'components/page/Page'
import {AuthContext} from 'context/AuthContext'
import {downloadBlob} from 'utils/download'
import JSZip from 'jszip'
import {ReactNode, useContext, useEffect, useState} from 'react'
import {useSelector} from 'react-redux'
import {useParams, useSearchParams} from 'react-router-dom'
import {CaseRecordResponse, CaseRecordFile} from 'redux/Slices/AppSlice/CaseRecords/CaseRecord.type'
import {
  getAllCaseRecord,
  resetCaseRecordState,
} from 'redux/Slices/AppSlice/CaseRecords/CaseRecords.slice'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {RootState} from 'redux/store'
import {AddCaseRecordModal} from 'screens/PatientDetailsOverview.tsx/tabs/CaseFiles'
import {safeParseInt} from 'utils/ConstFunctions'
import EmptyState from '../components/EmptyState'
import TabSectionCard from '../components/TabSectionCard'
import dayjs from 'dayjs'
import CollapseCardWithBorder from '../components/CollapseCardWithBorder'
import {Activity, Box, Download, FileText, FilesIcon, ImageIcon} from 'lucide-react'
import '../styles/records.css'
import {Image} from 'antd'
import FileCard from '../components/File'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {getFileType, getImageUrl, openDocument} from 'utils/ConstFunctions'
import PdfIconNew from 'assets/icons/PdfIconNew'
import {isAppView} from 'utils/isAppView'

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }

type FileSectionMode = 'thumbnail' | 'list'

const Records = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams<{patientId: string}>()
  const [searchParams] = useSearchParams()
  const orderIdFromUrl = searchParams.get('order_id') || undefined
  const {userId} = useContext(AuthContext)

  const {allCaseRecords: allCaseRecordsRaw, loadingGetAll} = useSelector(
    (state: RootState) => state.caseRecord
  )
  const allCaseRecords: CaseRecordResponse[] = allCaseRecordsRaw ?? []
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCaseRecordId, setSelectedCaseRecordId] = useState<number | null>(null)
  const [optimisticRecords, setOptimisticRecords] = useState<CaseRecordResponse[]>([])

  useEffect(() => {
    dispatchAction(resetCaseRecordState())
    setOptimisticRecords([])
    if (patientId) {
      getAllCaseRecords()
    }
  }, [patientId, orderIdFromUrl])

  const getAllCaseRecords = async () => {
    dispatchAction(resetCaseRecordState())
    await dispatchAction(
      getAllCaseRecord({patient_id: safeParseInt(patientId), orderId: orderIdFromUrl})
    )
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

  useEffect(() => {
    const actualRecords = allCaseRecordsRaw ?? []
    setOptimisticRecords((prev) =>
      prev.filter(
        (record) => !actualRecords.some((item) => item.case_record_id === record.case_record_id)
      )
    )
  }, [allCaseRecordsRaw])

  const recordsToDisplay = [...optimisticRecords, ...allCaseRecords]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .map((record, index, arr) => ({
      ...record,
      recordNumber: arr.length - index,
    }))

  return (
    <Page loading={loadingGetAll}>
      <TabSectionCard
        title='Submission History'
        buttonText={'Record'}
        onClick={() => {
          handleOpenModal()
        }}
      >
        {recordsToDisplay.length === 0 ? (
          <EmptyState title='No Records Uploaded' />
        ) : (
          <div className='flex flex-col gap-4'>
            {recordsToDisplay?.map((record, index) => {
              return (
                <CollapseCardWithBorder
                  title={
                    <div className='flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4'>
                      <div className='flex gap-3 md:gap-4 items-center'>
                        <div className='flex justify-center rounded-2xl items-center w-12 h-12 md:w-16 md:h-16 shrink-0 bg-primaryColor'>
                          <FilesIcon color='#fff' size={20} />
                        </div>
                        <div>
                          <div className='text-sm md:text-base font-semibold'>
                            Record {record.recordNumber}
                          </div>
                          <div className='text-xs md:text-sm font-medium text-slate-400 tracking-[0.14em]'>
                            {record?.created_at
                              ? dayjs(record.created_at).format('MMM DD, YYYY • hh:mm A')
                              : '-'}
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  position='end'
                  defaultOpen={index === 0}
                  key={record.case_record_id ?? index}
                >
                  <div className='w-full flex flex-col gap-6 mt-4'>
                    <FileSections
                      title='Photographs'
                      icon={getIcon('Photographs')}
                      files={record?.pre_treatment_files}
                      mode='thumbnail'
                      userId={userId}
                      dispatchAction={dispatchAction}
                    />
                    <FileSections
                      title='Scan files'
                      icon={getIcon('Scan files')}
                      files={record?.scan_files}
                      mode='list'
                      userId={userId}
                      dispatchAction={dispatchAction}
                    />
                    <FileSections
                      title='Radiographs'
                      icon={getIcon('Radiographs')}
                      files={record?.xray_files}
                      mode='thumbnail'
                      userId={userId}
                      dispatchAction={dispatchAction}
                    />
                  </div>
                </CollapseCardWithBorder>
              )
            })}
          </div>
        )}
      </TabSectionCard>
      <AddCaseRecordModal
        isModalVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCaseRecordId(null)
          setIsEditMode(false) // reset edit mode
        }}
        patientId={String(patientId)}
        caseRecordId={selectedCaseRecordId ?? undefined}
        isEditMode={isEditMode}
        onCaseRecordCreated={handleCaseRecordCreated}
        onSuccess={() => {
          setIsModalOpen(false) // ✅ close modal after save
          setSelectedCaseRecordId(null)
          setIsEditMode(false)
          const id = safeParseInt(patientId) ?? data?.patient_details?.id
          // optional: refresh case records
          if (id) {
            dispatchAction(
              getAllCaseRecord({
                patient_id: id,
                orderId: orderIdFromUrl ?? null,
              })
            )
          }
        }}
      />
    </Page>
  )
}

export default Records

export const FileSections = ({
  title,
  icon,
  files,
  mode = 'list',
  useDocumentThumbnailIcon = false,
  userId,
  dispatchAction,
}: {
  title: string
  icon: ReactNode
  files: CaseRecordFile[]
  mode?: FileSectionMode
  useDocumentThumbnailIcon?: boolean
  userId: string | null
  dispatchAction: ReturnType<typeof useDispatchAction>['dispatchAction']
}) => {
  if (!files || files.length === 0) return null

  const [sectionDownloading, setSectionDownloading] = useState(false)
  const [pdfViewer, setPdfViewer] = useState<{isOpen: boolean; url: string; fileName?: string}>({
    isOpen: false,
    url: '',
    fileName: '',
  })
  const safeFiles = files

  const getPreviewUrl = (record: CaseRecordFile, fileType: string) => {
    if (fileType === 'image') {
      return getImageUrl(record) || record.url || ''
    }

    return record.url || getImageUrl(record) || ''
  }

  const handleDownloadSection = async () => {
    if (!userId || !safeFiles.length) return
    setSectionDownloading(true)
    try {
      const zip = new JSZip()
      let count = 0
      for (const file of safeFiles) {
        try {
          const response = await dispatchAction(
            downloadFile({
              requester_user_id: safeParseInt(userId),
              requester_user_type: userTypes.DOCTOR,
              file_id: safeParseInt(file.file_id),
            })
          ).unwrap()
          const blob = new Blob([response], {type: file?.type || 'application/octet-stream'})
          zip.file(file?.name || `file-${file?.file_id}.dat`, blob)
          count++
        } catch (err) {
          console.error(`Error downloading file_id ${file?.file_id}`, err)
        }
      }
      if (count > 0) {
        const zipBlob = await zip.generateAsync({type: 'blob'})

        if (isAppView() && window.ReactNativeWebView) {
          const base64Zip = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const result = String(reader.result || '')
              const base64 = result.includes(',') ? result.split(',')[1] : result
              resolve(base64)
            }
            reader.onerror = () => reject(new Error('Unable to prepare ZIP for download'))
            reader.readAsDataURL(zipBlob)
          })

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              file_name: `${title.replace(/\s+/g, '_')}_files.zip`,
              file_type: 'application/zip',
              file_base64: base64Zip,
            })
          )
          return
        }

        downloadBlob(zipBlob, `${title.replace(/\s+/g, '_')}_files.zip`)
      }
    } finally {
      setSectionDownloading(false)
    }
  }

  const handleThumbnailClick = (record: CaseRecordFile) => {
    const fileType = getFileType(record)
    const resolvedUrl = getPreviewUrl(record, fileType)
    if (fileType === 'pdf') {
      if (!resolvedUrl) return
      setPdfViewer({isOpen: true, url: resolvedUrl, fileName: record.name})
      return
    }
    if (fileType === 'video') {
      openDocument(resolvedUrl)
      return
    }
  }

  return (
    <div className='w-full'>
      {pdfViewer.isOpen && (
        <PDFWebview
          pdfUrl={pdfViewer.url}
          onBack={() => setPdfViewer({isOpen: false, url: '', fileName: ''})}
          fileName={pdfViewer.fileName}
        />
      )}
      <div className='flex items-center justify-between mb-3'>
        <div className='section-title !mb-0'>{title}</div>
        <button
          onClick={handleDownloadSection}
          disabled={sectionDownloading}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            sectionDownloading
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-primaryColor hover:text-primaryColor/80'
          }`}
        >
          {sectionDownloading ? (
            <svg className='animate-spin h-3.5 w-3.5' viewBox='0 0 24 24' fill='none'>
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
              />
            </svg>
          ) : (
            <Download size={14} />
          )}
          {sectionDownloading ? 'Downloading...' : 'Download'}
        </button>
      </div>

      {mode === 'thumbnail' ? (
        <Image.PreviewGroup
          preview={{
            countRender: (current, total) => `${current} / ${total}`,
          }}
        >
          <div className='flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:gap-3'>
            {safeFiles.map((record: CaseRecordFile, index: number) => {
              const ext = record.extension?.toLowerCase() || ''
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)
              const isPdf = ext === 'pdf'
              const isDoc = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'].includes(
                ext
              )

              if (isImage) {
                const imageUrl = getImageUrl(record) || record.url
                if (!imageUrl) return null
                return (
                  <Image
                    key={index}
                    src={imageUrl}
                    preview={{src: imageUrl}}
                    alt={record.name}
                    className='!h-[100px] !w-[100px] !rounded-xl !object-cover sm:!h-[120px] sm:!w-[120px]'
                    style={{borderRadius: 12, objectFit: 'cover'}}
                    rootClassName='shrink-0'
                    fallback='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNGMUY1RjkiLz48L3N2Zz4='
                  />
                )
              }

              return (
                <div
                  key={index}
                  onClick={() => handleThumbnailClick(record)}
                  className='h-[100px] w-[100px] sm:h-[120px] sm:w-[120px] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-2 p-2 shrink-0 cursor-pointer hover:shadow-md transition-all'
                >
                  {isPdf ? (
                    <PdfIconNew />
                  ) : isDoc || useDocumentThumbnailIcon ? (
                    <FileText size={32} className='text-primaryColor' />
                  ) : (
                    icon
                  )}
                  <span className='text-[10px] text-gray-500 text-center truncate w-full'>
                    {record.name}
                  </span>
                </div>
              )
            })}
          </div>
        </Image.PreviewGroup>
      ) : (
        <div className='flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide pb-1'>
          {safeFiles.map((record: CaseRecordFile, index: number) => (
            <div key={index} className='shrink-0'>
              <FileCard record={record} icon={icon} hideDownloadIcon />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const getIcon = (imageType: string) => {
  switch (imageType) {
    case 'Photographs':
      return (
        <div className='file-icon  bg-primarySupport text-primaryColor'>
          <ImageIcon size={22} />
        </div>
      )
    case 'Scan files':
      return (
        <div className='file-icon bg-secondarySupport text-secondaryColor'>
          <Box size={22} />
        </div>
      )
    case 'Radiographs':
      return (
        <div className='file-icon bg-tertiarySupport text-tertiaryColor'>
          <Activity size={22} />
        </div>
      )
    default:
      break
  }
}
