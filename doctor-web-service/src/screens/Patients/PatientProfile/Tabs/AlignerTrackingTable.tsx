import {useContext, useEffect, useMemo, useState} from 'react'
import BoxBadge from '../../../../components/atom/Box/BoxBadge'
import {useDispatch, useSelector} from 'react-redux'
import {RootState} from '../../../../redux/store'
import {
  capitalizeFirstLetter,
  formatPluralizedString,
  getValueOrEmptyString,
  secToHour,
} from '../../../../utils/ConstFunctions'
import ModalEditTreatment from '../../../../components/modal/PatientProfile/Tabs/TreatmentPlan/ModalEditTreatment'
import ModalConfirmEditWearDays from '../../../../components/modal/PatientProfile/Tabs/TreatmentPlan/ModalConfirmEditWearDays'
import {useLocation, useParams} from 'react-router-dom'
import {formatDatesForTreatmentPlanTable} from '../../../../utils/DateFunctions'
import hasValue from '../../../../utils/hasValue'
import SeeCompletedAligners from '../components/SeeCompletedAligners'
import When from '../../../../components/when/When'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  getFilteredRowModel,
  flexRender,
  SortingState,
  Row,
} from '@tanstack/react-table'
import ModalEditWearDays from '../../../../components/modal/PatientProfile/Tabs/TreatmentPlan/ModalEditWearDays'
import {setIsSomeAlignerSelected} from '../../../../redux/Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import WearDuration from '../components/WearDuration'
import useMappedAlignerData from '../hooks/useMappedAlignerData'
import {RowData} from '../types/Aligners.types'
import {setPageIndexBasedOnCurrentAlignerNo} from '../helpers/setPageIndexBasedOnCurrentAlignerNo'
import DownArrowIcon from '../../../../assets/icons/DownArrowIcon'
import ModalProductionLogs from '../../../../components/modal/PatientProfile/Tabs/TreatmentPlan/ModalProductionLogs'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import creationStatusConstants from '@constants/creationStatus.constants'
import progressStatusConstants from '@constants/progressStatus.constants'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import IsThereAlignerChangeModal from 'components/modal/PatientProfile/Tabs/TreatmentPlan/IsThereAlignerChangeModal'
import {ActionItem} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import actionTypes from '@constants/actionTypes'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import AlignerItemHeader from './components/AlignerItemHeader'
import AlignerItemContent from './components/AlignerItemContent'
import {Collapse} from 'antd'
import ExpandIcon from './components/ExpandIcon'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import dayjs from 'dayjs'
import {AuthContext} from 'context/AuthContext'
import useAllUserPlan from '@hooks/useAllUserPlan'

