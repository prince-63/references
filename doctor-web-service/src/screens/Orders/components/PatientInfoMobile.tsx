import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {Image} from '../../../assets/images/Images/Image'
import hasValue from 'utils/hasValue'
import {useState} from 'react'

import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import When from 'components/when/When'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import clsx from 'clsx'

import FirstAidKit from 'assets/icons/FirstAidKit'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import getColorPalette from 'utils/getColorPalette'

const PatientDetailItem = ({
  svg,
  title,
  value,
  iconHeight,
  className,
  icon,
}: {
  svg?: any
  title?: string | null
  value: React.ReactNode | null
  iconHeight?: string
  className?: string
  icon?: React.ReactNode
}) => {
  const emptyText = title === 'Practice Location' ? 'Not assigned' : 'Not added'
  return (
    <div className='flex gap-2 items-center'>
      <When isTrue={!hasValue(icon)}>
        <CommonSVG width='28' svg={svg} className={clsx('hidden md:block min-w-7', className)} />
        <CommonSVG height={iconHeight || '28'} width='28' svg={svg} className='md:hidden' />
      </When>
      <When isTrue={hasValue(icon)}>{icon}</When>
      <div className='flex flex-col gap-0'>
        <div className='text-sm md:text-textColor font-medium w-[200px] truncate ...'>
          {value == null ? emptyText : value}
        </div>
        <div className='text-xs text-textColor font-normal  md:block'>{title}</div>
      </div>
    </div>
  )
}

const PatientInfoMobile = () => {
  const {order} = useSelector((state: RootState) => state.orders)
  const patientData = order.patient_details
  const [isCollapsed, setIsCollapsed] = useState(true)
  const {permissionChecks} = useFeatureAccess()
  const practicesPermissions = permissionChecks?.patientProfileActions?.assignee?.isViewable

  return (
    <>
      <div
        className='  px-5 pt-5  flex flex-col gap-2 w-full '
        onClick={() => setIsCollapsed((prev) => !prev)}
      >
        <div className=' text-textColor font-semibold text-lg flex justify-between items-center'>
          <span className='hidden md:block'>Patient Details</span>
        </div>

        <div className='flex-[2] flex gap-2 items-center w-full border-b border-b-mediumGray pb-3 truncate ...'>
          {hasValue(patientData?.profile_picture_url) ? (
            <Image
              className='min-w-11 min-h-11 w-11 h-11 max-w-11 max-h-11 object-cover rounded-full'
              src={patientData.profile_picture_url ?? ''}
            />
          ) : (
            <DefaultImage letter={patientData?.first_name.charAt(0)} />
          )}
          <div className='flex flex-col justify-center'>
            <div className='text-xl text-black font-bold w-[200px] truncate ...'>
              {patientData?.first_name} {patientData?.last_name}
            </div>
            <div className='text-textColor text-sm'>ID: #{patientData?.uuid}</div>
            <div className='text-textColor text-sm '>
              <When isTrue={hasValue(patientData?.gender || patientData?.age)}>
                <span>
                  {patientData?.gender === 'OTHER'
                    ? 'Prefer not to say'
                    : capitalizeFirstLetter(patientData?.gender, false)}
                  <When isTrue={hasValue(patientData?.gender && patientData?.age)}>
                    <span> | </span>
                  </When>
                  <When isTrue={hasValue(patientData?.age)}>{patientData?.age} years</When>
                </span>
              </When>
              <When isTrue={!hasValue(patientData?.gender) && !hasValue(patientData?.age)}>
                <span>--</span>
              </When>
            </div>
          </div>
        </div>

        {/* <When isTrue={!isCollapsed}> */}
        <div className={clsx('flex-col gap-2 justify-center  mt-2  md:flex')}>
          <When isTrue={practicesPermissions}>
            <PatientDetailItem
              icon={
                <div className='bg-primarySupport rounded-md p-1'>
                  <FirstAidKit color={getColorPalette().secondaryColor} />
                </div>
              }
              title={'Assigned practice'}
              className='bg-secondarySupport p-[2px] rounded'
              iconHeight='14'
              value={
                <div>
                  <div>
                    {hasValue(patientData?.assigned_practice) &&
                      patientData?.assigned_practice?.name}
                  </div>
                </div>
              }
            />
          </When>
        </div>

        {/* Mobile design Start--------------------------------------------------------------> */}
        <div
          className={clsx(
            ' flex flex-col gap-2 justify-center pb-4 md:hidden',
            isCollapsed && 'hidden '
          )}
        ></div>

        {/* Mobile design End--------------------------------------------------------------> */}
      </div>
    </>
  )
}

export default PatientInfoMobile
