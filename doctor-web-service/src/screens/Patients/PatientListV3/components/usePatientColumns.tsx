import {useMemo} from 'react'
import {ColumnDef} from '@tanstack/react-table'
import {PatientSummaryDTO} from '../types'
import {DefaultImage} from 'assets/images/Images/DefaultImage'
import {Image} from 'assets/images/Images/Image'
import cn from '@utils/cn'
import {getStatusConfig, StatusConfig} from '@utils/getStatusConfig'
import dayjs from 'dayjs'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {getImageUrl, getImageUrlById} from 'utils/ConstFunctions'

const usePatientColumns = (isVspPlanning = false, isArchived = false) => {
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  const {isPractice} = useAllUserPlan()

  const columns = useMemo<ColumnDef<PatientSummaryDTO>[]>(() => {
    const allColumns: ColumnDef<PatientSummaryDTO>[] = [
      {
        header: 'PATIENT',
        accessorKey: 'full_name',
        cell: ({row}) => {
          const src = row.original?.profile_image_id
            ? getImageUrlById(row.original.profile_image_id)
            : isArchived
              ? row.original?.profile_picture_id
                ? getImageUrlById(row.original.profile_picture_id)
                : row.original?.profile_picture_url
              : row.original?.profile_picture_url

          const driveImageMatch = src?.match(/patient\/drive\/image\/([^/?#]+)/)
          const driveFileId = driveImageMatch?.[1]
          const resolvedAvatarSrc =
            src && src.includes('patient/drive/image/') && driveFileId
              ? getImageUrl({
                  url: src,
                  is_gdrive_platform: true,
                  drive_file_id: driveFileId,
                })
              : src

          return (
            <div className='flex items-center gap-3'>
              {resolvedAvatarSrc ? (
                <Image
                  src={resolvedAvatarSrc}
                  className='w-11 h-11 object-cover rounded-full'
                  showLoading={true}
                />
              ) : (
                <DefaultImage letter={row.original.full_name?.trim().charAt(0)} />
              )}
              <span className='font-semibold text-gray-900'>{row.original.full_name}</span>
            </div>
          )
        },
      },
      {
        header: 'CLINIC',
        accessorKey: 'practice_location_name',
        cell: ({getValue}) => (
          <span className='text-gray-500 uppercase text-xs font-semibold'>
            {(getValue() as string) || '-'}
          </span>
        ),
      },
      {
        header: 'ID',
        accessorKey: 'customer_mapped_id',
        cell: ({getValue}) => (
          <span className='text-gray-500 uppercase text-xs font-semibold'>
            {(getValue() as string) || '-'}
          </span>
        ),
      },
      {
        header: 'PRODUCT',
        accessorKey: 'product_name',
        cell: ({getValue}) => (
          <span className='text-gray-500 uppercase text-xs font-semibold'>
            {(getValue() as string) || '-'}
          </span>
        ),
      },
      ...(!isArchived
        ? [
            ...(serviceConfig?.PLANNING
              ? [
                  {
                    header: 'CASE TYPE',
                    accessorKey: 'case_type',
                    cell: ({row}: any) => (
                      <span className='text-gray-500 uppercase text-xs font-semibold'>
                        {(row.original.case_type as string) || '-'}
                      </span>
                    ),
                  } as ColumnDef<PatientSummaryDTO>,
                ]
              : []),
            {
              header: 'STATUS',
              accessorKey: 'order_status',
              cell: ({row}: any) => {
                const order_status =
                  (row.original.order_status as string) ||
                  (row.original.vsp_order_status as string) ||
                  'DRAFT'
                const config: StatusConfig = getStatusConfig(order_status) as StatusConfig

                return (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1 rounded-full w-fit',
                      config.badge
                    )}
                  >
                    <span className={config.text}>{config.icon}</span>
                    <span className={`${config.text} text-xs font-semibold uppercase`}>
                      {config.label}
                    </span>
                  </div>
                )
              },
            },
          ]
        : isPractice && isArchived
          ? [
              {
                header: 'ARCHIVED ON',
                accessorKey: 'archived_on',
                cell: ({getValue}: any) => {
                  const value = getValue() as string | null
                  return (
                    <span className='text-gray-500 text-xs font-semibold'>
                      {value ? dayjs(value).format('MMM D, YYYY') : '-'}
                    </span>
                  )
                },
              },
            ]
          : []),
      {
        header: 'LAST UPDATED',
        accessorKey: 'last_updated',
        cell: ({getValue}) => {
          const value = getValue() as string | null
          return (
            <span className='text-gray-500 text-xs font-semibold'>
              {value ? dayjs(value).format('MMM D, YYYY h:mm A') : '-'}
            </span>
          )
        },
      },
    ]

    if (!isVspPlanning) {
      return allColumns
    }

    const vspVisibleColumns = new Set([
      'full_name',
      'customer_mapped_id',
      'product_name',
      'order_status',
      'last_updated',
      'archived_on',
    ])

    return allColumns.filter((column) => {
      const accessorKey = (column as any).accessorKey
      return typeof accessorKey === 'string' && vspVisibleColumns.has(accessorKey)
    })
  }, [isVspPlanning, isArchived, isPractice, serviceConfig?.PLANNING])

  return columns
}

export default usePatientColumns
