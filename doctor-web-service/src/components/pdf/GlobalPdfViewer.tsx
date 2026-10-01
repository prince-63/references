import {useEffect, useState} from 'react'
import PDFWebview from 'screens/Patients/LeadsProfile/main/files/components/PDFWebview'
import {APP_PDF_VIEWER_EVENT} from 'utils/ConstFunctions'

type PdfViewerState = {
  isOpen: boolean
  url: string
  fileName?: string
}

const initialState: PdfViewerState = {
  isOpen: false,
  url: '',
  fileName: '',
}

const GlobalPdfViewer = () => {
  const [viewerState, setViewerState] = useState<PdfViewerState>(initialState)

  useEffect(() => {
    const handleOpenPdf = (event: Event) => {
      const customEvent = event as CustomEvent<{url?: string; fileName?: string}>
      const url = customEvent.detail?.url

      if (!url) return

      setViewerState({
        isOpen: true,
        url,
        fileName: customEvent.detail?.fileName,
      })
    }

    window.addEventListener(APP_PDF_VIEWER_EVENT, handleOpenPdf as EventListener)

    return () => {
      window.removeEventListener(APP_PDF_VIEWER_EVENT, handleOpenPdf as EventListener)
    }
  }, [])

  if (!viewerState.isOpen) return null

  return (
    <PDFWebview
      pdfUrl={viewerState.url}
      fileName={viewerState.fileName}
      onBack={() => setViewerState(initialState)}
    />
  )
}

export default GlobalPdfViewer
