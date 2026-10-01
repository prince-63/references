import {Popover} from 'antd'
import ProfileDropDown from './ProfileDropDown'
import {Image} from 'assets/images/Images/Image'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {memo, useContext, useMemo, useState} from 'react'
import cn from '@utils/cn'
import When from 'components/when/When'
import {getImageUrlById, getSalutations, safeParseInt} from 'utils/ConstFunctions'
import TextWithTooltip from 'components/section/TextWithTooltip'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import AddProfile from './AddProfile'
import getActiveProfile from '@utils/getActiveProfile'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getPlanDisplayName} from 'utils/subscriptionPlan'

const DoctorProfileBox = ({isCollapsed, isMobile}: {isCollapsed: boolean; isMobile?: boolean}) => {
  const {profileId} = useContext(AuthContext)
  const activeProfile = useSelector((state: RootState) =>
    getActiveProfile(state.apiDoctorProfileGet.doctorData?.profiles, safeParseInt(profileId))
  )
  const {subscriptionData} = useSubscriptionDetails()
  const subscriptionPlanName = subscriptionData?.plan_metadata?.plan_name
  const [openCollapsed, setOpenCollapsed] = useState(false)
  const {isPractice, isCustomer, isVendor} = useAllUserPlan()
  const [openAddProfile, setOpenAddProfile] = useState(false)
  const doctorFullName = useMemo(
    () =>
      `${getSalutations(activeProfile?.salutation ?? '')} ${activeProfile?.first_name ?? ''} ${activeProfile?.last_name ?? ''}`,
    [activeProfile?.first_name, activeProfile?.last_name, activeProfile?.salutation]
  )

  return (
    <div className='my-2'>
      <AddProfile openAddProfile={openAddProfile} setOpenAddProfile={setOpenAddProfile} />
      <Popover
        content={<ProfileDropDown {...{setOpenCollapsed, setOpenAddProfile}} />}
        trigger={['click']}
        open={openCollapsed}
        overlayInnerStyle={{
          padding: '0px',
          fontFamily: 'figtree',
          minWidth: `${isMobile ? '' : '296px'}`,
        }}
        style={{fontFamily: 'figtree'}}
        placement={!isMobile ? 'rightBottom' : 'bottomLeft'}
        onOpenChange={(open) => setOpenCollapsed(open)}
        getPopupContainer={() => document.getElementById('sidebar-container')!}
      >
        <div
          className={cn(
            'rounded-lg flex border border-mediumGray p-2 justify-between cursor-pointer ',
            openCollapsed && 'shadow border-primaryColor',
            isCollapsed && 'm-2'
          )}
        >
          <div className={cn('flex gap-3')}>
            {activeProfile?.profile_picture || activeProfile?.profile_picture_id ? (
              <Image
                className='w-10 h-10 rounded-[4px] object-cover cursor-pointer bg-transparent'
                src={
                  activeProfile?.profile_picture_id
                    ? getImageUrlById(activeProfile?.profile_picture_id)
                    : (activeProfile?.profile_picture ?? '')
                }
                alt='profile photo'
              />
            ) : (
              <PatientProfileInitials
                {...{
                  name: activeProfile?.first_name ?? '',
                  className: cn(
                    'min-w-10 min-h-10 rounded-[4px]',
                    openCollapsed && 'bg-primarySupport text-primaryColor'
                  ),
                }}
              />
            )}
            <When isTrue={!isCollapsed}>
              <div className='flex flex-col justify-center gap-0.5 text-sm '>
                <TextWithTooltip className='font-semibold truncate ...' desktopCharacterCount={22}>
                  {doctorFullName ?? ''}
                </TextWithTooltip>
                <>
                  {!isCustomer && !isVendor && (
                    <p className=' text-textColor'>
                      {isPractice
                        ? activeProfile?.owner_organization_name
                        : getPlanDisplayName(subscriptionPlanName)}
                    </p>
                  )}
                </>
              </div>
            </When>
          </div>
          <When isTrue={!isCollapsed}>
            <button type='button'>
              <CaretRightIcon color='#666666' />
            </button>
          </When>
        </div>
      </Popover>
    </div>
  )
}

export default memo(DoctorProfileBox)
