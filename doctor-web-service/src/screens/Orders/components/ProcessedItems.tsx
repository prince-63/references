import When from 'components/when/When'
import {
  ManufacturingItem,
  ManufacturingStatus,
} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'
import BatchCompletionStatus from './BatchCompletionStatus'
import useDispatchAction from '@hooks/useDispatchAction'
import {
  setOpenCompleteManufacturingModal,
  setOpenConfirmShippedModal,
  setOpenShippingDetailsModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import hasValue from 'utils/hasValue'
import {arrangedAlignerString} from 'utils/ConstFunctions'
import AntdButton from 'components/atom/Buttons/AntdButton'
import useAllUserPlan from '@hooks/useAllUserPlan'

const ProcessedItems = ({
  manufacturing,
  index,
  is_latest_treatment_deactivated,
}: {
  manufacturing: ManufacturingItem
  index: number
  is_latest_treatment_deactivated: boolean
}) => {
  const {isOrganization} = useAllUserPlan()
  const {dispatchAction} = useDispatchAction()
  const getActionButton = (manufacturing_status: ManufacturingStatus) => {
    if (manufacturing_status == 'MANUFACTURING_STARTED') {
      return (
        <AntdButton
          className='text-primaryColor bg-primarySupport border border-primaryColor font-semibold w-fit px-3 py-1.5 rounded-lg'
          disabled={is_latest_treatment_deactivated}
          text='Complete manufacturing'
          htmlType='button'
          onClick={() => {
            dispatchAction(setOpenCompleteManufacturingModal(true))
          }}
        />
      )
    } else if (manufacturing_status === 'COMPLETED') {
      return (
        <div className='flex items-center gap-2'>
          <AntdButton
            className='text-primaryColor bg-primarySupport border border-primaryColor font-semibold w-fit px-3 py-1.5 rounded-lg '
            disabled={is_latest_treatment_deactivated}
            text='Ship order'
            htmlType='button'
            onClick={() => {
              dispatchAction(setOpenShippingDetailsModal(true))
            }}
          />
          <AntdButton
            className='text-primaryColor bg-primarySupport border border-primaryColor font-semibold w-fit px-3 py-1.5 rounded-lg '
            disabled={is_latest_treatment_deactivated}
            text='Already delivered?'
            htmlType='button'
            onClick={() => {
              dispatchAction(setOpenConfirmShippedModal(true))
            }}
          />
        </div>
      )
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <div>
        <div className='flex gap-3 items-center'>
          <div className='font-semibold'>Batch {index + 1}</div>
          {manufacturing?.due_days !== 0 && hasValue(manufacturing?.due_days) && (
            <div className='flex gap-1 items-center'>
              <div className='w-2 h-2 bg-orange rounded-full'></div>
              <div className='text-xs text-textColor font-semibold'>
                Due in {manufacturing?.due_days ?? 0} days
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
      <BatchCompletionStatus manufacturing={manufacturing} />
      <When isTrue={isOrganization}>{getActionButton(manufacturing?.status)}</When>
    </div>
  )
}

export default ProcessedItems
