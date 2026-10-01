import {Image} from 'antd'
import {IFile} from '../SmileSimulation'
import DownloadIcon from 'assets/icons/DownloadIcon'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'

export const ViewSmileSimulation = ({
  uploadedFiles,
  smileSimulatedResponse,
}: {
  uploadedFiles: IFile | null
  smileSimulatedResponse: string | null
}) => {
  const handleDownload = (imageUrl: string) => {
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = uploadedFiles?.name ?? 'Downloaded-image.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
  return (
    <div className='w-full h-full flex md:flex-row flex-col gap-4'>
      <div className='w-full md:w-1/2 md:min-h-[300px] min-h-[215px] md:h-full relative border border-mediumGray rounded-lg'>
        <div>
          <div className='absolute z-10 left-4 top-4 border border-mediumGray rounded-2xl px-2 text-textColor bg-white'>
            Current definition
          </div>
          <When isTrue={hasValue(uploadedFiles?.url)}>
            <button
              className='absolute z-10 right-4 top-4 border border-primaryColor rounded px-2 text-textColor !bg-primarySupport p-1'
              onClick={() => {
                handleDownload(uploadedFiles?.url ?? '')
              }}
            >
              <DownloadIcon color='#735BF2' width={'22px'} height={'22px'} />
            </button>
          </When>
        </div>
        {uploadedFiles !== null ? (
          <Image
            src={uploadedFiles?.url || uploadedFiles?.url}
            alt={uploadedFiles?.name}
            width={'100%'}
            height={300}
            className='w-full md:min-h-[300px] min-h-[215px] md:h-full rounded border border-mediumGray object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-textColor font-medium text-sm'>
            Upload an image to see the results
          </div>
        )}
      </div>
      <div className='w-full md:w-1/2 md:min-h-[300px] min-h-[215px] md:h-full relative border border-mediumGray rounded-lg'>
        <div>
          <div className='absolute z-10 left-4 top-4 border border-mediumGray rounded-2xl px-2 text-textColor bg-white'>
            Simulated outcome{' '}
          </div>
          <When isTrue={hasValue(smileSimulatedResponse)}>
            <button
              className='absolute z-10 right-4 top-4 border border-primaryColor rounded px-2 text-textColor !bg-primarySupport p-1'
              onClick={() => {
                handleDownload(smileSimulatedResponse ?? '')
              }}
            >
              <DownloadIcon color='#735BF2' width={'22px'} height={'22px'} />
            </button>
          </When>
        </div>

        {smileSimulatedResponse !== null ? (
          <Image
            src={smileSimulatedResponse}
            alt={uploadedFiles?.name}
            width={'100%'}
            height={300}
            className='w-full md:min-h-[300px] min-h-[215px] md:h-full rounded border border-mediumGray object-fill'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-textColor font-medium text-sm'>
            Upload an image to see the results
          </div>
        )}
      </div>
    </div>
  )
}
