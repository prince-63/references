import React from 'react'
import actionTypes from '@constants/actionTypes'
import ActionListOptions from '@staticData/ActionListOptions'
import AlertIcon from 'assets/icons/AlertIcon'
import moment from 'moment'
import {clsx} from 'yet-another-react-lightbox'
import {IAction} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import updateCategoryConstants from '@constants/updateCategory.constants'
import When from 'components/when/When'
import alignerUpdateTypeConstants from '@constants/alignerUpdateType.constants'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'

const AlignerChangesSidebarItem = ({
  onClick,
  alignerUpdateItem,
}: {
  onClick: (action: number) => void
  alignerUpdateItem: IAction
}) => {
  const {selectedUpdate} = useSelector((state: RootState) => state.alignerTracking)
  const Icon = ActionListOptions[actionTypes.UPDATE_START_DATE].icon
  const getBackgroundStyles = () => {
    if (
      selectedUpdate === alignerUpdateItem.aligner_acton_id &&
      alignerUpdateItem.update_category !== updateCategoryConstants.CRITICAL
    ) {
      return 'bg-primarySupport border-primaryColor'
    }
    if (
      selectedUpdate === alignerUpdateItem.aligner_acton_id &&
      alignerUpdateItem.update_category === updateCategoryConstants.CRITICAL
    ) {
      return 'bg-redSupport border-red'
    }
    if (alignerUpdateItem.update_category === updateCategoryConstants.APPROVED) {
      return 'bg-tertiarySupport border-mediumGray'
    }

    return 'bg-white border-mediumGray'
  }
  return (
    <div
      className={clsx(
        'border  rounded-lg p-4 flex flex-col gap-2 cursor-pointer text-textColor font-medium mr-1',
        getBackgroundStyles()
      )}
      onClick={() => {
        onClick(alignerUpdateItem.aligner_acton_id)
      }}
    >
      <When
        isTrue={
          alignerUpdateItem.update_category === updateCategoryConstants.NEW ||
          alignerUpdateItem.update_category === updateCategoryConstants.CRITICAL
        }
      >
        <div
          className={clsx(
            'py-1 px-4 text-center  rounded-r-2xl w-fit -ml-4 text-white font-normal',
            alignerUpdateItem.update_category === updateCategoryConstants.NEW
              ? 'bg-primaryColor'
              : 'bg-red'
          )}
        >
          {alignerUpdateItem.update_category}
        </div>
      </When>
      <div className='text-lg'>
        <When isTrue={alignerUpdateItem.type === alignerUpdateTypeConstants.ALIGNER_CHANGE}>
          <span className='text-black font-semibold'>
            {capitalizeFirstLetter(alignerUpdateItem?.previous_aligner?.jaw_type)}{' '}
            {alignerUpdateItem.previous_aligner.aligner_sr_no} to{' '}
            {capitalizeFirstLetter(alignerUpdateItem?.new_aligner?.jaw_type)}{' '}
            {alignerUpdateItem.new_aligner?.aligner_sr_no}
          </span>{' '}
          <span>aligner change</span>
        </When>
        <When isTrue={alignerUpdateItem.type === alignerUpdateTypeConstants.CHECK_IN}>
          <span className='text-black font-semibold'>
            {capitalizeFirstLetter(alignerUpdateItem?.previous_aligner?.jaw_type)}{' '}
            {alignerUpdateItem?.previous_aligner?.aligner_sr_no}
          </span>{' '}
          <span>check in</span>
        </When>
        <When isTrue={alignerUpdateItem.type === alignerUpdateTypeConstants.ISSUE_REPORT}>
          <span>Reported an issue for</span>{' '}
          <span className='text-black font-semibold'>
            {capitalizeFirstLetter(alignerUpdateItem?.previous_aligner?.jaw_type)}{' '}
            {alignerUpdateItem?.previous_aligner?.aligner_sr_no}
          </span>
        </When>
      </div>
      <div className='flex gap-2 items-center text-sm '>
        <Icon color={'#666666'} width='16' height='16' />
        {moment(alignerUpdateItem.performed_at).format('DD-MMM-YYYY')}, {''}
        {moment(alignerUpdateItem.performed_at).format('hh:mm A')}
      </div>
      <When isTrue={alignerUpdateItem.update_category !== updateCategoryConstants.APPROVED}>
        <ul>
          {alignerUpdateItem.update_category_reason?.split(', ').map((item, index) => (
            <li className='flex items-center gap-2 text-red  text-sm' key={index}>
              <AlertIcon color='red' />
              {item}
            </li>
          ))}
        </ul>
      </When>
    </div>
  )
}

export default React.memo(AlignerChangesSidebarItem)
