import React from 'react'
import {IProfileDetails} from '../settings.types'
import PhotoUpload from '../components/PhotoUpload'
import Tag from 'components/tags/Tag'
import {Popover} from 'antd'
import VerticalDotsIcon from 'assets/icons/VerticalDotsIcon'
import FilterDropdownList from './FilterDropdownList'
import When from 'components/when/When'
import {capitalizeFirstLetter, getImageUrlById} from 'utils/ConstFunctions'

interface ProfileItemProps {
  profile: IProfileDetails
  setIsPopoverVisible: React.Dispatch<React.SetStateAction<number | null>>
  isPopoverVisible: number | null
  roles?: any[] // Add roles prop
  userRoleInfo?: {
    isPractice?: boolean
    isCustomer?: boolean
    isVendor?: boolean
    isLabStaff?: boolean
  }
  subscriptionPlanName?: any
  ownerOrgName?: string
}

const ProfileItem: React.FC<ProfileItemProps> = ({
  profile,
  setIsPopoverVisible,
  isPopoverVisible,
  userRoleInfo = {},
  subscriptionPlanName,
  ownerOrgName = '', // Fixed the syntax error here
}) => {
  const {isPractice, isCustomer, isVendor, isLabStaff} = userRoleInfo

  return (
    <button
      className='flex justify-between items-center w-full p-3 rounded-md hover:bg-gray-50 transition-all'
      type='button'
      onClick={() => {
        if (profile?.default) return
        setIsPopoverVisible(profile?.profile_id)
      }}
    >
      <div className='flex gap-3 items-center'>
        <PhotoUpload
          id={`profilePicture-${profile?.profile_id}`}
          src={
            profile?.profile_image_id
              ? getImageUrlById(profile?.profile_image_id)
              : (profile.profile_url ?? '')
          }
          isEditClicked={false}
          initials={profile?.profile_name[0]?.toUpperCase() ?? ''}
        />
        <div className='flex flex-col text-left'>
          <div className='flex gap-2 items-center'>
            <p className='text-base font-semibold text-black'>{profile?.profile_name}</p>
            {profile?.default && (
              <Tag value='DEFAULT' className='bg-lightGray text-textColor text-xs' />
            )}
          </div>
          {!isCustomer && !isVendor && (
            <p className='text-textColor'>
              {isPractice || isLabStaff
                ? ownerOrgName // Use ownerOrgName prop instead of profile.owner_organization_name
                : capitalizeFirstLetter(
                    subscriptionPlanName === 'DESIGN_LAB' ? 'Design Lab' : subscriptionPlanName
                  )}
            </p>
          )}
        </div>
      </div>
      <When isTrue={!profile?.default}>
        <Popover
          content={<FilterDropdownList {...{profile}} />}
          trigger={['click']}
          open={isPopoverVisible === profile?.profile_id}
          onOpenChange={(visible) => {
            setIsPopoverVisible(visible ? profile?.profile_id : null)
          }}
          overlayInnerStyle={{padding: '4px', fontFamily: 'figtree'}}
          style={{fontFamily: 'figtree'}}
          placement='bottomRight'
          getTooltipContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
        >
          <button className='rounded-lg flex justify-center items-center border border-primaryColor p-1 bg-primarySupport hover:opacity-90 transition'>
            <VerticalDotsIcon key={profile?.profile_id} />
          </button>
        </Popover>
      </When>
    </button>
  )
}

export default ProfileItem
