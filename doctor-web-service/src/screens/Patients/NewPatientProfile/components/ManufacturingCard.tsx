import BorderedCard from 'components/BorderedCard/BorderedCard'
import ManufacturingStatusTag from './ManufacturingStatusTag'
import {Divider} from 'antd'
import ClockClockwiseIcon from 'assets/icons/ClockClockwiseIcon'
import NotificationBell from 'assets/icons/NotificationBell'
import {useNavigate, useParams} from 'react-router-dom'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import GetActionButton from './GetActionButton'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  ManufacturingCounts,
  ManufacturingStatus,
} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import moment from 'moment'
import When from 'components/when/When'
import AddDueDateContainer from 'screens/Orders/components/AddDueDateContainer'
import {safeParseInt} from 'utils/ConstFunctions'
import clsx from 'clsx'
import {
  UnprocessedManufacturing,
  useManufacturingDetails,
} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'

const ManufacturingCard = ({
  isLastTreatmentDeactivated,
  treatment_plan_id,
  order_id,
  refreshData,
  isExistingPatient,
}: {
  isLastTreatmentDeactivated: boolean
  treatment_plan_id: number
  order_id: string | null
  refreshData: () => void
  isExistingPatient: boolean
}) => {
  const {latest_manufacturing_data, unprocessed} = useManufacturingDetails({})
  const {permissionChecks} = useFeatureAccess()

  const dueByPermissions =
    permissionChecks?.customerOrderManagement?.dueByDate?.isViewable ||
    permissionChecks?.practiceOrderManagement?.dueByDate?.isViewable
  const counts =
    latest_manufacturing_data?.current_manufacturing_counts ?? ({} as ManufacturingCounts)
  return (
    <BorderedCard>
      <div
        className={clsx(
          'flex flex-col gap-4',
          isLastTreatmentDeactivated && 'opacity-50 cursor-not-allowed'
        )}
      >
        <ManufacturingHeader
          total={counts?.total_aligners_counts}
          status={latest_manufacturing_data && latest_manufacturing_data?.status}
          unprocessed_manufacturing={unprocessed?.total_aligners === 0}
        />
        <ManufacturingCountsRow
          counts={counts}
          status={latest_manufacturing_data && latest_manufacturing_data?.status}
          unprocessed_manufacturing={unprocessed}
        />
        <When isTrue={unprocessed?.total_aligners !== 0 && dueByPermissions}>
          <ManufactureTimeSet refreshData={refreshData} treatment_plan_id={treatment_plan_id} />
        </When>
        <ManufacturingFooter
          isExistingPatient={isExistingPatient}
          order_id={order_id}
          isLastTreatmentDeactivated={isLastTreatmentDeactivated}
        />
      </div>
    </BorderedCard>
  )
}

export default ManufacturingCard

const ManufacturingHeader = ({
  total,
  status,
  unprocessed_manufacturing,
}: {
  total: number
  status: ManufacturingStatus
  unprocessed_manufacturing: boolean
}) => {
  const {latest_manufacturing_data} = useManufacturingDetails({})
  return (
    <div className='flex gap-2 justify-between items-center'>
      <div className='font-semibold'>Total Aligners: {total}</div>
      <div>
        {unprocessed_manufacturing && status === 'DELIVERED' ? (
          <div
            className={clsx(
              'flex gap-1 px-4 py-1 items-center rounded-3xl text-sm  bg-tertiarySupport'
            )}
          >
            <div className={clsx('w-2 h-2 rounded-full  bg-tertiaryColor')}></div>
            <div className='text-textColor text-sm font-medium'>{'Completed'}</div>
          </div>
        ) : (
          <ManufacturingStatusTag status={!latest_manufacturing_data ? 'PENDING' : status} />
        )}
      </div>
    </div>
  )
}

