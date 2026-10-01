import {saveAs} from 'file-saver'

const DOWNLOAD_URL_CLEANUP_DELAY_MS = 60_000

export const downloadBlob = (blob: Blob, fileName: string) => {
  try {
    saveAs(blob, fileName)
    return
  } catch (error) {
    console.error('Unable to save file via file-saver, falling back to object URL download.', error)
  }

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = fileName
  link.rel = 'noopener noreferrer'
  link.target = '_blank'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), DOWNLOAD_URL_CLEANUP_DELAY_MS)
}

export const downloadFromUrl = (url: string, fileName?: string) => {
  const link = document.createElement('a')

  link.href = url
  if (fileName) {
    link.download = fileName
  }
  link.rel = 'noopener noreferrer'
  link.target = '_blank'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // WebViews can ignore anchor clicks, so force top-level navigation as a fallback.
  window.setTimeout(() => {
    if (document.visibilityState === 'visible') {
      window.location.href = url
    }
  }, 300)
}