const AlignerTrackingTable = ({
  isManualTracking,
  handleActionOnClick,
  setSuccess,
}: {
  isManualTracking?: boolean
  handleActionOnClick: (option: ActionItem) => void
  setSuccess: (x: boolean) => void
}) => {
  const {id: patientUserId, patientId} = useParams()
  const location = useLocation()
  const [isEditTreatmentModel, setIsEditTreatmentModel] = useState(false)
  const [isIsThereAlignerChangeModalOpen, setIsThereAlignerChangeModalOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const [selectedWearDays, setSelectedWearDays] = useState<number>(0)
  const [isConfirmEditWearDaysModalOpen, setIsConfirmEditWearDaysModalOpen] =
    useState<boolean>(false)

  const [selectedRowDetail, setSelectedRowDetail] = useState({} as RowData)
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])

  //Bulk Update :
  const [editAlignerData, setEditAlignerData] = useState({})

  // Treatment Plan
  const {
    data: dataTreatmentPlan,
    isDiscardedTreatment,
    isEditWearDaysModelOpen,
    isProductionLogsModelOpen,
  }: any = useSelector((state: RootState) => state.apiTreatmentPlan)

  const currentAlignerNo = dataTreatmentPlan?.aligner_journeys[0]?.current_aligner_no
  const mappedAligners = useMappedAlignerData(dataTreatmentPlan)
  const treatmentDetail = dataTreatmentPlan?.aligner_journeys[0]
  const initialCurrentAlignerNumber = treatmentDetail?.initial_aligner_number

  const getAlignersColumnClassName = ({row}: {row: any}) => {
    if (row.getIsSelected()) {
      return 'font-bold text-secondaryColor'
    } else if (row.original.alignerNo === currentAlignerNo) {
      return 'text-primaryColor font-bold'
    } else if (!showButton(row.original)) {
      return 'text-grayDisabled font-medium'
    } else {
      return 'text-textColor font-medium'
    }
  }

  const showButton = (row: RowData) => {
    if (isManualTracking) {
      if (hasValue(initialCurrentAlignerNumber)) {
        return row.alignerNo >= initialCurrentAlignerNumber
      }
      return row.status !== productionStatusTypesConstants.ISSUED_TO_PATIENT
    } else {
      return (
        row.alignerNo - row.currentAlignerNo === -1 ||
        (row.alignerNo - row.currentAlignerNo >= 0 && row.alignerNo >= row.currentAlignerNo)
      )
    }
  }

  const {permissionChecks} = useFeatureAccess()
  const isAccessible = permissionChecks?.production?.addNotes?.isEditable ?? false
  const columns = useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        id: 'alignerNo',
        header: () => (
          <div className='flex gap-1'>
            Aligners <div>({mappedAligners.length})</div>
          </div>
        ),
        accessorKey: 'alignerNo',
        cell: ({row}) => {
          return (
            <div className={`${getAlignersColumnClassName({row})} text-sm`}>
              <p>
                {capitalizeFirstLetter(row.original.alignerType)} {row?.original?.alignerNo}
              </p>
            </div>
          )
        },
        enableSorting: false,
        size: 100,
      },
      {
        id: 'wearDuration',
        header: 'Wear Duration',
        accessorFn: (data) => formatDatesForTreatmentPlanTable(data.startDate, data.endDate, true),
        cell: ({row}) => (
          <WearDuration
            changeDate={row.original.changeDate}
            changeOffset={row.original.change_offset}
            startDate={row.original.startDate}
            endDate={row.original.endDate}
            isManualTracking={isManualTracking}
            disabled={!showButton(row.original)}
            showHyphen={
              row.original.status === productionStatusTypesConstants.ISSUED_TO_PATIENT &&
              (hasValue(initialCurrentAlignerNumber)
                ? isManualTracking
                  ? row.original.alignerNo < initialCurrentAlignerNumber
                  : row.original.alignerNo < initialCurrentAlignerNumber - 1
                : row.original.status === productionStatusTypesConstants.ISSUED_TO_PATIENT)
            }
          />
        ),
        // size: 350,
      },
      {
        id: 'avgWearTime',
        header: 'Avg. wear time',
        accessorKey: 'avgWearTime',
        cell: ({row}) => (
          <div className='h-11 flex justify-start items-center  text-textColor text-sm font-medium'>
            {row?.original?.avgWearTime === null || String(row?.original?.avgWearTime) === 'NaN' ? (
              <span className='text-grayDisabled'>--</span>
            ) : (
              <p>
                {' '}
                {getValueOrEmptyString(row?.original?.avgWearTime) === '--'
                  ? '--'
                  : formatPluralizedString(secToHour(row?.original?.avgWearTime), 'Hour')}
              </p>
            )}
          </div>
        ),
      },
      {
        id: 'compliance',
        header: 'Compliance',
        accessorKey: 'compliance',
        cell: ({row}) =>
          row?.original?.compliance != null ? (
            <BoxBadge title={row?.original?.compliance} />
          ) : (
            <div className='text-grayDisabled'>{'--'}</div>
          ),
      },
    ],
    [mappedAligners]
  )

  const table = useReactTable({
    columns,
    data: mappedAligners,
    state: {rowSelection, sorting},
    enableRowSelection: (row) => {
      return showButton(row.original)
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    defaultColumn: {
      size: 150,
      minSize: 50,
    },
    initialState: {
      columnVisibility: {
        productionLab: isAccessible,
        status: isAccessible,
        statusUpdatedOn: isAccessible,
        compliance: !isManualTracking,
        avgWearTime: !isManualTracking,
      },
    },
  })
  useEffect(() => {
    if (location.state?.isExtendAligner) {
      const getRow = table
        .getRowModel()
        .rows.find((row) => row.original.alignerNo === location.state.alignerNumber)
      if (getRow) {
        setSelectedRowDetail(getRow.original)
        setIsEditTreatmentModel(true)
      }
    }
  }, [])
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(
      setIsSomeAlignerSelected(table.getIsSomeRowsSelected() || table.getIsAllRowsSelected())
    )
  }, [rowSelection])

  useEffect(() => {
    if (hasValue(dataTreatmentPlan?.aligner_journeys)) {
      const alignerNo = dataTreatmentPlan.aligner_journeys[0]?.current_aligner_no
      setPageIndexBasedOnCurrentAlignerNo(alignerNo, table, dataTreatmentPlan)
    }
  }, [])

  const onPressEditTreatmentIcon = (selectedRowData: any) => {
    setIsEditTreatmentModel(true)
    setSelectedRowDetail(selectedRowData)
  }

  const changedAligners = table.getSelectedRowModel().rows.map((row: Row<RowData>) => {
    return row.original.alignerNo
  }) as number[]

  // const callUpdateStatusProductionLab = () => {
  //   if (alignerJourneyId) {
  //     const postData = {
  //       aligner_journey_id: parseInt(alignerJourneyId),
  //       aligner_nos: changedAligners,
  //       sub_status: status?.value as string,
  //       production_lab_id: productionLab?.value as number,
  //       wear_days: wearDays?.value as number,
  //     }
  //     dispatch(postApiDataStatusProductionLabUpdate(postData) as any)
  //       .unwrap()
  //       .then(() => {
  //         const postData: ApiGetData = {
  //           data: {
  //             patient_id: patientUserId ?? patientId,
  //             alignerJourneyId: alignerJourneyId,
  //           },
  //         }
  //         dispatch(postApiDataTreatmentPlan(postData) as any)
  //         setIsModalConfirmAndUpdateOpen(false)
  //       })
  //       .catch(() => {
  //         // setButtonUpdateDetailsText(TEXT_UPDATE_WEAR_DAYS)
  //       })
  //   }
  // }
  const lowerRange = dataTreatmentPlan?.aligner_journeys[0].lower_range
  const upperRange = dataTreatmentPlan?.aligner_journeys[0].upper_range
  let initialAlignerNumber
  if (lowerRange && upperRange) initialAlignerNumber = Math.min(...lowerRange, ...upperRange)
  let startAligner = mappedAligners.findIndex((item) => {
    return item.alignerNo === currentAlignerNo
  })
  let hidePreviousAligners
  if (initialAlignerNumber) {
    hidePreviousAligners = currentAlignerNo > initialAlignerNumber
    if (!hidePreviousAligners) {
      startAligner = 0
    }
  }
  const panelStyle: React.CSSProperties = {
    marginBottom: 12,
    borderRadius: '8px',
    border: '1px solid #D9D9D9',
  }
  const patientCollapsibleItems = mappedAligners
    ?.slice(showAll ? 0 : startAligner, mappedAligners.length)
    .map((row) => ({
      key: row.alignerNo,
      label: (
        <AlignerItemHeader
          {...{
            aligner: row,
            isDiscardedTreatment,
            showButton,
            onPressEditTreatmentIcon,
            initialCurrentAlignerNumber,
            isManualTracking,
          }}
        />
      ),
      children: <AlignerItemContent aligner={row} isManualTracking={isManualTracking} />,
      style: {
        ...panelStyle,
        border: `1px solid ${currentAlignerNo === row.alignerNo ? '#735BF2' : '#D9D9D9'}`,
      },
    }))

  const {userId} = useContext(AuthContext)
  const {isOrganization, isPractice, isStarterPlanUser} = useAllUserPlan()
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const patientData = data.patient_details
  const is_your_patient = patientData?.assigned_practice?.practice_doctor_id == userId

  const isAccessibleActionButton =
    (isOrganization && is_your_patient) || isStarterPlanUser || isPractice

  return (
    <>
      <div>
        <When isTrue={isIsThereAlignerChangeModalOpen}>
          <IsThereAlignerChangeModal
            setSuccess={setSuccess}
            editAlignerData={editAlignerData}
            setIsThereAlignerChangeModalOpen={setIsThereAlignerChangeModalOpen}
          />
        </When>
        <When isTrue={isEditTreatmentModel}>
          <ModalEditTreatment
            setIsEditTreatmentModel={setIsEditTreatmentModel}
            selectedRowDetail={selectedRowDetail}
            isManualTracking={isManualTracking || false}
            setIsThereAlignerChangeModalOpen={setIsThereAlignerChangeModalOpen}
            setSuccess={setSuccess}
            setEditAlignerData={setEditAlignerData}
          />
        </When>

        <When isTrue={isEditWearDaysModelOpen}>
          <ModalEditWearDays
            setSelectedWearDays={setSelectedWearDays}
            setIsConfirmEditWearDaysModalOpen={setIsConfirmEditWearDaysModalOpen}
          />
        </When>
        <When isTrue={isConfirmEditWearDaysModalOpen}>
          <ModalConfirmEditWearDays
            patientUserId={patientUserId ?? patientId}
            setIsConfirmEditWearDaysModalOpen={setIsConfirmEditWearDaysModalOpen}
            selectedWearDays={selectedWearDays}
            changedAligners={changedAligners}
          />
        </When>
        <When isTrue={isProductionLogsModelOpen}>
          <ModalProductionLogs />
        </When>

        <When
          isTrue={
            !(dataLeadsOverview.tracking?.status === treatmentPlanStatusConstants.PAUSED) &&
            treatmentDetail?.creation_status === creationStatusConstants.DONE &&
            treatmentDetail?.progress_status === progressStatusConstants.NOT_STARTED
          }
        >
          <div className='mb-3'>
            <InfoCard
              {...{
                title: 'Want to update treatment start date?',
                buttonText: 'Take me there',
                buttonClassName: 'ml-6',
                showButton: isAccessibleActionButton,
                content:
                  'You can pre-pone or post-pone the treatment by updating the start date as per your convenience',
                onClick: () => handleActionOnClick(actionTypes.UPDATE_START_DATE),
              }}
            />
          </div>
        </When>

        <When isTrue={dataLeadsOverview?.tracking.status === treatmentPlanStatusConstants.PAUSED}>
          <div className='mb-3'>
            <InfoCard
              title={`Treatment paused on ${dayjs(dataLeadsOverview?.paused_at).format(
                'DD-MMM-YYYY'
              )}`}
              className='bg-orangeSupport text-orange flex md:!justify-between !justify-start  md:border-none border border-orange'
              titleClassName='!text-orange font-semibold'
              iconColor='#BE8901'
              infoIconColor='#BE8901'
              content='Resume treatment and edit details before picking up where you left off.'
              showButton={isAccessibleActionButton}
              buttonText='Resume treatment'
              buttonClassName='border-orange text-orange  ml-6'
              onClick={() => {
                handleActionOnClick(actionTypes.RESUME_TREATMENT)
              }}
            />
          </div>
        </When>

        <div className='w-full'>
          <div className='hidden md:block'>
            <table className='table-auto w-full'>
              <thead>
                {table.getHeaderGroups().map((headerGroup, index: number) => (
                  <tr key={index} className='border-b bottom-2 border-textColor'>
                    {headerGroup.headers.map((header, index: number) => {
                      return (
                        <th
                          className={`text-start text-black text-sm font-medium py-2 px-4`}
                          key={index}
                          colSpan={header.colSpan}
                          style={{width: `${header.column.getSize()}px`}}
                        >
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            <div className='flex gap-2'>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{
                                asc: <DownArrowIcon className='transform rotate-180' />,
                                desc: <DownArrowIcon />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </div>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
                <When isTrue={!showAll && hidePreviousAligners}>
                  <tr>
                    <td colSpan={table.getHeaderGroups()[0].headers.length}>
                      <SeeCompletedAligners setShowAll={setShowAll} />
                    </td>
                  </tr>
                </When>
              </thead>
              <tbody>
                {mappedAligners.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className=''>
                      <center className='font-semibold mt-2'>No record present</center>
                    </td>
                  </tr>
                ) : (
                  table
                    .getRowModel()
                    .rows.slice(
                      // eslint-disable-next-line no-nested-ternary
                      showAll ? 0 : startAligner,
                      mappedAligners.length
                    )
                    .map((row) => {
                      const isCurrentAligner = row.original.alignerNo === currentAlignerNo
                      const isSelected = row.getIsSelected()

                      const getBackgroundColorClass = () => {
                        if (isSelected) return 'bg-[#E9F3FA]'
                        if (isCurrentAligner) return 'bg-[#F5F4FE]'
                        return ''
                      }

                      const className = `border-b border-mediumGray text-black text-base ${getBackgroundColorClass()}`
                      return (
                        <tr key={row.id} className={className}>
                          {row.getVisibleCells().map((cell) => {
                            return (
                              <td key={cell.id} className=' px-4'>
                                <div className='py-4'>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })
                )}
              </tbody>
            </table>
          </div>

          <div className='md:hidden block'>
            <When isTrue={hasValue(mappedAligners)}>
              <When isTrue={!showAll && hidePreviousAligners}>
                <SeeCompletedAligners setShowAll={setShowAll} />
              </When>

              {mappedAligners && (
                <Collapse
                  items={patientCollapsibleItems}
                  bordered={false}
                  style={{
                    padding: 0,
                    fontFamily: 'figtree',
                    backgroundColor: 'transparent',
                  }}
                  defaultActiveKey={
                    patientCollapsibleItems?.find((item) => item.key === currentAlignerNo)?.key
                  }
                  expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
                  expandIconPosition='end'
                />
              )}
            </When>
          </div>
        </div>
      </div>
    </>
  )
}

export default AlignerTrackingTable
