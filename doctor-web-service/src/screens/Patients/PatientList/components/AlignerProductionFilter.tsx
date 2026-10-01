import {useMemo, useState} from 'react'
import {Button, Divider, Popover, Radio, Select} from 'antd'
import clsx from 'clsx'
import FilterIcon from 'assets/icons/FilterIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'

export type SortKey = 'PATIENT_NAME' | 'UPDATED_ON' | 'NEXT_FOLLOW_UP'

type Option = {value: number; label: string}

type Props = {
  /** Full list of selectable assignees */
  assigneeOptions: Option[]
  /** Full list of selectable products */
  productOptions: Option[]
  /** Current (controlled) values from parent */
  value?: {
    assigneeIds?: number[]
    productIds?: number[]
    sortBy?: SortKey
  }
  /** Initial fallback when value is not provided */
  defaultValue?: {
    assigneeIds?: number[]
    productIds?: number[]
    sortBy?: SortKey
  }
  /** Loading state for Apply button (optional) */
  applying?: boolean
  /** Callback when user hits Apply */
  onApply: (payload: {assigneeIds: number[]; productIds: number[]; sortBy: SortKey}) => void
  /** Callback when user hits Reset */
  onReset?: () => void
  /** Optional: className for the trigger button wrapper */
  className?: string
  /** Optional: button label (defaults to "Filter") */
  triggerLabel?: string
}

const AlignerProductionFilter: React.FC<Props> = ({
  assigneeOptions,
  productOptions,
  value,
  defaultValue,
  applying = false,
  onApply,
  onReset,
  className,
  triggerLabel = 'Filter',
}) => {
  // Resolve starting values (controlled -> default -> sane defaults)
  const startAssignees = value?.assigneeIds ?? defaultValue?.assigneeIds ?? []
  const startProducts = value?.productIds ?? defaultValue?.productIds ?? []
  const startSort = value?.sortBy ?? defaultValue?.sortBy ?? 'PATIENT_NAME'

  // Local, editable copies inside the popover
  const [open, setOpen] = useState(false)
  const [assigneeIds, setAssigneeIds] = useState<number[]>(startAssignees)
  const [productIds, setProductIds] = useState<number[]>(startProducts)
  const [sortBy, setSortBy] = useState<SortKey>(startSort)

  // Keep local state in sync if parent changes value (rare but helpful)
  useMemo(() => {
    if (!open) {
      setAssigneeIds(startAssignees)
      setProductIds(startProducts)
      setSortBy(startSort)
    }
  }, [startAssignees, startProducts, startSort, open])

  const handleApply = () => {
    onApply({
      assigneeIds,
      productIds,
      sortBy,
    })
    setOpen(false)
  }

  const handleReset = () => {
    setAssigneeIds([])
    setProductIds([])
    setSortBy('PATIENT_NAME')
    onReset?.()
  }

  const content = (
    <div className='flex p-4 flex-col gap-3 w-[320px]'>
      <div className='font-figtree text-sm font-semibold'>Filter by</div>

      <div>
        <div className='text-textColor font-figtree text-sm font-medium mb-1'>Assignee</div>
        <Select
          mode='multiple'
          allowClear
          placeholder='Select assignees'
          className='w-full'
          value={assigneeIds}
          onChange={(value: number[]) => setAssigneeIds(value)}
          options={assigneeOptions}
          optionFilterProp='label'
          maxTagCount='responsive'
        />
      </div>
      <div>
        <div className='text-textColor font-figtree text-sm font-medium mb-1'>Product</div>
        <Select
          mode='multiple'
          allowClear
          placeholder='Select products'
          className='w-full'
          value={productIds}
          onChange={(value: number[]) => setProductIds(value)}
          options={productOptions}
          optionFilterProp='label'
          maxTagCount='responsive'
        />
      </div>

      <Divider className='m-0' />
      <div>
        <div className='text-textColor font-figtree text-sm font-medium mb-1'>Sort by</div>
        <Radio.Group
          className='flex flex-col gap-1'
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
        >
          <Radio value='PATIENT_NAME'>Patient name</Radio>
          <Radio value='NEXT_FOLLOW_UP'>Due date</Radio>
          <Radio value='UPDATED_ON'>Updated on</Radio>
        </Radio.Group>
      </div>

      {/* Actions */}
      <div className='flex gap-2 w-full mt-1'>
        <Button className='w-full' onClick={handleReset}>
          Reset
        </Button>

        <AntdButton
          className='bg-primaryColor text-white h-10 font-semibold text-base w-full'
          isLoading={applying}
          text='Apply'
          htmlType='submit'
          onClick={() => {
            handleApply()
          }}
        />
      </div>
    </div>
  )

  return (
    <Popover
      title={null}
      content={content}
      placement='bottom'
      trigger={['click']}
      overlayInnerStyle={{padding: 4, fontFamily: 'Figtree', width: 300}}
      open={open}
      onOpenChange={setOpen}
      className='transition ease-in-out duration-200'
    >
      <button
        type='button'
        className={clsx(
          'rounded-lg flex justify-center items-center border px-2 py-1 border-mediumGray text-textColor',
          className
        )}
      >
        <FilterIcon color='#666666' />
        <span className='ml-1'>{triggerLabel}</span>
      </button>
    </Popover>
  )
}

export default AlignerProductionFilter
