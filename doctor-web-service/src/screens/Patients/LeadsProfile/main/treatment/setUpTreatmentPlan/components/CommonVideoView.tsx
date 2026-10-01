import CommonSVG from 'components/atom/SVG/CommonSVG'
import {useState} from 'react'
import {
  DRIVE_IMAGE_PREFIX,
  getFirstLetterCapitalOfWord,
  getImageUrl,
  openDriveUrls,
} from 'utils/ConstFunctions'
import {SVG_CROSS_RED} from 'utils/SvgConstants'
import When from 'components/when/When'
import {VideoPositionKey} from '../../types/treatmentPlan.types'
import videoUploadTypesConstants from '@constants/videoUploadTypes.constants'
import ReactPlayer from 'react-player'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import videoView from 'assets/images/videoView.png'
export const unReviewableExtension = ['MOV0', 'mov', 'AVI', 'avi']

interface VideoFileUrls {
  SINGLE_VIDEO: IFile | null
  TOP: IFile | null
  BOTTOM: IFile | null
  RIGHT: IFile | null
  LEFT: IFile | null
  FRONT: IFile | null
}

interface CommonImageViewProps {
  videoKey: VideoPositionKey
  videoFileUrls: VideoFileUrls
  handleVideoFileRemove?: (videoKey: string) => void
  showCrossButton?: boolean
}

interface IFile {
  name: string
  url: string
  type: string
  extension: string
}

export const CommonVideoView: React.FC<CommonImageViewProps> = ({
  videoKey,
  videoFileUrls,
  handleVideoFileRemove,
  showCrossButton = true,
}) => {
  const [isPreviewOpen, setPreviewOpen] = useState(false)
  const togglePreview = (url: string) => {
    if (url.startsWith(DRIVE_IMAGE_PREFIX)) {
      openDriveUrls(url)
      return
    }
    if (unReviewableExtension.includes(videoFileUrls[videoKey]?.extension ?? '')) {
      ErrorToast('Unable to open video file')
    } else {
      setPreviewOpen(!isPreviewOpen)
    }
  }

  return (
    <div className=''>
      <div className='font-medium text-sm text-textColor'>
        {videoKey === videoUploadTypesConstants.SINGLE_VIDEO
          ? null
          : getFirstLetterCapitalOfWord(videoKey)}
      </div>

      <div
        className='relative h-[150px] w-[150px] border border-mediumGray rounded-xl overflow-hidden flex items-center justify-center cursor-pointer'
        onClick={() => togglePreview(getImageUrl(videoFileUrls[videoKey]) || '')}
      >
        <ReactPlayer
          url={getImageUrl(videoFileUrls[videoKey]) || ''}
          className='react-player'
          playing={false}
          controls={true}
          width='100%'
          height='100%'
          style={{objectFit: 'cover'}}
          light={
            unReviewableExtension.includes(videoFileUrls[videoKey]?.extension ?? '') && videoView
          }
        />
        <When isTrue={showCrossButton}>
          <div
            className='absolute top-2 right-2 cursor-pointer w-8 h-8 bg-white rounded-full flex justify-center items-center'
            onClick={(e) => {
              e.stopPropagation()
              if (handleVideoFileRemove) {
                handleVideoFileRemove(videoKey)
              }
            }}
          >
            <CommonSVG svg={SVG_CROSS_RED} width='16' height='16' />
          </div>
        </When>
      </div>

      {isPreviewOpen && (
        <div
          className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex justify-center items-center'
          onClick={() => togglePreview(getImageUrl(videoFileUrls[videoKey]) ?? '')}
        >
          <div
            className='relative w-[90%] h-[90%] bg-black rounded-lg'
            onClick={(e) => e.stopPropagation()}
          >
            <ReactPlayer
              url={getImageUrl(videoFileUrls[videoKey]) || ''}
              playing={true}
              controls={true}
              width='100%'
              height='100%'
              style={{objectFit: 'cover'}}
            />
          </div>
        </div>
      )}
    </div>
  )
}
