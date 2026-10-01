import React from 'react'
import ModalLayout from 'components/modal/ModalLayout'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import ButtonRed from 'components/atom/Buttons/ButtonRed'
import {useNavigate} from 'react-router-dom'
import InfoIcon from 'assets/icons/InfoIcon'
import getColorPalette from 'utils/getColorPalette'

interface propsSuccessModel {
  setStorageLimitModalVisible: any
}

const StorageExceedModal: React.FC<propsSuccessModel> = (props) => {
  const navigate = useNavigate()

  const {setStorageLimitModalVisible} = props

  const onPressBack = () => {
    setStorageLimitModalVisible(false)
  }

  const upgradeStorage = async () => {
    navigate('/settings/upgrade-renew-subscription')
  }

  return (
    <ModalLayout>
      <div className='flex flex-col items-start  text-center'>
        <div className='h-12 w-12 rounded-full bg-redSupport flex items-center justify-center'>
          <InfoIcon color={getColorPalette().red} width='24' height='24' />
        </div>

        <div className='text-black text-2xl font-bold mt-4'>Storage Limit Exceeded</div>

        <div className='text-textColor text-base font-normal text-start leading-snug mt-2'>
          {
            'Your current plan allows up to 10GB of total file storage, and uploading these files would go over that limit.'
          }
        </div>
        <div className=' border border-mediumGray rounded-xl p-4 mt-4'>
          <p className='text-textColor text-start font-medium mb-2'>To continue, you can:</p>
          <ol className='list-decimal pl-4 text-base text-start text-black space-y-2'>
            <li>
              <span className='font-semibold text-start'>Upgrade your plan for more storage.</span>
            </li>
            <li>
              <span className='font-semibold text-start'>
                Upload files in smaller batches within your remaining space.
              </span>
            </li>
          </ol>
        </div>
        <div className='flex flex-col md:flex-row justify-center gap-4 mt-6 w-full max-w-md'>
          <ButtonOutlined
            text='Go back'
            onClick={() => onPressBack()}
            className='w-full md:w-1/2 h-14 border-red text-red'
          />
          <ButtonRed
            text='Upgrade'
            onClick={() => {
              upgradeStorage()
            }}
            className='w-full md:w-1/2 h-14'
          />
        </div>
      </div>
    </ModalLayout>
  )
}

export default StorageExceedModal
