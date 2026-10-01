import React from 'react'
import {Progress} from 'antd'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const StorageLoaderSection = () => {
  const {dataMigrationCountsData} = useSelector((state: RootState) => state.settings)

  const migrationData = dataMigrationCountsData

  const showCounts = migrationData && migrationData.total_files > 0
  const totalFiles = migrationData?.total_files ?? 0
  const migratedFiles = migrationData?.migrated_files ?? 0
  const calculatedProgress =
    totalFiles > 0 ? Math.min(100, Math.round((migratedFiles / totalFiles) * 100)) : 0
  const migrationStatus = migrationData?.status ?? null

  return (
    <div className='mt-10 space-y-4'>
      {/* STARTED */}
      {(migrationStatus === 'IN_PROGRESS' || migrationStatus === 'STARTED') && (
        <div>
          <div className='text-textColor font-medium'>Migration in Progress</div>
          <div className='text-sm text-textColor'>
            {'Files are being migrated in the background.'}
          </div>

          <div className='mt-3'>
            <Progress
              percent={calculatedProgress}
              percentPosition={{align: 'end', type: 'outer'}}
            />
          </div>

          {showCounts && (
            <div className='mt-2 text-xs text-textColor grid grid-cols-2 gap-y-1 gap-x-4'>
              <div>
                <span className='font-medium'>Total files: </span>
                {migrationData?.total_files ?? 0}
              </div>
              <div>
                <span className='font-medium'>Migrated: </span>
                {migrationData?.migrated_files ?? 0}
              </div>
              <div>
                <span className='font-medium'>Remaining: </span>
                {migrationData?.remaining_files ?? 0}
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPLETED */}
      {migrationStatus === 'COMPLETED' && (
        <div>
          <div className='text-textColor font-medium'>Migration Successfully Completed</div>
          <div className='text-sm text-textColor'>{'All files have been migrated.'}</div>
          <div className='mt-2'>
            <Progress percent={100} percentPosition={{align: 'end', type: 'outer'}} />
          </div>

          {showCounts && (
            <div className='mt-2 text-xs text-textColor grid grid-cols-2 gap-y-1 gap-x-4'>
              <div>
                <span className='font-medium'>Total files: </span>
                {migrationData?.total_files ?? 0}
              </div>
              <div>
                <span className='font-medium'>Migrated: </span>
                {migrationData?.migrated_files ?? 0}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FAILED */}
      {migrationStatus === 'FAILED' && (
        <div>
          <div className='text-red font-medium'>Migration Failed</div>
          <div className='text-sm text-textColor'>
            {'Please contact the administrator for migration support.'}
          </div>
          <div className='mt-2'>
            <Progress
              percent={100}
              status='exception'
              percentPosition={{align: 'end', type: 'outer'}}
            />
          </div>

          {showCounts && (
            <div className='mt-2 text-xs text-textColor grid grid-cols-2 gap-y-1 gap-x-4'>
              <div>
                <span className='font-medium'>Total files: </span>
                {migrationData?.total_files ?? 0}
              </div>
              <div>
                <span className='font-medium'>Migrated: </span>
                {migrationData?.migrated_files ?? 0}
              </div>
              <div>
                <span className='font-medium'>Remaining: </span>
                {migrationData?.remaining_files ?? 0}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default StorageLoaderSection
