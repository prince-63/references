import React from 'react'
import clsx from 'clsx'
import {Storage, Storage_type} from '../Storage'
import When from 'components/when/When'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'

type Props = {
  storageList: Storage[]
  selected: Storage_type
  onSelect: (option: Storage) => void
}

const StorageSelection = ({storageList, selected, onSelect}: Props) => {
  const {subscriptionData} = useSubscriptionDetails()
  const isDisabledS3 = subscriptionData?.gdrive_migration_status !== 'PENDING'
  return (
    <div className='flex gap-3 flex-wrap'>
      {storageList.map((option: Storage, index) => (
        <div
          key={index}
          className={clsx(
            'w-[400px] flex flex-col justify-between items-center gap-3 p-2 rounded-lg cursor-pointer border transition-shadow',
            option.type === selected ? 'shadow-md border-primaryColor' : 'border-mediumGray',
            option.type === 'S3' && isDisabledS3 && 'opacity-50 !cursor-not-allowed'
          )}
          onClick={() => onSelect(option)}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(option)}
        >
          <div className='flex justify-center bg-secondarySupport rounded-lg w-full'>
            <img
              src={option.image_url}
              className='w-[150px] h-[150px] object-contain  p-2'
              alt={option.name}
            />
          </div>

          <div className='flex justify-between items-center mt-[10px] w-full px-2'>
            <When isTrue={option.showComingSoon}>
              <div className='w-auto h-6 px-2 py-1 bg-secondarySupport rounded-2xl flex items-center'>
                <div className='text-secondaryColor text-xs font-semibold'>Coming soon</div>
              </div>
            </When>
          </div>

          <div className='mb-2 text-center px-2'>
            <div className='text-black text-2xl font-bold leading-none'>{option.name}</div>
            <div className='text-textColor font-medium text-sm mt-2'>{option.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StorageSelection
