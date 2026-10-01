import ThreeDotIcon from 'assets/icons/ThreeDotIcon'
import clsx from 'clsx'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import Tag from 'components/tags/Tag'
import When from 'components/when/When'
import {useEffect, useRef, useState} from 'react'
import {PracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/editPracticeLocationSlice'
import {identifyUser} from 'utils/ConstFunctions'
import {SVG_CLINIC_GRAY, SVG_Gray_PENCIL, SVG_PROFILE_PHONE} from 'utils/SvgConstants'
import hasValue from 'utils/hasValue'

interface props {
  changeStatus: (row: any, e: any) => void
  practiceLocationObject: PracticeLocation
  openEditPracticeLocation: (clinic: any) => void
  callSetPrimary: (clinic: any) => void
  setAddPracticeLocationStatusModal: (success: boolean) => void
  setIsNew: (isNew: boolean) => void
}

const PracticeLocationMobileCard = ({
  changeStatus,
  practiceLocationObject,
  setAddPracticeLocationStatusModal,
  openEditPracticeLocation,
  callSetPrimary,
  setIsNew,
}: props) => {
  const [open, setOpen] = useState(false)

  return (
    <div className='border border-mediumGray rounded-lg p-4 w-full mb-4 cursor-pointer'>
      <div className='pb-4 border-b border-mediumGray flex items-center gap-4 w-full'>
        <div className='flex flex-col gap-1 w-full'>
          <div className='w-full flex justify-between items-center gap-2 '>
            <div className='max-w-[95%] flex items-center gap-2 '>
              <div className='font-semibold truncate'>
                {practiceLocationObject.practice_location_name}
              </div>
              {practiceLocationObject?.practice_location_type === 'Primary' ? (
                <Tag
                  value='Primary'
                  className='text-xs font-bold bg-primarySupport text-primaryColor'
                />
              ) : (
                ''
              )}
            </div>

            <button
              type='button'
              className='min-w-[5%] flex items-center justify-center'
              onClick={() => setOpen(true)}
            >
              <ThreeDotIcon width='18' height='32' />
            </button>
            <When isTrue={open}>
              <PopupBox
                setAddPracticeLocationStatusModal={setAddPracticeLocationStatusModal}
                openEditPracticeLocation={openEditPracticeLocation}
                callSetPrimary={callSetPrimary}
                setIsNew={setIsNew}
                practiceLocationObject={practiceLocationObject}
                setOpen={setOpen}
              />
            </When>
          </div>
          <div className='text-textColor font-[400] text-sm'>
            {hasValue(practiceLocationObject.address) ? practiceLocationObject.address : '--'}
          </div>
        </div>
      </div>

      <div className='mt-4 flex justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <CommonSVG svg={SVG_PROFILE_PHONE} width='20' />
          <span className='text-sm font-medium truncate ...'>
            {hasValue(practiceLocationObject.mobile_number)
              ? practiceLocationObject.mobile_number
              : '--'}
          </span>
        </div>

        <select
          className={clsx(
            'rounded px-1 py-0.5 outline-none w-fit text-xs font-semibold', // Adjust padding and font size
            practiceLocationObject.active
              ? 'bg-tertiarySupport text-tertiaryColor'
              : 'bg-redSupport text-red'
          )}
          disabled={practiceLocationObject?.practice_location_type === 'Primary'}
          onChange={(e) => {
            identifyUser()
            changeStatus(practiceLocationObject, e.target.value)
          }}
        >
          <option className='hidden'>
            {practiceLocationObject.active ? 'Active' : 'Inactive'}
          </option>
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>
    </div>
  )
}

export default PracticeLocationMobileCard

interface IPopupBoxProps {
  practiceLocationObject: PracticeLocation
  openEditPracticeLocation: (clinic: any) => void
  callSetPrimary: (clinic: any) => void
  setAddPracticeLocationStatusModal: (success: boolean) => void
  setIsNew: (isNew: boolean) => void
  setOpen: (Open: boolean) => void
}
const PopupBox = (props: IPopupBoxProps) => {
  const {
    practiceLocationObject,
    openEditPracticeLocation,
    callSetPrimary,
    setAddPracticeLocationStatusModal,
    setIsNew,
    setOpen,
  } = props
  const dropdownRef: any = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div
      ref={dropdownRef}
      className='origin-top-right absolute right-12 mt-4 w-40 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-10'
    >
      <div className='flex items-center gap-4 m-2  cursor-pointer'>
        <div className='ml-1'>
          <CommonSVG svg={SVG_Gray_PENCIL} width='18' height='18' />
        </div>
        <div
          className='w-24 text-black text-sm font-medium leading-normal'
          onClick={() => {
            identifyUser()
            openEditPracticeLocation(practiceLocationObject)
            setAddPracticeLocationStatusModal(true)
            setIsNew(false)
          }}
        >
          Edit details
        </div>
      </div>

      <When
        isTrue={
          practiceLocationObject.active &&
          practiceLocationObject?.practice_location_type === 'Secondary'
        }
      >
        <hr />
        <div
          className='flex items-center gap-2 m-2 cursor-pointer'
          onClick={() => {
            identifyUser()
            callSetPrimary(practiceLocationObject)
          }}
        >
          <CommonSVG svg={SVG_CLINIC_GRAY} width='33' height='33' />
          <div className='w-24 text-black text-sm font-medium leading-normal'>Set as primary</div>
        </div>
      </When>
    </div>
  )
}
