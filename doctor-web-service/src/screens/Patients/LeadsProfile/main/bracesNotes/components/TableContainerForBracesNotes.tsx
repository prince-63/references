import React, {useContext, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import dayjs from 'dayjs'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {MoreVertical} from 'lucide-react'

import When from 'components/when/When'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import RenderTableHeader from '../../files/components/RenderTableHeader'
import RenderCell from '../../files/components/RenderCell'
import cn from '@utils/cn'
import useMappedBracesNotes from '../useMappedBracesNotes'
import {RowDataForBracesNotesList} from '../../appointments/types/appointments.types'
import JawDetailsForBracesNotesListItem from './JawDetailsForBracesNotesListItem'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate, useParams} from 'react-router-dom'
import {
  getBracesNotesDetails,
  getBracesNotesList,
  postDeleteAppointment,
  setAppointmentDetails,
} from 'redux/Slices/AppSlice/BracesNotes/BracesNotes.slice'
import appointmentJawTypes from '@constants/appointmentJawTypes'
import productTypes from '@constants/productTypes'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import NotesIcon from 'assets/icons/NotesIcon'
import calendarEventsConstants from '@constants/calendarEvents.constants'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_DELETE, SVG_PENCIL_DARK_GRAY} from 'utils/SvgConstants'
import SuccessToast from 'components/modal/Alert/SuccessToast'

interface TableContainerForBracesNotesProps {
  setEditingAppointmentId?: (id: string | null) => void
}

