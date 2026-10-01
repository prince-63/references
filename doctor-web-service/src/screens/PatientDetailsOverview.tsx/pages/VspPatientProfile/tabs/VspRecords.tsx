import {useCallback, useContext, useEffect, useState, useRef} from 'react'
import {useParams, useSearchParams} from 'react-router-dom'
import {Spin, Modal} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {ExternalLink, FileText, Link2, Plus, FilesIcon} from 'lucide-react'
import {useSelector} from 'react-redux'
import TabSectionCard from '../../CustomerPatientProfile/components/TabSectionCard'
import EmptyState from '../../CustomerPatientProfile/components/EmptyState'
import CollapseCardWithBorder from '../../CustomerPatientProfile/components/CollapseCardWithBorder'
import {FileSections, getIcon} from '../../CustomerPatientProfile/tabs/Records'
import {safeParseInt} from 'utils/ConstFunctions'
import dayjs from 'dayjs'
import userTypes from '@constants/userTypes'
import {downloadBlob} from 'utils/download'
import JSZip from 'jszip'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {getVspCaseRecordsByPatient} from 'redux/Slices/AppSlice/VSP/caserecord.slice'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {VspCaseRecordsForm} from 'screens/VSP/CreateOrder/components/VspCaseRecordForm'
import {RootState} from 'redux/store'
import AntdMessage from 'components/modal/Alert/AntdMessage'

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }

type CaseRecordFile = {
  file_id: number
  drive_file_id?: string
  name: string
  url: string
  thumbnail_url?: string
  download_url?: string
  full_path?: string
  extension?: string
  size?: number
  created_at?: string
  is_gdrive_platform?: boolean
}

type CaseRecord = {
  id: number
  order_id: string
  extraoral_photo_files?: CaseRecordFile[]
  intraoral_photo_files?: CaseRecordFile[]
  intraoral_scan_files?: CaseRecordFile[]
  stone_cast_files?: CaseRecordFile[]
  dicom_files?: CaseRecordFile[]
  radio_grap_files?: CaseRecordFile[]
  external_links?: string[]
  created_at?: string
}

