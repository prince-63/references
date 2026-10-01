import {useContext, useMemo, useState} from 'react'
import ModelNewChat from '../../../../components/modal/PatientProfile/Tabs/Chat/ModelNewChat'
import {AuthContext} from '../../../../context/AuthContext'
import {SVG_PLUS_WHITE} from '../../../../utils/SvgConstants'
import CommonSVG from '../../../../components/atom/SVG/CommonSVG'
import BroadCastPatientsListDrawer from './broadCast/BroadCastPatientsListDrawer'
import BroadCastSelectMessageDrawer from './broadCast/BroadCastSelectMessageDrawer'
import {IndeterminateCheckbox} from 'screens/Patients/PatientProfile/components/IndeterminateCheckbox'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import {Image} from 'assets/images/Images/Image'
import {rankItem} from '@tanstack/match-sorter-utils'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  ColumnDef,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import useMappedBroadcastPatients from './broadCast/hooks/useMappedBroadcastPatients'
import {RowDataForBroadcastListPatients} from './broadCast/broadCastTypes'
import PlusIcon from 'assets/icons/PlusIcon'
import hasValue from 'utils/hasValue'
import {formatPluralizedString, secToHour, getImageUrl, getImageUrlById} from 'utils/ConstFunctions'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
interface Props {
  onPatientChatClick: () => void
  data: any
  toggleSelectPatientDrawer: (value: boolean) => void
  showSelectPatientDrawer: boolean
  showAddMessageDrawer: boolean
  toggleAddMessageDrawer: (value: boolean) => void
}
export const ChatHeader = (props: Props) => {
  const {demoModeStatus} = useContext(AuthContext)
  const {
    onPatientChatClick,
    data,
    toggleAddMessageDrawer,
    toggleSelectPatientDrawer,
    showSelectPatientDrawer,
    showAddMessageDrawer,
  } = props
  const [newPatientChatModel, setNewPatientChatModel] = useState(false)

  const {broadCastPatientsList} = useSelector((state: RootState) => state.apiChatList)
  const [selectedImage, setSelectedImage] = useState<RowDataForBroadcastListPatients>({
    patient_name: '',
    patient_id: 0,
    patient_mobile_number: 0,
    patient_email_id: '',
    patient_profile_photo: '',
    aligner_brand_name: '',
    current_aligner_number: 0,
    total_aligners: 0,
    avg_wear_time_in_sec: 0,
  })
  const [rowSelection, setRowSelection] = useState({})
  const rowFiles = useMappedBroadcastPatients({patientsList: broadCastPatientsList})
  const [isShowPhotos, setIsShowPhotos] = useState(false)
  const columns = useMemo<ColumnDef<RowDataForBroadcastListPatients>[]>(
    () => [
      {
        id: 'select',
        header: ({table}) => (
          <div className='pr-3 md:pr-0'>
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getSelectedRowModel().rows.length > 0,
                onChange: () => {
                  const visibleRows = table.getRowModel().rows
                  const allVisibleSelected = visibleRows.every((row) => row.getIsSelected())
                  visibleRows.forEach((row) => row.toggleSelected(!allVisibleSelected))
                },
                className: '  primary-checkbox ',
              }}
            />
          </div>
        ),
        cell: ({row}) => (
          <div className='pr-3 md:pr-0'>
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
                className: '  primary-checkbox ',
              }}
            />
          </div>
        ),
      },
      {
        id: 'patient_name',
        header: ({}) => <RenderTableHeader {...{header: 'Select patients'}} />,
        enableGlobalFilter: true,
        accessorKey: 'patient_name',
        //@ts-ignore
        filterFn: 'fuzzy',
        cell: ({row}) => {
          const url = row?.original?.profile_image_id
            ? getImageUrlById(row?.original?.profile_image_id)
            : row.original.patient_profile_photo

          return (
            <RenderCell>
              <div className='flex gap-2 cursor-default items-center'>
                {hasValue(url) ? (
                  <Image
                    className='w-8 h-8 rounded-full  object-cover cursor-pointer bg-transparent'
                    src={
                      getImageUrl({
                        url: url,
                        is_gdrive_platform:
                          row?.original?.patient_profile_photo?.includes('patient/drive/image/'),
                        drive_file_id: row?.original?.patient_profile_photo?.match(
                          /patient\/drive\/image\/([^/?#]+)/
                        )?.[1],
                      }) || row.original.patient_profile_photo
                    }
                    alt='patient photo'
                    size={20}
                    showLoading={true}
                    onClick={(e: React.MouseEvent<HTMLImageElement>) => {
                      e.stopPropagation()
                      setSelectedImage(row.original)
                      setIsShowPhotos(true)
                    }}
                  />
                ) : (
                  <PatientProfileInitials {...{name: row.original.patient_name}} />
                )}

                <div className='flex flex-col'>
                  <p className='text-black text-base font-semibold'>{row.original.patient_name}</p>
                  <p className='text-textColor font-medium text-sm'>
                    {row.original.aligner_brand_name} • {row.original.current_aligner_number}/
                    {row.original.total_aligners} aligners • Avg. wear time{' '}
                    {formatPluralizedString(secToHour(row?.original?.avg_wear_time_in_sec), 'Hour')}
                  </p>
                </div>
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'patient_email_id',
        //@ts-ignore
        filterFn: 'fuzzy',
        accessorKey: 'patient_email',
      },
      {
        id: 'patient_mobile_number',
        //@ts-ignore
        filterFn: 'fuzzy',
        accessorKey: 'patient_mobile_number',
      },
    ],
    [rowFiles]
  )
  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({
      itemRank,
    })
    return itemRank.passed
  }
  const [searchName, setSearchName] = useState<string>('')

  const table = useReactTable({
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    data: rowFiles,
    state: {rowSelection, globalFilter: searchName},
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setSearchName,
    //@ts-ignore
    globalFilterFn: 'fuzzy',
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      columnVisibility: {
        patient_mobile_number: false,
        patient_email_id: false,
      },
    },
  })

  return (
    <div className=''>
      {newPatientChatModel && (
        <ModelNewChat
          setNewPatientChatModel={setNewPatientChatModel}
          onPatientChatClick={onPatientChatClick}
          data={data}
        />
      )}

      <div className='flex justify-between items-end'>
        <div>
          <div className='w-full text-black text-2xl font-semibold'>Patient chats</div>
          <div className='w-full text-textColor text-base font-normal'>
            Chat with your patients and resolve their concerns
          </div>
        </div>
        <div className='flex gap-3'>
          <BroadCastPatientsListDrawer
            {...{
              showSelectPatientDrawer,
              toggleSelectPatientDrawer,
              toggleAddMessageDrawer,
              table,
              searchName,
              setSearchName,
              isShowPhotos,
              setIsShowPhotos,
              selectedImage,
            }}
          />
          <BroadCastSelectMessageDrawer
            {...{showAddMessageDrawer, toggleAddMessageDrawer, toggleSelectPatientDrawer, table}}
          />
          <button
            className='w-30 h-10 px-3.5 py-2.5 border border-primaryColor rounded-lg justify-center items-center gap-2 md:inline-flex hidden'
            disabled={demoModeStatus ? true : false}
            onClick={() => toggleSelectPatientDrawer(true)}
          >
            <PlusIcon />
            <div className='text-primaryColor text-sm font-semibold'>New Broadcast</div>
          </button>
          <button
            className='w-30 h-10 px-3.5 py-2.5 bg-primaryColor rounded-lg justify-center items-center gap-2 md:inline-flex hidden'
            disabled={demoModeStatus ? true : false}
            onClick={() => setNewPatientChatModel(true)}
          >
            <CommonSVG svg={SVG_PLUS_WHITE} width='16' height='16' />
            <div className='text-white text-sm font-semibold'>New Chat</div>
          </button>
        </div>
      </div>
    </div>
  )
}
