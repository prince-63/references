import React, {useMemo} from 'react'
import {Collapse, Space} from 'antd'
import {ProcessedManufacturingBatch} from 'screens/Patients/LeadsProfile/main/overview/hooks/useManufacturingDetails'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import BatchDetails from './BatchDetails'
import {
  ManufacturingItem,
  ManufacturingStatus,
} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import {useParams} from 'react-router-dom'
import {AllTreatmentPlanListItem} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'

interface BatchListProps {
  processed: ProcessedManufacturingBatch
  index: number
  plan: AllTreatmentPlanListItem
  totalBatches?: number
  latestManufacturingData?: ManufacturingItem | null
}

type NonNullManufacturingStatus = Exclude<ManufacturingStatus, null>
export const manufacturingStatusMapper: Record<NonNullManufacturingStatus, string> = {
  MANUFACTURING: 'MANUFACTURING',
  PENDING: 'PENDING',
  MANUFACTURING_STARTED: 'In Production',
  IN_PROGRESS: 'IN PROGRESS',
  COMPLETED: 'COMPLETED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
}

export const BatchList: React.FC<BatchListProps> = ({
  processed,
  index,
  plan,
  latestManufacturingData,
}) => {
  const {patientId} = useParams<{patientId: string}>()

  const outsourcedTo = useMemo(() => processed?.outsourced_to ?? null, [processed])

  const items = [
    {
      key: String(processed.id ?? index),
      label: (
        <div className='w-full flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          {/* Left: Batch name */}
          <div className='text-sm sm:text-base font-semibold'>Batch {processed?.batch_number}</div>

          {/* Right: meta (drops below on mobile, right-aligned on desktop) */}
          <div className='flex flex-col md:flex-row items-center gap-3 sm:gap-4'>
            <When isTrue={hasValue(processed.assignee)}>
              <div className='flex items-center gap-1'>
                <div className='font-figtree font-medium text-[12px] leading-[16px] tracking-[0.01em] text-textColor'>
                  Assignee:
                </div>
                <div className='font-figtree font-medium text-[12px] leading-[16px] tracking-[0.01em] text-black truncate max-w-[160px] sm:max-w-[220px]'>
                  {processed.assignee}
                </div>
              </div>
            </When>

            <When isTrue={hasValue(processed.created_by)}>
              <div className='flex items-center gap-1'>
                <div className='font-figtree font-medium text-[12px] leading-[16px] tracking-[0.01em] text-textColor'>
                  Created By:
                </div>
                <div className='font-figtree font-medium text-[12px] leading-[16px] tracking-[0.01em] text-black truncate max-w-[160px] sm:max-w-[220px]'>
                  {processed.created_by}
                </div>
              </div>
            </When>

            <When isTrue={hasValue(outsourcedTo)}>
              <div className='flex items-center gap-1'>
                <div className='font-figtree font-medium text-[12px] leading-[16px] tracking-[0.01em] text-textColor'>
                  Vendor:
                </div>
                <div className='font-figtree font-medium text-[12px] leading-[16px] tracking-[0.01em] text-black truncate max-w-[160px] sm:max-w-[220px]'>
                  {outsourcedTo}
                </div>
              </div>
            </When>
          </div>
        </div>
      ),
      // remove `extra` so layout can stack on mobile
      children: (
        <BatchDetails
          processed={processed}
          index={index}
          plan={plan}
          patientId={Number(patientId)}
          latestManufacturingData={latestManufacturingData}
        />
      ),
    },
  ]

  return (
    <Space
      direction='vertical'
      className='w-full block items-center' // block ensures it can take full width
      style={{width: '100%'}} // belt-and-suspenders for full width
    >
      <Collapse
        collapsible='header'
        defaultActiveKey={[items[0].key]}
        items={items}
        className='w-full'
        style={{width: '100%'}}
      />
    </Space>
  )
}
