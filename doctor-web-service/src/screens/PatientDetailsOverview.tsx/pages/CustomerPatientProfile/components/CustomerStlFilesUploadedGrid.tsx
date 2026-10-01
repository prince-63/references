import {Download, ExternalLink, Link2, Package} from 'lucide-react'
import {useContext} from 'react'
import {useSelector} from 'react-redux'
import {downloadBlob, downloadFromUrl} from 'utils/download'
import {RootState} from 'redux/store'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import userTypes from '@constants/userTypes'
import {downloadFile} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {bytesToMB} from '@utils/bytesToMB'
import {AllFiles} from 'screens/Patients/LeadsProfile/main/files/types/files.types'
import {isAppView} from 'utils/isAppView'

declare const window: Window &
  typeof globalThis & {
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }

type AllFilesWithDownloadMeta = AllFiles & {
  is_gdrive_platform?: boolean
  download_url?: string
  drive_file_id?: string
}

const CustomerStlFilesUploadedGrid = ({files, links}: {files: AllFiles[]; links: string[]}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId} = useContext(AuthContext)
  const {downloadingFile} = useSelector((state: RootState) => state.leadsProfileFiles)

  const getFileName = (file: AllFilesWithDownloadMeta) => file?.name || 'file.zip'
  const getFileType = (file: AllFilesWithDownloadMeta) => file?.type || 'application/octet-stream'
  const getDownloadUrl = (file: AllFilesWithDownloadMeta) => file?.download_url || file?.url || ''

  const blobToBase64 = async (blob: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = String(reader.result || '')
        resolve(result.includes(',') ? result.split(',')[1] : result)
      }
      reader.onerror = () => reject(new Error('Unable to prepare STL file for download'))
      reader.readAsDataURL(blob)
    })

  const sendFileToNativeApp = async (file: AllFilesWithDownloadMeta) => {
    if (!isAppView() || !window.ReactNativeWebView) return false

    const downloadUrl = getDownloadUrl(file)
    if (downloadUrl) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          file_details: [
            {
              file_id: file.file_id,
              name: getFileName(file),
              url: downloadUrl,
              download_url: downloadUrl,
              type: getFileType(file),
              extension: file?.extension,
            },
          ],
        })
      )
      return true
    }

    if (!userId || !file?.file_id) return false

    const response = await dispatchAction(
      downloadFile({
        requester_user_id: safeParseInt(userId),
        requester_user_type: userTypes.DOCTOR,
        file_id: safeParseInt(file.file_id),
      })
    ).unwrap()
    const blob = new Blob([response], {
      type: getFileType(file),
    })
    const fileBase64 = await blobToBase64(blob)

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        file_name: getFileName(file),
        file_type: getFileType(file),
        file_base64: fileBase64,
      })
    )
    return true
  }

  const handleDownload = async (file: AllFilesWithDownloadMeta) => {
    try {
      if (await sendFileToNativeApp(file)) {
        return
      }

      const downloadUrl = getDownloadUrl(file)
      if (downloadUrl && (file?.is_gdrive_platform || !file?.file_id)) {
        downloadFromUrl(downloadUrl, getFileName(file))
        return
      }

      if (userId && file?.file_id) {
        const response = await dispatchAction(
          downloadFile({
            requester_user_id: safeParseInt(userId),
            requester_user_type: userTypes.DOCTOR,
            file_id: safeParseInt(file.file_id),
          })
        ).unwrap()
        const blob = new Blob([response], {
          type: getFileType(file),
        })
        downloadBlob(blob, getFileName(file))
        return
      }

      if (downloadUrl) downloadFromUrl(downloadUrl, getFileName(file))
    } catch {
      const downloadUrl = getDownloadUrl(file)
      if (downloadUrl) downloadFromUrl(downloadUrl, getFileName(file))
    }
  }

  const stlFiles = (files ?? []).filter((f) => !f.folder)
  const zipFiles = stlFiles.filter((f) => (f.extension ?? '').toLowerCase() === 'zip')
  const orderedFiles = zipFiles.length > 0 ? zipFiles : stlFiles

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
      {orderedFiles.map((file) => {
        const sizeLabel = file?.size ? `${bytesToMB(file.size)} MB` : '-'
        return (
          <button
            key={file.file_id}
            type='button'
            onClick={() => handleDownload(file as AllFilesWithDownloadMeta)}
            className='w-full text-left flex items-center justify-between gap-3 rounded-xl border border-primaryColor/20 bg-white px-4 py-3 shadow-sm hover:bg-neutral-50 hover:border-primaryColor/30 transition-colors'
            disabled={downloadingFile}
          >
            <div className='flex items-center gap-3 min-w-0'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primarySupport border border-neutral-200 shrink-0'>
                <Package size={18} className='text-primaryColor' />
              </div>
              <div className='min-w-0'>
                <div className='text-xs font-semibold text-textColor truncate'>{file.name}</div>
                <div className='text-[10px] text-neutral-400'>{sizeLabel}</div>
              </div>
            </div>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white shrink-0'>
              <Download size={16} className='text-primaryColor' />
            </div>
          </button>
        )
      })}

      {links.map((link, index) => {
        const title = links.length === 1 ? 'Cloud STL Viewer' : `External Link ${index + 1}`
        return (
          <a
            key={`${link}-${index}`}
            href={link}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-between gap-3 rounded-xl border border-primaryColor/20 bg-white px-4 py-3 shadow-sm hover:bg-neutral-50 hover:border-primaryColor/30 transition-colors'
          >
            <div className='flex items-center gap-3 min-w-0'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-primarySupport border border-neutral-200 shrink-0'>
                <Link2 size={18} className='text-primaryColor' />
              </div>
              <div className='min-w-0'>
                <div className='text-xs font-semibold text-textColor truncate'>{title}</div>
                <div className='text-[10px] text-neutral-400 uppercase tracking-[0.12em]'>
                  External Link
                </div>
              </div>
            </div>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white shrink-0'>
              <ExternalLink size={16} className='text-neutral-500' />
            </div>
          </a>
        )
      })}
    </div>
  )
}

export default CustomerStlFilesUploadedGrid
