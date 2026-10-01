import When from 'components/when/When'
import {optionType} from 'types/optionType'

const BorderedBox = ({value, label}: {value: string; label: string}) => {
  return (
    <div className='p-3 flex flex-col justify-center items-center font-medium'>
      <p className='text-base text-black'>{value}</p>
      <p className='text-sm text-textColor'>{label} Changed to</p>
    </div>
  )
}

const UpdateBodyForBulkActionsConfirmModal = ({
  singleUpdate,
  doubleUpdate,
  updateAll = true,
  status,
  productionLab,
  changedAlignersString,
  wearDays,
}: {
  singleUpdate?: boolean
  doubleUpdate?: boolean
  updateAll?: boolean
  status: optionType | null
  productionLab?: optionType | null
  wearDays?: optionType | null
  changedAlignersString: string
}) => {
  return (
    <div className='border border-mediumGray rounded-lg shadow-sm mt-4'>
      <div className='p-3 text-black text-xl font-bold'>
        <span className='text-textColor font-medium'>Aligner numbers: </span>
        {changedAlignersString}
      </div>
      <div className='w-full border border-lightGray'></div>
      <When isTrue={singleUpdate}>
        <BorderedBox
          value={
            status && !productionLab && !wearDays
              ? status.label
              : !status && productionLab && !wearDays
                ? productionLab.label
                : wearDays?.label || ''
          }
          label={
            status && !productionLab && !wearDays
              ? 'Status'
              : !status && productionLab && !wearDays
                ? 'Production Lab'
                : 'Wear days'
          }
        />
      </When>
      <When isTrue={doubleUpdate}>
        <div className='flex justify-evenly w-full'>
          <div className='w-1/2'>
            <BorderedBox
              value={
                status && productionLab && !wearDays
                  ? status.label
                  : status && !productionLab && wearDays
                    ? status.label
                    : productionLab?.label || ''
              }
              label={
                status && productionLab && !wearDays
                  ? 'Status'
                  : status && !productionLab && wearDays
                    ? 'Status'
                    : 'Production Lab'
              }
            />
          </div>

          <div className='w-[1px] min-h-full bg-lightGray'></div>
          <div className='w-1/2'>
            <BorderedBox
              value={
                status && productionLab && !wearDays
                  ? productionLab?.label || ''
                  : !status && productionLab && wearDays
                    ? wearDays?.label || ''
                    : status && !productionLab && wearDays
                      ? wearDays?.label || ''
                      : status?.label || ''
              }
              label={
                status && productionLab && !wearDays
                  ? 'Production Lab'
                  : !status && productionLab && wearDays
                    ? 'Wear days'
                    : status && !productionLab && wearDays
                      ? 'Wear days'
                      : 'Status'
              }
            />
          </div>
        </div>
      </When>
      <When isTrue={updateAll}>
        <div className='flex justify-evenly'>
          <div className='w-1/2'>
            <BorderedBox value={status?.label || ''} label={'Status'} />
          </div>
          <div className='w-[1px] min-h-full bg-lightGray'></div>
          <div className='w-1/2'>
            <BorderedBox value={productionLab?.label || ''} label={'Production Lab'} />
          </div>
        </div>
        <div className='w-full border border-lightGray'></div>
        <BorderedBox value={wearDays?.label || ''} label={'Wear days'} />
      </When>
    </div>
  )
}

export default UpdateBodyForBulkActionsConfirmModal
