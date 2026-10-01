import ClaudUploadIcon from 'assets/icons/ClaudUploadIcon'

interface CommonVideoInputProps {
  title: string
  icon: any
  disabled?: boolean
  handleVideoFileChange: (videoType: string, e: any) => void
}

export const CommonVideoInput: React.FC<CommonVideoInputProps> = (props) => {
  const {title, icon, disabled, handleVideoFileChange} = props
  return (
    <div className='h-[150px] md:w-[150px] min-w-[150px]'>
      <div className='font-medium text-sm text-textColor'>{title}</div>
      <div className='h-[150px] md:w-[150px] w-full flex flex-col justify-between items-center cursor-pointer relative border border-mediumGray rounded-lg p-4'>
        {handleVideoFileChange && (
          <input
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              opacity: 0,
            }}
            type='file'
            id='input'
            name='video_file'
            accept='video/mp4, video/mov, video/avi, video/mkv, video/webm, video/flv, video/wmv, video/3gp'
            onChange={(e) =>
              handleVideoFileChange &&
              handleVideoFileChange(
                title.toUpperCase() === 'SINGLE' ? 'SINGLE_VIDEO' : title.toUpperCase(),
                e
              )
            }
            disabled={disabled}
          />
        )}
        <img src={icon} className='' />
        <label htmlFor='image' className=' cursor-pointer flex-col justify-center items-center'>
          <div className='flex justify-center items-center gap-2'>
            <ClaudUploadIcon color='#666666' width='20' height='20' />
            <p className='text-sm font-medium text-textColor'>Upload file</p>
          </div>
        </label>
      </div>
    </div>
  )
}