const TableContainerForBracesNotes: React.FC<TableContainerForBracesNotesProps> = ({
  setEditingAppointmentId,
}) => {
  const {bracesNotesList} = useSelector((state: RootState) => state.bracesNotes)
  const appointmentRows = useMappedBracesNotes({appointments: bracesNotesList})
  const {userId, profileId, organizationId}: any = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigation = useNavigate()
  const {patientId, bracesJourneyId} = useParams()

  // state for per-row menu
  const [openMenuRowId, setOpenMenuRowId] = useState<number | null>(null)

  // state for delete modal
  const [deleteEventModalVisible, setDeleteEventModalVisible] = useState(false)
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null)

  const goToViewAppointment = (appointmentId: number) => {
    dispatchAction(
      getBracesNotesDetails({
        appointment_id: appointmentId.toString() ?? '',
      })
    )
      .unwrap()
      .then((res: any) => {
        const emptyJawTypes = {
          jaw_type: '',
          treatment_stage_type: '',
          shape: '',
          material_name: '',
          material_size: '',
          space_enclosure_tools: [],
          accessories: [],
          note: '',
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        }

        const createJawDetails = (jaw: {
          note: string
          jaw_type: string
          treatment_stage_type: string
          shape: string
          material_name: string
          material_size: string
          space_enclosure_tools: string
          accessories: string
        }) => ({
          jaw_type: jaw.jaw_type,
          treatment_stage_type: jaw.treatment_stage_type,
          shape: jaw.shape,
          material_name: jaw.material_name,
          material_size: jaw.material_size,
          space_enclosure_tools: jaw.space_enclosure_tools,
          accessories: jaw.accessories,
          note: jaw.note,
          input_material_name: '',
          input_material_size: '',
          input_space_enclosure_tools: '',
          input_accessories: '',
        })

        const bothJaw = res.jaws.find(
          (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.BOTH
        )
        const upperJaw = res.jaws.find(
          (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.UPPER
        )
        const lowerJaw =
          res.jaws.length === 2
            ? res.jaws.find((jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.LOWER)
            : null

        const bothJawsDetails = bothJaw ? createJawDetails(bothJaw) : emptyJawTypes
        const upperJawsDetails = upperJaw ? createJawDetails(upperJaw) : emptyJawTypes
        const lowerJawsDetails = lowerJaw ? createJawDetails(lowerJaw) : emptyJawTypes

        const getAppointmentDetailsData = {
          braces_journey_id: safeParseInt(bracesJourneyId),
          amount: 0,
          status: res.status,
          doctor_id: safeParseInt(userId),
          patient_id: safeParseInt(patientId),
          reminder_id: safeParseInt(res.reminder_details?.reminder_id),
          start_date: res?.current_appointment_date,
          end_date: res?.end_date,
          product_type_name: productTypes.BRACES,
          jaw_main_type:
            res.jaws[0].jaw_type === appointmentJawTypes.BOTH
              ? appointmentJawTypes.BOTH
              : appointmentJawTypes.SEPARATE,
          both: bothJawsDetails,
          upper: upperJawsDetails,
          lower: lowerJawsDetails,
          files: res.files,
          draft_files: res.draft_files,
        }

        dispatchAction(setAppointmentDetails(getAppointmentDetailsData))

        if (res.status === treatmentPlanStatusConstants.ACTIVE) {
          const queryParams = new URLSearchParams({
            appointmentId: appointmentId.toString(),
            new: 'false',
            isEditAppointment: 'false',
          }).toString()

          navigation(
            `/profile/${patientId}/bracesNotes/${bracesJourneyId}/viewNotes?${queryParams}`
          )
        } else {
          if (setEditingAppointmentId) {
            setEditingAppointmentId(appointmentId.toString())
          } else {
            const queryParams = new URLSearchParams({
              appointmentId: appointmentId.toString(),
              new: 'false',
            }).toString()
            navigation(
              `/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes?${queryParams}`
            )
          }
        }
      })
      .catch(() => {})
  }

  const columns = useMemo<ColumnDef<RowDataForBracesNotesList>[]>(
    () => [
      {
        id: 'start_date',
        accessorKey: 'start_date',
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>APPOINTMENT DATE</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='flex gap-3 items-center text-sm font-medium text-black'>
              {dayjs(row.original.start_date).format('DD MMM YYYY')}
            </div>
          </RenderCell>
        ),
        size: 120,
      },
      {
        id: 'upperJaw',
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>UPPER JAW DETAILS</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => (
          <RenderCell>
            <div className='text-sm font-medium'>
              <JawDetailsForBracesNotesListItem {...{item: row.original.upperJaw}} />
            </div>
          </RenderCell>
        ),
        size: 250,
      },
      {
        id: 'lowerJaw',
        header: () => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full'>
                  <p>LOWER JAW DETAILS</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const isMenuOpen = openMenuRowId === row.original.appointment_id

          return (
            <RenderCell>
              <div className='relative text-sm font-medium flex justify-between items-start'>
                <JawDetailsForBracesNotesListItem {...{item: row.original.lowerJaw}} />

                {/* 3-dots button */}
                <button
                  type='button'
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpenMenuRowId((prev) =>
                      prev === row.original.appointment_id ? null : row.original.appointment_id
                    )
                  }}
                  className='p-1 rounded-full hover:bg-primarySupport'
                >
                  <MoreVertical className='w-5 h-5' />
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className='absolute right-0 top-7 z-20 w-40 rounded-md bg-white shadow-lg border border-lighterGray'>
                    {/* Edit */}
                    <button
                      type='button'
                      className='w-full px-3 py-2 text-left text-sm hover:bg-primarySupport'
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuRowId(null)
                        setSelectedAppointmentId(row.original.appointment_id)
                        // Fetch appointment details to populate the edit form
                        dispatchAction(
                          getBracesNotesDetails({
                            appointment_id: row.original.appointment_id.toString() ?? '',
                          })
                        )
                          .unwrap()
                          .then((res: any) => {
                            const emptyJawTypes = {
                              jaw_type: '',
                              treatment_stage_type: '',
                              shape: '',
                              material_name: '',
                              material_size: '',
                              space_enclosure_tools: [],
                              accessories: [],
                              note: '',
                              input_material_name: '',
                              input_material_size: '',
                              input_space_enclosure_tools: '',
                              input_accessories: '',
                            }

                            const createJawDetails = (jaw: {
                              note: string
                              jaw_type: string
                              treatment_stage_type: string
                              shape: string
                              material_name: string
                              material_size: string
                              space_enclosure_tools: string
                              accessories: string
                            }) => ({
                              jaw_type: jaw.jaw_type,
                              treatment_stage_type: jaw.treatment_stage_type,
                              shape: jaw.shape,
                              material_name: jaw.material_name,
                              material_size: jaw.material_size,
                              space_enclosure_tools: jaw.space_enclosure_tools,
                              accessories: jaw.accessories,
                              note: jaw.note,
                              input_material_name: '',
                              input_material_size: '',
                              input_space_enclosure_tools: '',
                              input_accessories: '',
                            })

                            const bothJaw = res.jaws.find(
                              (jaw: {jaw_type: string}) => jaw.jaw_type === appointmentJawTypes.BOTH
                            )
                            const upperJaw = res.jaws.find(
                              (jaw: {jaw_type: string}) =>
                                jaw.jaw_type === appointmentJawTypes.UPPER
                            )
                            const lowerJaw =
                              res.jaws.length === 2
                                ? res.jaws.find(
                                    (jaw: {jaw_type: string}) =>
                                      jaw.jaw_type === appointmentJawTypes.LOWER
                                  )
                                : null

                            const bothJawsDetails = bothJaw
                              ? createJawDetails(bothJaw)
                              : emptyJawTypes
                            const upperJawsDetails = upperJaw
                              ? createJawDetails(upperJaw)
                              : emptyJawTypes
                            const lowerJawsDetails = lowerJaw
                              ? createJawDetails(lowerJaw)
                              : emptyJawTypes

                            const getAppointmentDetailsData = {
                              braces_journey_id: safeParseInt(bracesJourneyId),
                              amount: 0,
                              status: res.status,
                              doctor_id: safeParseInt(userId),
                              patient_id: safeParseInt(patientId),
                              reminder_id: safeParseInt(res.reminder_details?.reminder_id),
                              start_date: res?.current_appointment_date,
                              end_date: res?.end_date,
                              product_type_name: productTypes.BRACES,
                              jaw_main_type:
                                res.jaws[0].jaw_type === appointmentJawTypes.BOTH
                                  ? appointmentJawTypes.BOTH
                                  : appointmentJawTypes.SEPARATE,
                              both: bothJawsDetails,
                              upper: upperJawsDetails,
                              lower: lowerJawsDetails,
                              files: res.files,
                              draft_files: res.draft_files,
                            }

                            dispatchAction(setAppointmentDetails(getAppointmentDetailsData))

                            const queryParams = new URLSearchParams({
                              appointmentId: row.original.appointment_id.toString(),
                              new: 'false',
                            }).toString()

                            navigation(
                              `/profile/${patientId}/bracesNotes/${bracesJourneyId}/attachNotes?${queryParams}`
                            )
                          })
                          .catch(() => {})
                      }}
                    >
                      <span className='flex items-center gap-2'>
                        <CommonSVG svg={SVG_PENCIL_DARK_GRAY} width='16' height='16' />
                        <span>Edit</span>
                      </span>
                    </button>

                    {/* Delete */}
                    <button
                      type='button'
                      className='w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-primarySupport'
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuRowId(null)
                        setSelectedAppointmentId(row.original.appointment_id)
                        setDeleteEventModalVisible(true)
                      }}
                    >
                      <span className='flex items-center gap-2'>
                        <CommonSVG svg={SVG_DELETE} width='16' height='16' />
                        <span>Delete</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </RenderCell>
          )
        },
        size: 250,
      },
    ],
    [appointmentRows, openMenuRowId, navigation, patientId, bracesJourneyId]
  )

  const table = useReactTable({
    columns,
    data: appointmentRows,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 150,
      minSize: 50,
    },
  })

  return (
    <>
      <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-14rem)]'>
        <div>
          <When isTrue={hasValue(appointmentRows)}>
            <table className='table-auto w-full h-full'>
              <thead className='bg-[#F5F5F5]'>
                {table.getHeaderGroups().map((headerGroup, index: number) => (
                  <tr key={index}>
                    {headerGroup.headers.map((header, headerIndex: number) => (
                      <th
                        className='text-start text-black text-xs font-medium p-2'
                        key={headerIndex}
                        colSpan={header.colSpan}
                        style={{width: `${header.column.getSize()}px`}}
                      >
                        <div>
                          <div
                            className={cn(
                              'flex gap-2 w-full',
                              header.column.getIsLastColumn() ? '' : 'border-r-2 border-mediumGray'
                            )}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isSelected = row.getIsSelected()

                  const getBackgroundColorClass = () => {
                    if (isSelected) return 'bg-secondarySupport'
                    else return 'hover:bg-primarySupport'
                  }

                  const className = cn(
                    'border-b border-lightgray text-black text-base group',
                    getBackgroundColorClass()
                  )

                  return (
                    <tr key={row.id} className={className}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='md:px-4 cursor-pointer'>
                          <div
                            className='py-4'
                            onClick={() => {
                              goToViewAppointment(row.original.appointment_id)
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </When>
        </div>

        <When isTrue={!hasValue(appointmentRows)}>
          <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center h-full md:h-[calc(100vh-14rem)]'>
            <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
              <NotesIcon color='#666666' />
            </div>
            <p>No notes added yet.</p>
          </div>
        </When>
      </div>

      <DeleteEvent
        visible={deleteEventModalVisible}
        setDeleteModalVisible={setDeleteEventModalVisible}
        eventType={calendarEventsConstants.APPOINTMENT}
        onOkClick={() => {
          if (!selectedAppointmentId) return
          dispatchAction(
            postDeleteAppointment({
              appointment_id: selectedAppointmentId,
              doctor_id: safeParseInt(userId),
              profile_id: safeParseInt(profileId),
              organization_id: safeParseInt(organizationId),
            })
          )
            .unwrap()
            .then(() => {
              dispatchAction(
                getBracesNotesList({
                  doctor_id: safeParseInt(userId),
                  patient_id: safeParseInt(patientId),
                })
              )
                .unwrap()
                .then(() => {
                  SuccessToast('Appointment deleted successfully!')
                  navigation(`/profile/${patientId}/bracesNotes/${bracesJourneyId}`)
                })
            })

          // For now just close the modal
          setDeleteEventModalVisible(false)
        }}
      />
    </>
  )
}

export default TableContainerForBracesNotes
