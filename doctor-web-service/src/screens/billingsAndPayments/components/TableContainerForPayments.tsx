import When from 'components/when/When'
import {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import hasValue from 'utils/hasValue'
import {ColumnDef, flexRender, getCoreRowModel, useReactTable} from '@tanstack/react-table'
import cn from '@utils/cn'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import useDispatchAction from '@hooks/useDispatchAction'
import {useNavigate} from 'react-router-dom'
import RenderCell from 'screens/Patients/LeadsProfile/main/files/components/RenderCell'
import RenderTableHeader from 'screens/Patients/LeadsProfile/main/files/components/RenderTableHeader'
import {
  FilterDrawerFormikContextType,
  RowDataForBillingsAndPayments,
} from '../billingsAndPayments.types'
import MoneyIcon from 'assets/icons/MoneyIcon'
import useMappedPatientBillingsList from '../helpers/useMappedPatientBillingsList'
import {Image} from 'assets/images/Images/Image'
import {capitalizeFirstLetter, getImageUrlById, safeParseInt} from 'utils/ConstFunctions'
import dayjs from 'dayjs'
import ImageViewer from 'screens/Patients/PatientProfile/Tabs/ImageViewer'
import Tag from 'components/tags/Tag'
import formatAmount from 'screens/Calendar/helpers/formatAmount'
import AddNewButton from 'components/atom/Buttons/AddNewButton'
import EditButton from 'components/atom/Buttons/EditButton'
import TreatmentCostModal from 'screens/Patients/LeadsProfile/main/payments/components/TreatmentCostModal'
import {
  setIsPaymentModalVisible,
  setIsTreatmentCostModalVisible,
  setSelectedPaymentId,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import PaymentModal from 'screens/Patients/LeadsProfile/main/payments/components/PaymentModal'
import PaymentAndReminderDeleteModal from 'screens/Patients/LeadsProfile/main/payments/components/PaymentAndReminderDeleteModal'
import AddReminderModal from 'components/AddReminder/AddReminderModal'
import DeleteEvent from 'components/deleteEvent/DeleteEvent'
import {deleteEvent, getPracticeLocationsList} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useBillingAndPaymentsContext} from '../BillingAndPaymentsContext'
import {Collapse, Spin} from 'antd'
import PatientPaymentItemContent from './PatientPaymentItemContent'
import PatientPaymentItemHeader from './PatientPaymentItemHeader'
import ExpandIcon from 'assets/icons/ExpandIcon'
import Spinner from 'components/spinner/Spinner'
import {useFormikContext} from 'formik'
import {AuthContext} from 'context/AuthContext'
import {getApiDataProductionList} from 'redux/Slices/AppSlice/SetupTreatment/productionListSlice'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'

const TableContainerForPayments = () => {
  const {billingAndPaymentsData, loadingBillingAndPaymentsData} = useSelector(
    (state: RootState) => state.billingsAndPayments
  )
  const patientRows = useMappedPatientBillingsList({
    patient_details: billingAndPaymentsData?.patient_details,
  })
  const {dispatchAction} = useDispatchAction()
  const {isTreatmentCostModalVisible, isPaymentModalVisible, isDeletePaymentModalVisible} =
    useSelector((state: RootState) => state.payments)
  const navigation = useNavigate()
  const {
    isModalVisible,
    toggleModal,
    deleteEventModalVisible,
    setDeleteEventModalVisible,
    isShowPhotos,
    setIsShowPhotos,
    selectedRow,
    setSelectedRow,
    isEditPaymentReminder,
    setIsEditPaymentReminder,
    handleOnSearch,
  } = useBillingAndPaymentsContext()
  const billingPageFormik = useFormikContext<FilterDrawerFormikContextType>()

  const {userId} = useContext(AuthContext)

  useEffect(() => {
    const payload = {
      doctorId: safeParseInt(userId),
    }
    const fetchBrandList = dispatchAction(getApiDataProductionList({payload})).unwrap()
    const fetchPracticeLocations = dispatchAction(
      getPracticeLocationsList({doctor_id: safeParseInt(userId), include_unassigned: true})
    ).unwrap()

    Promise.all([fetchBrandList, fetchPracticeLocations])
      .then((res) => {
        const initialValues = {
          ...billingPageFormik.values,
          checked_practice_location_list: res[1] ?? [],
        }
        billingPageFormik.resetForm({
          values: initialValues,
        })
        handleOnSearch({payload: initialValues, updateLoadingState: true})
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
  }, [])

  const columns = useMemo<ColumnDef<RowDataForBillingsAndPayments>[]>(
    () => [
      {
        id: 'patient',
        accessorKey: 'patient',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Patient</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const profile_url = row.original.profile_image_id
            ? getImageUrlById(row.original.profile_image_id)
            : row.original?.profile_url
          return (
            <RenderCell>
              <div className='flex gap-2 cursor-default items-center'>
                {hasValue(profile_url) ? (
                  <Image
                    className='w-8 h-8 rounded-full  object-cover cursor-pointer bg-transparent'
                    src={profile_url ?? ''}
                    alt='patient photo'
                    showLoading={true}
                    onClick={(e: React.MouseEvent<HTMLImageElement>) => {
                      e.stopPropagation()
                      setSelectedRow(row.original)
                      setIsShowPhotos(true)
                    }}
                  />
                ) : (
                  <PatientProfileInitials {...{name: row.original.patient_name}} />
                )}

                <div className='flex flex-col'>
                  <p className='text-black text-base font-semibold'>{row.original.patient_name}</p>
                  <p className='text-textColor font-medium text-xs'>
                    Created on: {dayjs(row.original.patient_created_on).format('DD MMM YYYY')}
                  </p>
                </div>
              </div>
            </RenderCell>
          )
        },
        size: 200,
      },
      {
        id: 'treatment',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Treatment</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='flex justify-start gap-2 text-xs flex-wrap'>
                <When isTrue={hasValue(row.original.treatments)}>
                  {row.original.treatments?.map((treatment, index) => (
                    <Tag
                      key={index}
                      value={treatment === 'BRACES' ? capitalizeFirstLetter(treatment) : treatment}
                      className='bg-lightGray text-textColor'
                    />
                  ))}
                </When>
                <When isTrue={!hasValue(row.original.treatments)}>--</When>
              </div>
            </RenderCell>
          )
        },
        size: 175,
      },
      {
        id: 'practiceLocation',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Practice location</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm font-medium'>
                {row.original.practice_location_name ? row.original.practice_location_name : '--'}
              </div>
            </RenderCell>
          )
        },
        size: 200,
      },
      {
        id: 'treatmentCost',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Treatment cost</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const formattedAmount = formatAmount(row.original.treatment_cost)
          return (
            <RenderCell>
              <div className='flex justify-between items-center'>
                <div className='text-sm font-medium text-black'>
                  {hasValue(formattedAmount) ? (
                    `₹ ${formattedAmount}`
                  ) : (
                    <AddNewButton
                      text='Add new'
                      onClick={() => {
                        setSelectedRow(row.original)
                        dispatchAction(setIsTreatmentCostModalVisible(true))
                      }}
                    />
                  )}
                </div>
                <EditButton
                  onClick={() => {
                    setSelectedRow(row.original)
                    dispatchAction(setIsTreatmentCostModalVisible(true))
                  }}
                  show={hasValue(row.original.treatment_cost) && row.original.treatment_cost !== 0}
                />
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'balancePayment',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Balance payment</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const formattedAmount = formatAmount(row.original.balance_payment)
          return (
            <RenderCell>
              <div className='text-sm font-medium text-black'>
                {hasValue(formattedAmount) ? `₹ ${formattedAmount}` : '--'}
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'lastPaymentReceived',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Last payment received</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const formattedAmount = formatAmount(row.original.last_payment_received?.amount)

          return (
            <RenderCell>
              <div className='flex justify-between items-center'>
                <div className='text-sm font-medium text-black'>
                  {hasValue(row.original.treatment_cost) && row.original.treatment_cost !== 0 ? (
                    hasValue(formattedAmount) ? (
                      <div className='flex flex-col'>
                        ₹ {formattedAmount}
                        <p className=' text-textColor'>
                          {dayjs(row.original.last_payment_received?.received_on).format(
                            'DD MMM YYYY'
                          )}
                        </p>
                      </div>
                    ) : (
                      <AddNewButton
                        text='Add payment'
                        onClick={() => {
                          setSelectedRow(row.original)
                          dispatchAction(setSelectedPaymentId(0))
                          dispatchAction(setIsPaymentModalVisible(true))
                        }}
                      />
                    )
                  ) : (
                    '--'
                  )}
                </div>
                <EditButton
                  onClick={() => {
                    dispatchAction(setIsPaymentModalVisible(true))
                    setSelectedRow(row.original)
                    dispatchAction(
                      setSelectedPaymentId(row.original.last_payment_received?.payment_id)
                    )
                  }}
                  show={
                    hasValue(row.original.last_payment_received?.amount) &&
                    hasValue(row.original.treatment_cost) &&
                    row.original.treatment_cost !== 0
                  }
                />
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'paymentReminder',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Payment reminder</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          const formattedAmount = formatAmount(row.original.payment_reminder_details?.amount)

          return (
            <RenderCell>
              <div className='flex justify-between items-center'>
                <div className='text-sm font-medium text-black'>
                  {hasValue(row.original.treatment_cost) && row.original.treatment_cost !== 0 ? (
                    hasValue(formattedAmount) ? (
                      <div className='flex flex-col'>
                        ₹ {formattedAmount}
                        <p className=' text-textColor'>
                          {dayjs(row.original.payment_reminder_details?.date).format('DD MMM YYYY')}
                        </p>
                      </div>
                    ) : (
                      <AddNewButton
                        text='Add reminder'
                        onClick={() => {
                          setSelectedRow(row.original)
                          toggleModal(true)
                        }}
                      />
                    )
                  ) : (
                    '--'
                  )}
                </div>

                <EditButton
                  onClick={() => {
                    setSelectedRow(row.original)
                    setIsEditPaymentReminder(true)
                    toggleModal(true)
                  }}
                  show={
                    hasValue(row.original.payment_reminder_details?.amount) &&
                    hasValue(row.original.treatment_cost) &&
                    row.original.treatment_cost !== 0
                  }
                />
              </div>
            </RenderCell>
          )
        },
      },
      {
        id: 'actions',
        header: ({}) => (
          <RenderTableHeader
            {...{
              className: 'w-full font-medium text-sm',
              header: (
                <div className='flex justify-between items-center w-full  '>
                  <p>Actions</p>
                </div>
              ),
            }}
          />
        ),
        cell: ({row}) => {
          return (
            <RenderCell>
              <div className='text-sm font-semibold'>
                <button
                  type='button'
                  className='flex gap-2 items-center'
                  onClick={() => {
                    navigation(`/profile/${row.original.patient_id}/payments`)
                  }}
                >
                  View
                  <CaretRightIcon color='#666666' />
                </button>
              </div>
            </RenderCell>
          )
        },
        size: 100,
      },
    ],
    [patientRows]
  )
  const panelStyle: React.CSSProperties = {
    marginBottom: 12,
    borderRadius: '8px',
    border: '1px solid #D9D9D9',
  }
  const patientCollapsibleItems = patientRows?.map((row) => ({
    key: row.patient_id,
    label: <PatientPaymentItemHeader {...{patient: row}} />,
    children: <PatientPaymentItemContent patient={row} />,
    style: panelStyle,
  }))

  const table = useReactTable({
    columns,
    data: patientRows as RowDataForBillingsAndPayments[],
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      minSize: 50,
    },
  })
  return (
    <div className='w-full flex flex-col overflow-auto card-wrapper mb-2 md:h-[calc(100vh-14rem)] h-[calc(100vh-23.5rem)] '>
      <Spin indicator={<Spinner loading />} spinning={loadingBillingAndPaymentsData}>
        <When isTrue={isShowPhotos}>
          <ImageViewer
            setIsShowPhotos={setIsShowPhotos}
            selectedImagesList={[
              {
                src: selectedRow?.profile_url,
                alt: selectedRow?.patient_name,
                title: selectedRow?.patient_name,
                width: '100%',
                height: '100%',
              },
            ]}
          />
        </When>
        <div className='hidden md:block'>
          <When isTrue={hasValue(patientRows)}>
            <table className='table-auto w-full h-full'>
              <thead className='border-b border-textColor'>
                {table.getHeaderGroups().map((headerGroup, index: number) => (
                  <tr key={index} className='    '>
                    {headerGroup.headers.map((header, index: number) => {
                      return (
                        <th
                          className={`text-start text-black text-xs font-medium p-2`}
                          key={index}
                          colSpan={header.colSpan}
                          style={{width: `${header.column.getSize()}px`}}
                        >
                          <div>
                            <div className={cn('flex gap-2 w-full ')}>
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => {
                  const isSelected = row.getIsSelected()

                  const getBackgroundColorClass = () => {
                    if (isSelected) return 'bg-secondarySupport'
                    else return 'hover:bg-[#F5F5F5]'
                  }

                  const className = cn(
                    `border-b border-lightgray text-black text-base group`,
                    getBackgroundColorClass()
                  )
                  return (
                    <tr key={row.id} className={className}>
                      {row.getVisibleCells().map((cell) => {
                        return (
                          <td key={cell.id} className=' md:px-2 cursor-pointer'>
                            <div
                              className='py-4'
                              onClick={() => {
                                if (row?.original?.patient_status === 'ARCHIVE') {
                                  navigation(`/profile/${row.original.patient_id}/files`)
                                } else {
                                  navigation(`/profile/${row.original.patient_id}/payments`)
                                }
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </When>
        </div>
        <div className='md:hidden block'>
          <When isTrue={hasValue(patientRows)}>
            {patientRows && (
              <Collapse
                items={patientCollapsibleItems}
                bordered={false}
                style={{
                  padding: 0,
                  fontFamily: 'figtree',
                  backgroundColor: 'transparent',
                }}
                defaultActiveKey={patientCollapsibleItems[0]?.key}
                expandIcon={({isActive}) => <ExpandIcon {...{isActive}} />}
                expandIconPosition='end'
              />
            )}
          </When>
        </div>
        <When isTrue={!hasValue(patientRows)}>
          <div className='flex flex-col gap-3 text-textColor text-base justify-center items-center md:h-[calc(100vh-14rem)] h-[calc(100vh-23.5rem)]'>
            <div className='p-3 rounded-full w-fit h-fit bg-lighterGray'>
              <MoneyIcon color='#666666' />
            </div>
            <p>No results found</p>
          </div>
        </When>
        <When isTrue={isTreatmentCostModalVisible}>
          <TreatmentCostModal
            {...{
              isOnBillingsAndPaymentsPage: true,
              patientTreatmentCostData: {
                patientId: safeParseInt(selectedRow?.patient_id),
                initialTreatmentCost: String(selectedRow?.treatment_cost),
                patientName: selectedRow?.patient_name,
                profileUrl: selectedRow?.profile_url,
              },
            }}
          />
        </When>
        <When isTrue={isPaymentModalVisible}>
          <PaymentModal
            {...{
              isOnBillingsAndPaymentsPage: true,
              patientPaymentReceivedData: {
                patientId: safeParseInt(selectedRow?.patient_id),
                patientName: selectedRow?.patient_name,
                profileUrl: selectedRow?.profile_url,
              },
            }}
          />
        </When>
        <When isTrue={isDeletePaymentModalVisible}>
          <PaymentAndReminderDeleteModal
            {...{
              isOnBillingsAndPaymentsPage: true,
              patientPaymentReceivedData: {
                patientId: safeParseInt(selectedRow?.patient_id),
                patientName: selectedRow?.patient_name,
                profileUrl: selectedRow?.profile_url,
              },
            }}
          />
        </When>
        <DeleteEvent
          {...{
            eventType: 'PAYMENT_REMINDER',
            onClose: () => {
              setIsEditPaymentReminder(true)
              toggleModal(true)
            },
            onOkClick: async () => {
              const selectedReminderId = selectedRow?.payment_reminder_details?.reminder_id
              const patientId = selectedRow?.patient_id
              if (selectedReminderId) {
                await dispatchAction(
                  deleteEvent({
                    reminder_id: safeParseInt(selectedReminderId),
                    isAppointment: false,
                    isReminder: true,
                    patient_id: safeParseInt(patientId),
                    reminder_category: 'PAYMENT_REMINDER',
                  })
                )
                billingPageFormik.handleSubmit()
                setIsEditPaymentReminder(false)
                SuccessToast('Reminder deleted successfully.')
              }
            },
            visible: deleteEventModalVisible,
            setDeleteModalVisible: setDeleteEventModalVisible,
          }}
        />
        <AddReminderModal
          {...{
            isModalVisible,
            toggleModal,
            isOnBillingsAndPaymentsPage: true,
            onDeleteReminder: () => {
              setDeleteEventModalVisible(true)
              toggleModal(false)
            },
            billingAndPaymentsScreenPatientId: safeParseInt(selectedRow?.patient_id),
            onClose: () => {
              setIsEditPaymentReminder(false)
            },
            paymentReminderData: isEditPaymentReminder
              ? {
                  ...selectedRow?.payment_reminder_details,
                  reminder_id: safeParseInt(selectedRow?.payment_reminder_details?.reminder_id),
                  patient_id: safeParseInt(selectedRow?.patient_id),
                  aligner_journey_id: safeParseInt(
                    selectedRow?.payment_reminder_details?.aligner_journey_id
                  ),
                }
              : undefined,
            patientData: {
              patientName: selectedRow?.patient_name,
              profileUrl: selectedRow?.profile_url,
            },
          }}
        />
      </Spin>
    </div>
  )
}

export default TableContainerForPayments
