import {Image} from '../../../../assets/images/Images/Image'
import hasValue from '../../../../utils/hasValue'
import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import {SVG_DELETE_MINUS, SVG_SEND} from '../../../../utils/SvgConstants'
import When from '../../../../components/when/When'
import {IMAGE_PDF} from '../../../../utils/ImageConst'
import Spinner from '../../../../components/spinner/Spinner'
import {getImageUrl} from 'utils/ConstFunctions'

const AttachmentsContainer: React.FC<{
  photos: any[]
  handleDelete: (index: number) => void
  imageUploadAPiCall: (x: FormData) => Promise<void>
  attachmentsFormData: FormData
  messageSending: boolean
}> = ({photos, imageUploadAPiCall, handleDelete, attachmentsFormData, messageSending}) => {
  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      imageUploadAPiCall(attachmentsFormData)
    }
  }

  return (
    <div
      className='flex text-textColor text-sm font-normal w-full p-3 bg-white rounded-lg border-2 border-mediumGray justify-between'
      tabIndex={0}
      onKeyDown={handleKeyPress}
    >
      <div className='flex flex-wrap gap-3'>
        {hasValue(photos) &&
          photos.map((photo: any, index: number) => (
            <div className='md:min-w-24 md:w-24 md:h-24 w-8 h-8 relative md:mr-2' key={index}>
              <When isTrue={photo.file.type === 'application/pdf'}>
                <img
                  className={
                    'md:w-24 md:h-24 w-8 h-8 rounded-lg border border-black border-opacity-50 hover:opacity-70 object-contain bg-black'
                  }
                  src={IMAGE_PDF}
                  alt='Doc'
                  key={index}
                />
              </When>
              <When isTrue={photo.file.type !== 'application/pdf'}>
                <Image
                  className='md:w-24 md:h-24 w-8 h-8 rounded-lg border border-black border-opacity-50 hover:opacity-70 object-contain bg-black'
                  src={getImageUrl(photo)}
                  alt={photo.file.name}
                  showLoading={true}
                />
              </When>
              <div
                className='absolute md:top-0 md:left-20 bottom-5 left-6'
                onClick={() => handleDelete(index)}
              >
                <div className='md:w-8 md:h-8 w-4 h-4 z-10 rounded-full flex justify-center items-center'>
                  <CommonSVG svg={SVG_DELETE_MINUS} width='22' height='22' />
                </div>
              </div>
            </div>
          ))}
      </div>
      <When isTrue={messageSending}>
        <Spinner {...{loading: messageSending}} />
      </When>
      <When isTrue={!messageSending}>
        <button className='' onClick={() => imageUploadAPiCall(attachmentsFormData)}>
          <CommonSVG svg={SVG_SEND} width='24' height='24' />
        </button>
      </When>
    </div>
  )
}

export default AttachmentsContainer
