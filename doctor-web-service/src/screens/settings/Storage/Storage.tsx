import {useContext, useEffect, useState} from 'react'
import ContainerWrapper from '../components/ContainerWrapper'
import S3_storage from 'assets/images/S3_Database_logo.png'
import Google_dive from 'assets/images/Google_Drive_logo.png'
import useSubscriptionDetails from '@hooks/useSubscriptionDetails'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  getMigrationFilesCount,
  startDataMigrationProgress,
} from 'redux/Slices/AppSlice/settings/settings.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import StorageSelection from './components/StorageSelection'
import {getSubscriptionDetails} from 'redux/Slices/AppSlice/subscription/subscription.slice'
import StorageLoaderSection from './components/StorageLoaderSection'
import {useNavigate} from 'react-router-dom'
export type Storage_type = 'S3' | 'GOOGLE_DRIVE'
export const BASE_APP_PATIENT_URL = process.env.REACT_APP_BASE_APP_PATIENT_URL

export interface Storage {
  name: string
  description: string
  image_url: string
  showComingSoon: boolean
  type: Storage_type
}

export interface MigrationJobStatus {
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | string
  total_files: number
  migrated_files: number
  remaining_files: number
}

const StorageList: Storage[] = [
  {
    name: 'Amazon-S3',
    description: 'Amazon S3 for storing various types of data',
    image_url: S3_storage,
    showComingSoon: false,
    type: 'S3',
  },
  {
    name: 'Google Drive',
    description: 'Google Drive for storing and sharing files in the cloud',
    image_url: Google_dive,
    showComingSoon: false,
    type: 'GOOGLE_DRIVE',
  },
]

const Storage = () => {
  const {profileId, userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {subscriptionData} = useSubscriptionDetails(true)
  const [storageSelected, setStorageSelected] = useState<Storage_type>(
    subscriptionData?.is_gdrive_platform_authenticated ? 'GOOGLE_DRIVE' : 'S3'
  )

  useEffect(() => {
    if (profileId == null) return
    dispatchAction(getMigrationFilesCount({profileId}))
  }, [profileId])

  useEffect(() => {
    setStorageSelected(subscriptionData?.is_gdrive_platform_enabled ? 'GOOGLE_DRIVE' : 'S3')
  }, [subscriptionData?.is_gdrive_platform_authenticated])

  const onOptionChange = (option: Storage) => {
    if (subscriptionData?.is_gdrive_platform_authenticated) {
      return
    }
    if (option.type === 'GOOGLE_DRIVE' && !subscriptionData?.is_gdrive_platform_enabled) {
      navigate('/settings/upgrade-renew-subscription')
      return
    }
    setStorageSelected(option.type)
    if (option.type === 'GOOGLE_DRIVE' && subscriptionData?.is_gdrive_platform_enabled) {
      const url = `${BASE_APP_PATIENT_URL}/patient/drive/authorize/${profileId}`
      window.open(url, '_blank', 'noopener,noreferrer') // new tab
    }
  }

  const onStartMigration = () => {
    dispatchAction(startDataMigrationProgress({profile_id: safeParseInt(profileId)}))
      .unwrap()
      .then(() => {
        dispatchAction(getSubscriptionDetails({doctor_id: safeParseInt(userId)}))
      })
      .catch(() => {})
  }

  return (
    <div className='flex flex-col gap-12 md:w-3/4'>
      <ContainerWrapper
        title='Storage '
        subTitle='Select your Storage to store files.'
        buttonText={'Migrate Data'}
        showButton={
          storageSelected === 'GOOGLE_DRIVE' &&
          (subscriptionData?.gdrive_migration_status === 'PENDING' ||
            subscriptionData?.gdrive_migration_status === null) &&
          subscriptionData?.is_gdrive_platform_authenticated
        }
        onClickButton={() => {
          onStartMigration()
        }}
        extraButtonDisable={
          subscriptionData?.gdrive_migration_status !== 'PENDING' &&
          storageSelected !== 'GOOGLE_DRIVE'
        }
      >
        <StorageSelection
          storageList={StorageList}
          selected={storageSelected}
          onSelect={onOptionChange}
        />

        <StorageLoaderSection />
      </ContainerWrapper>
    </div>
  )
}

export default Storage