const ManufacturingCountsRow = ({
  counts,
  status,
  unprocessed_manufacturing,
}: {
  counts: ManufacturingCounts
  status: ManufacturingStatus
  unprocessed_manufacturing: UnprocessedManufacturing
}) => {
  const {latest_manufacturing_data} = useManufacturingDetails({})

  return (
    <div>
      <div className='flex gap-2 justify-between '>
        <div>
          <div className='text-xs font-medium text-textColor uppercase'>Unprocessed</div>
          {!latest_manufacturing_data ? (
            <div className='text-lg font-semibold'>
              {unprocessed_manufacturing?.total_aligners === 0
                ? '-'
                : (unprocessed_manufacturing?.total_aligners ?? '-')}
            </div>
          ) : (
            <div className='text-lg font-semibold'>
              {counts?.unprocessed_counts === 0 ? '-' : (counts?.unprocessed_counts ?? '-')}
            </div>
          )}
        </div>
        <div>
          <div className='text-xs font-medium text-textColor uppercase'>In manufacturing</div>
          <div className='flex gap-1 items-center'>
            <div className='text-lg font-semibold'>
              {counts?.in_manufacturing_count === 0 ? '-' : (counts?.in_manufacturing_count ?? '-')}
            </div>
            <ManufacturingStatusTag status={status} showBorder={false} />
          </div>
        </div>
        <div>
          <div className='text-xs font-medium text-textColor uppercase'>Delivered till date</div>
          <div className='text-lg font-semibold'>
            {counts?.delivered_counts === 0 ? '-' : (counts?.delivered_counts ?? '-')}
          </div>
        </div>
      </div>
      <Divider className='mt-4 mb-0' />
    </div>
  )
}

const ManufactureTimeSet = ({
  refreshData,
  treatment_plan_id,
}: {
  refreshData: () => void
  treatment_plan_id: number | null
}) => {
  const {patientId} = useParams()
  const {isAlignerCompanyOrg} = useAllUserPlan()
  const {manufacturingListData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const unprocessed_manufacturing = manufacturingListData?.unprocessed_manufacturing
  const {permissionChecks} = useFeatureAccess()
  const permissions = permissionChecks?.calendar?.setReminder

  return (
    <div>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-1'>
          <ClockClockwiseIcon />
          <div className='text-textColor font-medium'>Due by</div>
          <div className='font-medium'>
            {unprocessed_manufacturing?.due_by
              ? moment(unprocessed_manufacturing?.due_by).format('DD-MMM-YYYY')
              : '-'}
          </div>
        </div>

        <When isTrue={isAlignerCompanyOrg}>
          <div className='flex items-center gap-1'>
            <NotificationBell />
            <AddDueDateContainer
              order_due_by={unprocessed_manufacturing?.reminder_date}
              reminder_id={unprocessed_manufacturing?.reminder_id}
              refreshData={refreshData}
              isReminder={true}
              patient_id={safeParseInt(patientId)}
              treatment_plan_id={treatment_plan_id}
              buttonText='Add Reminder'
              buttonClassName='!text-primaryColor !font-semibold !text-base'
              permissions={permissions}
            />
          </div>
        </When>
      </div>
      <Divider className='mt-4 mb-0' />
    </div>
  )
}

const ManufacturingFooter = ({
  order_id,
  isLastTreatmentDeactivated,
  isExistingPatient,
}: {
  order_id: string | null
  isLastTreatmentDeactivated: boolean
  isExistingPatient: boolean
}) => {
  const navigate = useNavigate()
  const {manufacturingListData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const manufacturingList = manufacturingListData?.processed_manufacturing
  const latestManufacturing = manufacturingList && manufacturingList[manufacturingList?.length - 1]

  return (
    <div className='flex gap-2  w-full'>
      <When isTrue={!isExistingPatient}>
        <button
          type='button'
          className={clsx(
            'text-textColor font-semibold flex gap-2 items-center border border-mediumGray py-2 w-full justify-center rounded-lg',
            isLastTreatmentDeactivated && ' cursor-not-allowed'
          )}
          onClick={() => {
            navigate(`/orders/${order_id ?? ''}`)
          }}
          disabled={isLastTreatmentDeactivated}
        >
          View details
          <CaretRightIcon color='#666666' />
        </button>
      </When>
      <When
        isTrue={
          manufacturingListData?.unprocessed_manufacturing === null ||
          manufacturingListData?.unprocessed_manufacturing?.total_aligners !== 0 ||
          latestManufacturing?.status !== 'DELIVERED'
        }
      >
        <GetActionButton
          status={latestManufacturing?.status}
          isLastTreatmentDeactivated={isLastTreatmentDeactivated}
        />
      </When>
    </div>
  )
}
