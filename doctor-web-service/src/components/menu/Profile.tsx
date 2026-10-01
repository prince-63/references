import cn from '@utils/cn'
import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import {Image} from 'assets/images/Images/Image'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import When from 'components/when/When'
import {ReactNode} from 'react'
import {IDoctorProfileDetails} from 'redux/Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import {getImageUrlById, getSalutations} from 'utils/ConstFunctions'

const Profile = ({
  profile,
  className,
  profileInitialClassName,
  onClick,
  showCheckMarkIcon,
  subText,
}: {
  profile: IDoctorProfileDetails
  className?: string
  profileInitialClassName?: string
  onClick?: () => void
  showCheckMarkIcon?: boolean
  subText?: ReactNode
}) => {
  const doctorFullName = `${getSalutations(profile?.salutation ?? '')} ${profile?.first_name} ${
    profile?.last_name ?? ''
  }`
  return (
    <div
      className={cn('flex justify-between cursor-pointer items-center', className)}
      onClick={onClick}
    >
      <div className={cn('flex gap-3')}>
        {profile?.profile_picture || profile?.profile_picture_id ? (
          <Image
            className='w-10 h-10 rounded-[4px] object-cover cursor-pointer bg-transparent'
            src={
              profile?.profile_picture_id
                ? getImageUrlById(profile?.profile_picture_id)
                : (profile?.profile_picture ?? '')
            }
            alt='profile photo'
          />
        ) : (
          <PatientProfileInitials
            {...{
              name: profile?.first_name ?? '',
              className: cn('min-w-10 min-h-10 rounded-[4px]', profileInitialClassName),
            }}
          />
        )}
        <div className='flex flex-col gap-0.5 text-sm '>
          <p className='font-semibold'>{doctorFullName}</p>
          <p className=' text-textColor'> {subText}</p>
        </div>
      </div>
      <When isTrue={showCheckMarkIcon}>
        <CheckMarkIcon width='16' height='16' />
      </When>
    </div>
  )
}

export default Profile
