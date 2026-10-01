import React from 'react'
import {validateList} from '../../../../../utils/ConstFunctions'
import CommonSVG from '../../../../atom/SVG/CommonSVG'
import {SVG_SELECT} from '../../../../../utils/SvgConstants'
import userTypes from '../../../../../@constants/userTypes'
import {Image} from '../../../../../assets/images/Images/Image'

const AlignerPhotosWrapper = (props: any) => {
  const {photos, selectedItems, handleCheckboxChange, onClickImage} = props
  return (
    <div>
      <div className='text-black text-base font-semibold'>Uploaded by patient</div>
      <div className='flex flex-wrap -mx-2'>
        {validateList(photos) &&
          photos.map((photo: any, index: number) => (
            <div className='relative m-4' key={index}>
              {photo.uploader_user_type === 'PATIENT' && (
                <>
                  <label
                    htmlFor={`checkbox-${index}`}
                    className='cursor-pointer absolute m-2 -top-1 -right-1'
                  >
                    {selectedItems.includes(photo.aligner_photo_id) ? (
                      <CommonSVG svg={SVG_SELECT} width='20' height='20' />
                    ) : (
                      <div className='w-5 h-5 rounded-full bg-primary border bg-lightGray border-mediumGray'></div>
                    )}
                  </label>

                  <input
                    id={`checkbox-${index}`}
                    className='form-check-input position-absolute end-0 mt-3 me-3 hidden'
                    type='checkbox'
                    checked={selectedItems.includes(photo.aligner_photo_id)}
                    onChange={() => handleCheckboxChange(index, photo)}
                  />
                  <Image
                    src={photo.image_url}
                    alt=''
                    className='w-44 h-44 object-contain rounded-lg border border-black border-opacity-50 bg-black'
                    onClick={() => onClickImage(photos, index)}
                  />
                </>
              )}
            </div>
          ))}
      </div>
      <div className='text-black text-base font-semibold'>Uploaded by me</div>
      <div className='flex flex-wrap -mx-2'>
        {validateList(photos) &&
          photos.map((photo: any, index: number) => (
            <div className='relative m-4' key={index}>
              {photo.uploader_user_type === userTypes.DOCTOR && (
                <>
                  <label
                    htmlFor={`checkbox-${index}`}
                    className='cursor-pointer absolute m-2 -top-1 -right-1'
                  >
                    {selectedItems.includes(photo.aligner_photo_id) ? (
                      <CommonSVG svg={SVG_SELECT} width='20' height='20' />
                    ) : (
                      <div className='w-5 h-5 rounded-full bg-primary border bg-lightGray border-mediumGray'></div>
                    )}
                  </label>

                  <input
                    id={`checkbox-${index}`}
                    className='form-check-input position-absolute end-0 mt-3 me-3 hidden'
                    type='checkbox'
                    checked={selectedItems.includes(photo.aligner_photo_id)}
                    onChange={() => handleCheckboxChange(index, photo)}
                  />
                  <Image
                    src={photo.image_url}
                    alt=''
                    className='w-44 h-44 object-contain rounded-lg border border-black border-opacity-50 bg-black'
                    onClick={() => onClickImage(photos, index)}
                  />
                </>
              )}
            </div>
          ))}
      </div>
    </div>
  )
}

export default AlignerPhotosWrapper
