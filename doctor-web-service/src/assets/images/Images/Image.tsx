import {heicTo} from 'heic-to'
import {FC, useState, useEffect, useRef} from 'react'
import Spinner from '../../../components/spinner/Spinner'
import When from '../../../components/when/When'
import clsx from 'clsx'
import TextWithTooltip from 'components/section/TextWithTooltip'

interface Props {
  className?: string
  src: string
  onClick?: any
  alt?: string
  showLoading?: boolean
  fileName?: string
  showFileName?: boolean
  size?: number
  isUnread?: boolean
}

export const Image: FC<Props> = (props) => {
  const {
    className,
    src,
    onClick,
    alt,
    showLoading,
    fileName,
    showFileName = false,
    size = 40,
    isUnread = false,
  } = props
  const [convertedImageUrl, setConvertedImageUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const convertedBlobUrlRef = useRef<string | null>(null)

  const revokeConvertedBlobUrl = () => {
    if (!convertedBlobUrlRef.current) return
    URL.revokeObjectURL(convertedBlobUrlRef.current)
    convertedBlobUrlRef.current = null
  }

  const getPathName = (value: string) => {
    try {
      return decodeURIComponent(new URL(value).pathname).toLowerCase()
    } catch {
      return decodeURIComponent(String(value).split('?')[0] || '').toLowerCase()
    }
  }

  const isHeicSource = (value: string) => {
    const pathName = getPathName(value)
    return pathName.endsWith('.heic') || pathName.endsWith('.heif')
  }

  const getHeicMimeType = (value: string) => {
    const pathName = getPathName(value)
    if (pathName.endsWith('.heif')) return 'image/heif'
    return 'image/heic'
  }

  useEffect(() => {
    let isActive = true
    setLoading(true)
    revokeConvertedBlobUrl()

    if (!src) {
      setConvertedImageUrl('')
      setLoading(false)
      return () => {
        isActive = false
      }
    }

    if (!isHeicSource(src)) {
      setConvertedImageUrl(src)
      return () => {
        isActive = false
      }
    }

    const fetchAndConvertImage = async () => {
      try {
        const response = await fetch(src)
        if (!response.ok) {
          throw new Error(`Failed to fetch image. Status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const blob = new Blob([arrayBuffer], {type: getHeicMimeType(src)})
        const convertedResult = await heicTo({blob, type: 'image/png', quality: 0.9})
        const convertedBlob = Array.isArray(convertedResult) ? convertedResult[0] : convertedResult

        if (!(convertedBlob instanceof Blob)) {
          throw new Error('Invalid converted image blob')
        }

        const convertedUrl = URL.createObjectURL(convertedBlob)
        convertedBlobUrlRef.current = convertedUrl
        if (isActive) {
          setConvertedImageUrl(convertedUrl)
        }
      } catch (error) {
        console.error('Error converting HEIC image:', error)
        if (isActive) {
          // Fallback to original source. If browser supports HEIC it will still render.
          setConvertedImageUrl(src)
        }
      }
    }

    void fetchAndConvertImage()

    return () => {
      isActive = false
    }
  }, [src])

  useEffect(() => {
    return () => {
      revokeConvertedBlobUrl()
    }
  }, [])

  const handleImageLoad = () => {
    setLoading(false)
  }

  const handleImageError = () => {
    setLoading(false)
  }

  return (
    <>
      <When isTrue={showLoading && loading}>
        <Spinner {...{className, loading, size: size}} />
      </When>
      <When isTrue={isUnread}>
        <div className='w-2 h-2 bg-red rounded-full absolute left-11 top-4'> </div>
      </When>
      <img
        className={clsx(className, `${showLoading ? `${loading ? 'hidden' : 'block'}` : ''}`)}
        src={convertedImageUrl}
        onClick={onClick}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
      <When isTrue={showFileName}>
        <TextWithTooltip className='cursor-pointer'>{fileName}</TextWithTooltip>
      </When>
    </>
  )
}
