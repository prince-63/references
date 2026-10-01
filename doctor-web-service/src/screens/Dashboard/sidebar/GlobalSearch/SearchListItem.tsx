import searchResultTypes from '@constants/searchResultTypes'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {Image} from 'assets/images/Images/Image'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import clsx from 'clsx'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import When from 'components/when/When'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {SVG_CLINIC_PRIMARY} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'
import {getImageUrl} from 'utils/ConstFunctions'

export type listItemProps = {
  type: keyof typeof searchResultTypes
  image?: any
  title: string
  subtitle: string
  link: string
}

const SearchListItem = ({
  type,
  image,
  title,
  subtitle,
  showBorder,
  link,
  closeSearchModal,
}: listItemProps & {
  showBorder: boolean
  closeSearchModal: () => void
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const hoverClass = 'bg-lightGray'
  const navigate = useNavigate()
  const {isPractice} = useAllUserPlan()
  const handleClick = () => {
    navigate(link)
    closeSearchModal()
  }

  return (
    <div
      onClick={handleClick}
      className={clsx(
        'bottom-8  flex flex-col  gap-2 w-[100%] px-6 cursor-pointer',
        isHovered && hoverClass
      )}
      onMouseOver={() => {
        setIsHovered(true)
      }}
      onMouseOut={() => setIsHovered(false)}
    >
      <div
        className={clsx('flex gap-4 items-center justify-between py-2', showBorder && 'border-b')}
      >
        <div className='flex gap-4 items-center '>
          <When isTrue={type === searchResultTypes.PATIENT_DETAILS && hasValue(image)}>
            <Image
              className='min-w-12 min-h-12 max-w-12 max-h-12 w-12 h-12 rounded-full'
              src={getImageUrl({
                url: image,
                is_gdrive_platform:
                  typeof image === 'string' && image.includes('patient/drive/image/'),
                drive_file_id:
                  typeof image === 'string'
                    ? image.match(/patient\/drive\/image\/([^/?#]+)/)?.[1]
                    : (image as any)?.drive_file_id,
              })}
              alt='user photo'
            />
          </When>
          <When isTrue={type === searchResultTypes.DOCTOR_PRACTICE_LOCATION}>
            <BackGroundSVG
              svg={SVG_CLINIC_PRIMARY}
              height='32'
              width='32'
              className='rounded-full bg-primarySupport !h-[40px] !w-[40px]'
            />
          </When>
          <When isTrue={type === searchResultTypes.DOCTOR_INVITATION && hasValue(image)}>
            <Image
              className='min-w-12 min-h-12 max-w-12 max-h-12 w-12 h-12 rounded-full'
              src={getImageUrl({
                url: image,
                is_gdrive_platform:
                  typeof image === 'string' && image.includes('patient/drive/image/'),
                drive_file_id:
                  typeof image === 'string'
                    ? image.match(/patient\/drive\/image\/([^/?#]+)/)?.[1]
                    : (image as any)?.drive_file_id,
              })}
              alt='user photo'
            />
          </When>
          <When
            isTrue={
              (type === searchResultTypes.DOCTOR_INVITATION && !hasValue(image)) ||
              (type === searchResultTypes.PATIENT_DETAILS && !hasValue(image))
            }
          >
            <DefaultImage letter={title?.charAt(0)} />
          </When>

          <div className='w-full flex flex-col mr-8 truncate ...'>
            <span className='text-black font-semibold w-[24rem] truncate ...'>{title}</span>
            <When isTrue={isPractice}>
              <span className='text-[14px] text-textColor'>{subtitle}</span>
            </When>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchListItem
