import CrossIcon from 'assets/icons/CrossIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import {Image} from 'assets/images/Images/Image'
import When from 'components/when/When'
import React from 'react'
import {openDocument} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

const PhotoUpload = ({
  id,
  onFileChange,
  src,
  initials,
  removeFile,
  tipMessage,
  isEditClicked,
}: {
  id: string
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  src: string
  initials: string
  removeFile?: () => void
  tipMessage?: string
  isEditClicked?: boolean
}) => {
  return (
    <div className='flex gap-6 items-center'>
      <div className='flex flex-col gap-2 items-center w-fit relative'>
        <When isTrue={!hasValue(src)}>
          <div className='p-4 bg-lightGray border border-mediumGray rounded-lg w-16 h-16 text-textColor flex justify-center items-center font-semibold'>
            {initials}
          </div>
        </When>
        <div className='relative flex flex-col items-center gap-2'>
          <When isTrue={hasValue(src)}>
            <Image
              src={src}
              showLoading
              alt='Profile photo'
              className='w-16 h-16 rounded-[4px] object-cover cursor-pointer'
              onClick={() => openDocument(src)}
            />
          </When>
          <When isTrue={isEditClicked && hasValue(src)}>
            <div
              className='absolute top-[-11px] right-[-5px] cursor-pointer  rounded-full p-1'
              onClick={removeFile}
            >
              <div className='w-6 h-6 z-10 flex justify-center items-center border bg-white border-mediumGray rounded-full'>
                <CrossIcon color='red' />
              </div>
            </div>
          </When>
          <When isTrue={isEditClicked}>
            <input
              style={{display: 'none'}}
              type='file'
              id={id}
              accept='.jpg, .jpeg, .png,'
              onChange={onFileChange}
              className='cursor-pointer'
            />
            <label htmlFor={id} className='cursor-pointer flex-col justify-center items-center'>
              <div className='w-20 text-xs bg-primarySupport border border-primaryColor text-primaryColor font-semibold px-2 py-1 rounded-md text-center'>
                Add photo
              </div>
            </label>
          </When>
        </div>
      </div>
      {tipMessage && (
        <div className='flex gap-2 text-textColor text-xs font-semibold items-center'>
          <InfoIcon />
          <p>{tipMessage}</p>
        </div>
      )}
    </div>
  )
}

export default PhotoUpload
