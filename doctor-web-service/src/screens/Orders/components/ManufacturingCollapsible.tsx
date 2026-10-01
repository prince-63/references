import {Collapse, Divider} from 'antd'
import {orderDetailsPanelStyles} from '../constants'
import ExpandIcon from 'components/atom/SVG/ExpandIcon'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {ManufacturingItem} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import CheckedCircleIcon from 'assets/icons/CheckedCircleIcon'
import WaitIcon from 'assets/icons/WaitIcon'
import dayjs from 'dayjs'
import ProcessedItems from './ProcessedItems'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import useDispatchAction from '@hooks/useDispatchAction'
import {setOpenModalManufacturing} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import When from 'components/when/When'
import {arrangedAlignerString, getActiveTreatmentPlan} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import AntdButton from 'components/atom/Buttons/AntdButton'
const ManufacturingCollapsible = () => {
  const {order} = useSelector((state: RootState) => state.orders)
  const {manufacturingListData} = useSelector((state: RootState) => state.GettingStartedOverview)

  const activeTreatementData: AllTreatmentPlanListItem | null = getActiveTreatmentPlan(order)
  const unprocessed_data = {
    total_aligner: activeTreatementData !== null ? activeTreatementData?.total_aligner : 0,
    upper_aligner_start:
      activeTreatementData !== null ? activeTreatementData?.upper_jaw_details?.starts_with : 0,
    upper_aligner_end:
      activeTreatementData !== null ? activeTreatementData?.upper_jaw_details?.ends_with : 0,
    lower_aligner_start:
      activeTreatementData !== null ? activeTreatementData?.lower_jaw_details?.starts_with : 0,
    lower_aligner_end:
      activeTreatementData !== null ? activeTreatementData?.lower_jaw_details?.ends_with : 0,
  }
  const processedItems = manufacturingListData?.processed_manufacturing || []
  const unprocessedItem: ManufacturingItem = {
    completed_on: null,
    status: 'PENDING',
    shipped_on: '',
    shipping_added_on: '',
    tentative_delivery_date: '',
    delivery_date: '',
    tracking_number: '',
    tracking_link: '',
    is_current: false,
    documents: null,
    manufacturing_batch_id: -1,
    total_aligners:
      manufacturingListData?.unprocessed_manufacturing?.total_aligners ??
      unprocessed_data?.total_aligner ??
      0,
    upper_aligner_start:
      manufacturingListData?.unprocessed_manufacturing?.upper_aligner_start ??
      unprocessed_data?.upper_aligner_start ??
      0,
    upper_aligner_end:
      manufacturingListData?.unprocessed_manufacturing?.upper_aligner_end ??
      unprocessed_data?.upper_aligner_end ??
      0,
    lower_aligner_start:
      manufacturingListData?.unprocessed_manufacturing?.lower_aligner_start ??
      unprocessed_data?.lower_aligner_start ??
      0,
    lower_aligner_end:
      manufacturingListData?.unprocessed_manufacturing?.lower_aligner_end ??
      unprocessed_data?.lower_aligner_end ??
      0,
    due_days: manufacturingListData?.unprocessed_manufacturing?.due_days ?? 0,
    started_on: '',
    delivered_on: '',
    current_manufacturing_counts: {
      delivered_counts: 0,
      in_manufacturing_count: 0,
      total_aligners_counts: 0,
      unprocessed_counts: 0,
    },
    is_already_delivered: false,
    is_show_mark_as_received: false,
    created_by: null,
    assignee: null,
  }
  const manufacturingTimelineList: ManufacturingItem[] = [...processedItems, unprocessedItem]

  const is_latest_treatment_deactivate =
    order?.treatment_plan_responses &&
    order?.treatment_plan_responses[0] &&
    order?.treatment_plan_responses[0]?.treatment_status === 'DEACTIVATED'

  return (
    <When isTrue={order.status === 'COMPLETED'}>
      <div className='p-4'>
        <Collapse
          defaultActiveKey={['1']}
          bordered={false}
          style={{
            padding: 0,
            backgroundColor: 'transparent',
          }}
          items={[
            {
              key: '1',
              label: (
                <div className='text-lg font-semibold flex flex-col gap-1'>
                  <p>Manufacturing</p>
                </div>
              ),
              children: (
                <When isTrue={hasValue(manufacturingTimelineList)}>
                  <ManufacturingTimeline
                    manufacturingTimelineList={manufacturingTimelineList}
                    is_latest_treatment_deactivated={is_latest_treatment_deactivate}
                  />
                </When>
              ),
              forceRender: true,
              styles: {
                ...orderDetailsPanelStyles,
              },
            },
          ]}
          expandIcon={({isActive}) => (
            <div className='h-full '>
              <ExpandIcon {...{isActive}} />
            </div>
          )}
          expandIconPosition='start'
        />
      </div>
      <Divider />
    </When>
  )
}