const VspRecords = () => {
  const {userId} = useContext(AuthContext)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  const [caseRecords, setCaseRecords] = useState<CaseRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [sectionDownloading, setSectionDownloading] = useState(false)
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()

  const [isCaseRecordFormOpen, setIsCaseRecordFormOpen] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [hasUploaderInProgress, setHasUploaderInProgress] = useState(false)
  const [showExternalLinksConfirmModal, setShowExternalLinksConfirmModal] = useState(false)
  const [externalLinksInForm, setExternalLinksInForm] = useState<string[]>([])
  const submitRef = useRef<(() => Promise<boolean>) | null>(null)
  const {uploadingFiles} = useSelector((state: RootState) => state.leadsProfileFiles)
  const isUploading = uploadingFiles || hasUploaderInProgress
  const isSubmitting = isUploading || isSubmittingForm

  const handleCaseRecordSubmit = async () => {
    if (!submitRef.current) return
    setIsSubmittingForm(true)
    const success = await submitRef.current()
    if (!success) {
      setIsSubmittingForm(false)
    }
  }

  const fetchCaseRecords = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const response = await dispatchAction(
        getVspCaseRecordsByPatient({patient_id: patientId})
      ).unwrap()
      setCaseRecords(Array.isArray(response) ? (response as any[]) : [])
    } catch (error) {
      console.error('Failed to fetch VSP case records', error)
    } finally {
      setLoading(false)
    }
  }, [patientId, dispatchAction])

  useEffect(() => {
    fetchCaseRecords()
  }, [fetchCaseRecords])

  const allPhotos = caseRecords.flatMap((r) => [
    ...(r.extraoral_photo_files ?? []),
    ...(r.intraoral_photo_files ?? []),
  ])
  const allScans = caseRecords.flatMap((r) => [
    ...(r.intraoral_scan_files ?? []),
    ...(r.dicom_files ?? []),
  ])

  const allDicom = caseRecords.flatMap((r) => [...(r.dicom_files ?? [])])
  const hasData = allPhotos.length > 0 || allScans.length > 0 || allDicom.length > 0

  const getZipFileName = () => {
    const suffix = orderId || patientId || 'records'
    return `Clinical_Records_${suffix}.zip`
  }

  const handleDownloadAll = async () => {
    const uniqueFiles = new Map<number, CaseRecordFile>()
    ;[...allPhotos, ...allScans, ...allDicom].forEach((file) => {
      if (file?.file_id) {
        uniqueFiles.set(file.file_id, file)
      }
    })

    const allFiles = Array.from(uniqueFiles.values())
    if (!allFiles.length) {
      AntdMessage({type: 'info', text: 'No files available to download'})
      return
    }
    if (!userId) {
      AntdMessage({type: 'error', text: 'Unable to download files. Missing user context.'})
      return
    }

    const zipFileName = getZipFileName()

    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          zip_name: zipFileName,
          file_details: allFiles.map((file) => ({
            file_id: file.file_id,
            name: file.name,
            url: file.download_url || file.url,
            download_url: file.download_url || file.url,
            type: file.type || 'application/octet-stream',
            extension: file.extension,
          })),
        })
      )
      return
    }

    setSectionDownloading(true)
    try {
      const zip = new JSZip()
      let count = 0
      for (const file of allFiles) {
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
        downloadBlob(zipBlob, zipFileName)
        return
      }

      AntdMessage({type: 'error', text: 'Unable to download files'})
    } catch (error) {
      console.error('Error downloading VSP files', error)
      AntdMessage({type: 'error', text: 'Error downloading files'})
    } finally {
      setSectionDownloading(false)
    }
  }

  const getText = sectionDownloading ? 'Downloading...' : 'Download All (.zip)'

  const extraActionButtons = (
    <button
      onClick={() => setIsCaseRecordFormOpen(true)}
      className='flex items-center gap-1 bg-primaryColor text-white border-primaryColor px-2 py-1.5 rounded-lg border text-sm font-semibold transition-colors uppercase tracking-wide'
      style={{whiteSpace: 'nowrap'}}
    >
      <Plus size={20} />
      <span>Add Case Record</span>
    </button>
  )

  const caseRecordsToDisplay = [...caseRecords]
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
    <>
      <TabSectionCard
        title='Clinical Records'
        buttonText={hasData ? getText : undefined}
        onClick={handleDownloadAll}
        buttonLoading={sectionDownloading}
        extraActionButtons={extraActionButtons}
      >
        <Spin indicator={<Spinner loading />} spinning={loading}>
          {!loading && caseRecordsToDisplay.length === 0 ? (
            <EmptyState title='No Clinical Records' subTitle='No records have been uploaded yet.' />
          ) : (
            <div className='flex flex-col gap-4'>
              {caseRecordsToDisplay.map((record, index) => {
                const intraoral = record.intraoral_photo_files ?? []
                const extraoral = record.extraoral_photo_files ?? []
                const intraoralScanFiles = record.intraoral_scan_files ?? []
                const desiredOcclusionStoneCast = record.stone_cast_files ?? []
                const dicomFiles = record.dicom_files ?? []
                const xrays = record.radio_grap_files ?? [] // replace this if you have a dedicated xrays field
                const externalLinks = (record.external_links ?? [])
                  .map((link) => String(link || '').trim())
                  .filter(Boolean)

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
                    key={record.id ?? index}
                  >
                    <div className='w-full flex flex-col gap-6 mt-4'>
                      <FileSections
                        title='Extra Oral'
                        icon={getIcon('Photographs')}
                        files={extraoral as any}
                        mode='thumbnail'
                        userId={userId}
                        dispatchAction={dispatchAction}
                      />

                      <FileSections
                        title='Intraoral'
                        icon={getIcon('Photographs')}
                        files={intraoral as any}
                        mode='thumbnail'
                        userId={userId}
                        dispatchAction={dispatchAction}
                      />

                      <FileSections
                        title='Intraoral Scan Files'
                        icon={getIcon('Scan files')}
                        files={intraoralScanFiles as any}
                        mode='list'
                        userId={userId}
                        dispatchAction={dispatchAction}
                      />
                      <FileSections
                        title='Desired Occlusion on Stone Cast'
                        icon={getIcon('Scan files')}
                        files={desiredOcclusionStoneCast as any}
                        mode='list'
                        userId={userId}
                        dispatchAction={dispatchAction}
                      />
                      <FileSections
                        title='DICOM Files'
                        icon={getIcon('Radiographs')}
                        files={dicomFiles as any}
                        mode='thumbnail'
                        useDocumentThumbnailIcon={serviceConfig?.VSP_PLANNING}
                        userId={userId}
                        dispatchAction={dispatchAction}
                      />

                      <FileSections
                        title='Radiographs'
                        icon={getIcon('Radiographs')}
                        files={xrays as any}
                        mode='thumbnail'
                        useDocumentThumbnailIcon={serviceConfig?.VSP_PLANNING}
                        userId={userId}
                        dispatchAction={dispatchAction}
                      />

                      {externalLinks.length > 0 ? (
                        <div className='flex flex-col gap-1'>
                          <div className='section-title'>External Links</div>
                          <div className='flex flex-col gap-2'>
                            {externalLinks.map((link, linkIndex) => (
                              <a
                                key={`${record.id}-external-link-${linkIndex}`}
                                href={link}
                                target='_blank'
                                rel='noreferrer'
                                className='flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-primaryColor hover:bg-slate-100'
                              >
                                <Link2 size={16} className='mt-0.5 shrink-0' />
                                <span className='min-w-0 break-all'>{link}</span>
                                <ExternalLink size={14} className='mt-0.5 shrink-0' />
                              </a>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </CollapseCardWithBorder>
                )
              })}
            </div>
          )}
        </Spin>
      </TabSectionCard>

      <Modal
        title={
          <div className='flex items-center gap-2'>
            <FileText size={20} className='text-primaryColor' />
            <span>Add Case Record</span>
          </div>
        }
        open={isCaseRecordFormOpen}
        onCancel={() => {
          if (isSubmittingForm) return
          setIsCaseRecordFormOpen(false)
          setShowExternalLinksConfirmModal(false)
          setExternalLinksInForm([])
        }}
        onOk={async () => {
          if (externalLinksInForm.length > 0) {
            setShowExternalLinksConfirmModal(true)
            return
          }
          await handleCaseRecordSubmit()
        }}
        okText={isUploading ? 'Uploading files...' : 'Submit'}
        okButtonProps={{
          disabled: isSubmitting,
          style: {
            background: '#4A62E8',
            borderColor: '#4462EA',
            color: 'white',
            opacity: isSubmitting ? 0.65 : 1,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          },
        }}
        confirmLoading={isSubmitting}
        width={800}
        destroyOnClose
        styles={{body: {maxHeight: '70vh', overflowY: 'auto'}}}
      >
        <div className='p-2'>
          <VspCaseRecordsForm
            orderId={orderId || undefined}
            hideSectionHeader={true}
            onSubmitRef={(submitFn) => {
              submitRef.current = submitFn as any
            }}
            onCreateSuccess={() => {
              setIsSubmittingForm(false)
              setIsCaseRecordFormOpen(false)
              setShowExternalLinksConfirmModal(false)
              setExternalLinksInForm([])
              fetchCaseRecords()
            }}
            patientId={safeParseInt(patientId)}
            onExternalLinksChange={setExternalLinksInForm}
            onUploadingChange={setHasUploaderInProgress}
          />
        </div>
      </Modal>

      <Modal
        title='Confirm send'
        open={showExternalLinksConfirmModal}
        onCancel={() => !isSubmittingForm && setShowExternalLinksConfirmModal(false)}
        footer={[
          <button
            key='cancel'
            type='button'
            onClick={() => setShowExternalLinksConfirmModal(false)}
            disabled={isSubmittingForm}
            className='mr-3 rounded-xl border border-[#D0D5DD] px-4 py-2 text-sm font-semibold text-[#344054] transition-all hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50'
          >
            Cancel
          </button>,
          <button
            key='confirm'
            type='button'
            onClick={async () => {
              setShowExternalLinksConfirmModal(false)
              await handleCaseRecordSubmit()
            }}
            disabled={isSubmittingForm}
            className='rounded-xl border border-[#4462EA] bg-[#4A62E8] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#3E57DD] disabled:cursor-not-allowed disabled:opacity-50'
          >
            Confirm
          </button>,
        ]}
        destroyOnClose
      >
        <p className='text-sm leading-relaxed text-gray-500'>
          Before sending the files via Google Drive, please confirm that access has been provided to{' '}
          <a
            href={`mailto:${process.env.REACT_APP_VSP_CASES_EMAIL}`}
            className='font-semibold text-[#4A62E8] underline'
          >
            {process.env.REACT_APP_VSP_CASES_EMAIL}
          </a>{' '}
          for smooth processing &amp; next steps.
        </p>
      </Modal>
    </>
  )
}

export default VspRecords
