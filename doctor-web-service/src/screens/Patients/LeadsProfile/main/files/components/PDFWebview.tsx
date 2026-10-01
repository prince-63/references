import React, {useEffect, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'
import {ArrowLeft, Download} from 'lucide-react'
import saveAs from 'file-saver'
import {getGoogleDrivePreviewUrl, normalizeGoogleDriveUrl} from 'utils/ConstFunctions'

interface PDFWebviewProps {
  pdfUrl: string
  onBack: () => void
  fileName?: string
}

const isMobilePdfBrowser = () => {
  const userAgent = window.navigator.userAgent || ''
  const platform = window.navigator.platform || ''
  const isNarrowMobileViewport = window.matchMedia?.('(max-width: 767px)')?.matches ?? false

  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(userAgent) ||
    /iPhone|iPad|iPod/i.test(platform) ||
    (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1) ||
    isNarrowMobileViewport
  )
}

const getFetchCredentials = (url: string): RequestCredentials => {
  try {
    const parsedUrl = new URL(url, window.location.href)
    return parsedUrl.origin === window.location.origin ? 'include' : 'omit'
  } catch {
    return 'include'
  }
}

const fetchPdfBlob = async (url: string) => {
  const primaryCredentials = getFetchCredentials(url)
  const credentialAttempts: RequestCredentials[] =
    primaryCredentials === 'include' ? ['include'] : ['omit', 'include']

  let lastError: unknown

  for (const credentials of credentialAttempts) {
    try {
      const response = await fetch(url, {credentials})
      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status}`)
      }

      const sourceBlob = await response.blob()
      return sourceBlob.type === 'application/pdf'
        ? sourceBlob
        : new Blob([sourceBlob], {type: 'application/pdf'})
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}

const openDirectPdf = (url: string, resolvedFileName: string) => {
  const reactNativeWebView = (window as any).ReactNativeWebView

  reactNativeWebView?.postMessage(
    JSON.stringify({
      file_details: [
        {
          url,
          name: resolvedFileName,
          type: 'application/pdf',
          extension: 'pdf',
        },
      ],
    })
  )

  const link = document.createElement('a')
  link.href = url
  link.download = resolvedFileName
  link.rel = 'noopener noreferrer'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const openNativePdfPreview = (url: string, fileName?: string) => {
  const reactNativeWebView = (window as any).ReactNativeWebView

  if (!reactNativeWebView || !url || !isMobilePdfBrowser()) return

  reactNativeWebView.postMessage(
    JSON.stringify({
      type: 'OPEN_PDF_PREVIEW',
      url,
      file_name: fileName,
    })
  )
}

const PDFWebview: React.FC<PDFWebviewProps> = ({pdfUrl, onBack, fileName}) => {
  const portalRoot = document.getElementById('root') || document.body
  const [isDownloading, setIsDownloading] = useState(false)
  const [isViewerLoading, setIsViewerLoading] = useState(false)
  const [viewerUrl, setViewerUrl] = useState('')
  const [viewerLoadFailed, setViewerLoadFailed] = useState(false)

  const getResolvedFileName = () => {
    const trimmedName = fileName?.trim()
    if (!trimmedName) return 'document.pdf'
    return trimmedName.toLowerCase().endsWith('.pdf') ? trimmedName : `${trimmedName}.pdf`
  }

  const downloadTarget = useMemo(() => normalizeGoogleDriveUrl(pdfUrl), [pdfUrl])
  const viewerSource = useMemo(() => getGoogleDrivePreviewUrl(pdfUrl), [pdfUrl])

  useEffect(() => {
    openNativePdfPreview(downloadTarget || pdfUrl, fileName)
  }, [downloadTarget, fileName, pdfUrl])

  const getPdfViewerUrl = (url: string) => {
    if (!url || url.startsWith('blob:')) return url
    if (url.includes('drive.google.com') && url.includes('/preview')) return url

    if (isMobilePdfBrowser() && /Android/i.test(navigator.userAgent)) {
      return `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
    }
    return url
  }

  useEffect(() => {
    let isMounted = true
    let objectUrl = ''

    if (!viewerSource) {
      setViewerUrl('')
      setViewerLoadFailed(false)
      setIsViewerLoading(false)
      return
    }

    if (
      viewerSource.startsWith('blob:') ||
      isMobilePdfBrowser() ||
      viewerSource.includes('drive.google.com')
    ) {
      setViewerUrl(viewerSource)
      setViewerLoadFailed(false)
      setIsViewerLoading(false)
      return
    }

    const loadPdfPreview = async () => {
      setIsViewerLoading(true)
      setViewerLoadFailed(false)

      try {
        const pdfBlob = await fetchPdfBlob(viewerSource)

        objectUrl = URL.createObjectURL(pdfBlob)
        if (!isMounted) return

        setViewerUrl(objectUrl)
      } catch (error) {
        if (!isMounted) return

        console.error('Unable to load PDF preview, falling back to direct URL.', error)
        setViewerLoadFailed(false)
        setViewerUrl(viewerSource)
      } finally {
        if (isMounted) {
          setIsViewerLoading(false)
        }
      }
    }

    void loadPdfPreview()

    return () => {
      isMounted = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [viewerSource])

  const handleDownload = async () => {
    if (!downloadTarget || isDownloading) return

    const resolvedFileName = getResolvedFileName()

    if (isMobilePdfBrowser() && !downloadTarget.startsWith('blob:')) {
      openDirectPdf(downloadTarget, resolvedFileName)
      return
    }

    setIsDownloading(true)
    let objectUrl = ''
    try {
      const pdfBlob = await fetchPdfBlob(downloadTarget)

      try {
        saveAs(pdfBlob, resolvedFileName)
        return
      } catch (saveError) {
        console.error(
          'Unable to save PDF via file-saver, falling back to object URL download.',
          saveError
        )
      }

      objectUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = resolvedFileName
      link.rel = 'noopener noreferrer'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      return
    } catch (error) {
      console.error('Unable to download PDF via fetch, falling back to direct URL.', error)
      openDirectPdf(downloadTarget, resolvedFileName)
    } finally {
      if (objectUrl) {
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
      }
      setIsDownloading(false)
    }
  }

  return createPortal(
    <div className='fixed inset-0 z-[9999] flex flex-col bg-white'>
      <div className='flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 md:px-6'>
        <div className='flex min-w-0 items-center gap-3'>
          <button
            type='button'
            onClick={onBack}
            className='inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className='min-w-0'>
            <div className='truncate text-sm font-semibold text-gray-900 md:text-base'>
              {fileName || 'PDF Viewer'}
            </div>
          </div>
        </div>

        <button
          type='button'
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className='inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50'
        >
          <Download size={16} />
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
      </div>

      <div className='min-h-0 flex-1 bg-[#111827]'>
        {isViewerLoading ? (
          <div className='flex h-full items-center justify-center text-sm font-medium text-white'>
            Loading PDF...
          </div>
        ) : viewerLoadFailed || !viewerUrl ? (
          <div className='flex h-full flex-col items-center justify-center gap-3 px-4 text-center text-white'>
            <div className='text-sm font-semibold'>Unable to preview this PDF.</div>
            <div className='text-xs text-white/70'>Use Download to open the file locally.</div>
          </div>
        ) : (
          <iframe
            src={getPdfViewerUrl(viewerUrl)}
            title={fileName || 'PDF Viewer'}
            className='block h-full w-full border-0'
            allow='fullscreen'
          />
        )}
      </div>
    </div>,
    portalRoot
  )
}

export default PDFWebview