export default ManufacturingCollapsible

const ManufacturingTimeline = ({
  manufacturingTimelineList,
  is_latest_treatment_deactivated,
}: {
  manufacturingTimelineList: ManufacturingItem[]
  is_latest_treatment_deactivated: boolean
}) => {
  const {dispatchAction} = useDispatchAction()

  const {order} = useSelector((state: RootState) => state.orders)

  const isCompleted = order?.treatment_plan_responses[0]?.treatment_status === 'COMPLETE'
  return (
    <div>
      {manufacturingTimelineList &&
        manufacturingTimelineList.map((manufacturing: ManufacturingItem, index: number) => (
          <div key={index} className='flex items-stretch px-3 mt-4'>
            <div className='flex flex-col items-center'>
              <div>
                {manufacturing.status !== 'PENDING' ? (
                  <CheckedCircleIcon height='18' width='18' color='#00b383' />
                ) : (
                  <When isTrue={manufacturing?.total_aligners !== 0}>
                    <WaitIcon />
                  </When>
                )}
              </div>{' '}
              {index !== manufacturingTimelineList.length - 1 && (
                <div className='flex-1 border-l border-dashed border-grayDisabled' />
              )}
            </div>

            <div className='ml-4 flex-1 pb-2'>
              <div className='text-xs text-textColor font-semibold flex justify-between'>
                {manufacturing?.is_already_delivered ? (
                  'Till date'
                ) : (
                  <p>
                    {manufacturing?.status === 'PENDING' ? (
                      <When isTrue={manufacturing?.total_aligners !== 0}>{'pending'}</When>
                    ) : (
                      dayjs(manufacturing.started_on).format('DD MMM YYYY')
                    )}
                  </p>
                )}
              </div>
              <div className='mt-1'>
                <ManufacturingBatch
                  manufacturing={manufacturing}
                  index={index}
                  is_latest_treatment_deactivated={is_latest_treatment_deactivated}
                />
              </div>
            </div>
          </div>
        ))}

      <When
        isTrue={
          manufacturingTimelineList &&
          (manufacturingTimelineList[0]?.status === 'PENDING' ||
            manufacturingTimelineList[manufacturingTimelineList?.length - 2]?.status ===
              'DELIVERED') &&
          manufacturingTimelineList[manufacturingTimelineList?.length - 1]?.total_aligners !== 0
        }
      >
        <AntdButton
          className='text-primaryColor bg-primarySupport border border-primaryColor font-semibold w-fit px-3 py-1.5 rounded-lg ml-10'
          disabled={is_latest_treatment_deactivated || isCompleted}
          text='Start manufacturing'
          htmlType='button'
          onClick={() => {
            dispatchAction(setOpenModalManufacturing(true))
          }}
        />
      </When>
    </div>
  )
}

const ManufacturingBatch = ({
  manufacturing,
  index,
  is_latest_treatment_deactivated,
}: {
  manufacturing: ManufacturingItem
  index: number
  is_latest_treatment_deactivated: boolean
}) => {
  return (
    <>
      {manufacturing?.status === 'PENDING' ? (
        <When isTrue={manufacturing?.total_aligners !== 0}>
          <UnprocessedItem manufacturing={manufacturing} />
        </When>
      ) : (
        <ProcessedItems
          manufacturing={manufacturing}
          index={index}
          is_latest_treatment_deactivated={is_latest_treatment_deactivated}
        />
      )}
    </>
  )
}

const UnprocessedItem = ({manufacturing}: {manufacturing: ManufacturingItem}) => {
  return (
    <div>
      <div className='flex gap-1 items-center'>
        <div className='font-semibold'>Unprocessed</div>
        {manufacturing?.due_days !== 0 && (
          <div className='flex gap-1 items-center'>
            <div className='w-2 h-2 bg-secondaryColor rounded-full'></div>
            <div className='text-xs text-textColor font-semibold'>
              Due in ${manufacturing?.due_days ?? 0} days
            </div>
          </div>
        )}
      </div>
      <div className='text-sm text-textColor font-medium'>
        {arrangedAlignerString({
          total_aligners: manufacturing?.total_aligners,
          upper_aligner_start: manufacturing?.upper_aligner_start,
          upper_aligner_end: manufacturing?.upper_aligner_end,
          lower_aligner_start: manufacturing?.lower_aligner_start,
          lower_aligner_end: manufacturing?.lower_aligner_end,
        })}
      </div>
    </div>
  )
}
