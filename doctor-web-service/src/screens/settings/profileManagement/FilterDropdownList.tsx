import profileManagementActionType from '@constants/profileManagementActionType'
import useDispatchAction from '@hooks/useDispatchAction'
import profileManagementActionsList from '@staticData/profileManagementActionsList'
import CheckMarkIcon from 'assets/icons/CheckMarkIcon'
import When from 'components/when/When'
import {
  getProfileManagementData,
  markProfileAsDefault,
} from 'redux/Slices/AppSlice/settings/settings.slice'
import {IProfileDetails} from '../settings.types'
import {AuthContext} from 'context/AuthContext'
import {useContext} from 'react'
import {safeParseInt} from 'utils/ConstFunctions'

const FilterDropdownList = ({profile}: {profile: IProfileDetails}) => {
  const {dispatchAction} = useDispatchAction()
  const {userId, organizationId} = useContext(AuthContext)

  const handleOnClick = async (value: keyof typeof profileManagementActionType) => {
    if (value === 'MARK_AS_DEFAULT') {
      await dispatchAction(
        markProfileAsDefault({
          data: {
            profile_id: profile?.profile_id,
            organization_id: profile?.organization_id,
            doctor_id: profile?.doctor_id,
          },
        })
      )
        .unwrap()
        .then(() => {
          dispatchAction(
            getProfileManagementData({
              doctorId: safeParseInt(userId),
              organizationId: safeParseInt(organizationId),
            })
          )
        })
    }
  }
  return (
    <div className='flex flex-col '>
      {profileManagementActionsList.map((option, index) => {
        return (
          <button
            type='button'
            onClick={() => {
              handleOnClick(option.value)
            }}
            key={index}
            className={' p-3 '}
          >
            <div className='text-black text-sm font-medium cursor-pointer w-full flex items-center gap-3'>
              <When isTrue={option.value === 'MARK_AS_DEFAULT'}>
                <CheckMarkIcon color='#666666' width='20' height='20' />
              </When>
              {option.label}
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default FilterDropdownList
