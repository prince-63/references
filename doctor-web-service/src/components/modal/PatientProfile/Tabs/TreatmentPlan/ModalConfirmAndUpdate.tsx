import {Dispatch, FC, SetStateAction, useState} from 'react'
import BackGroundSVG from '../../../../atom/SVG/BackGroundSVG'
import {SVG_WEAR_DAYS} from '../../../../../utils/SvgConstants'
import ModalSuccess from '../../../Alert/ModalSuccess'
import ButtonOutlined from '../../../../atom/Buttons/ButtonOutlined'
import {optionType} from '../../../../../types/optionType'
import {useSelector} from 'react-redux'
import AntdButton from '../../../../atom/Buttons/AntdButton'
import {RootState} from '../../../../../redux/store'
import {alignerNumbersArrayToConcatenatedString} from '../../../../../@utils/convertAlignerNumbersArrayToString'
import UpdateBodyForBulkActionsConfirmModal from './UpdateBodyForBulkActionsConfirmModal'
import StatusOrProductionLabUpdateModalBody from './StatusOrProductionLabUpdateModalBody'
import When from 'components/when/When'

interface ModalConfirmAndUpdateProps {
  setIsModalConfirmAndUpdateOpen?: Dispatch<SetStateAction<boolean>>
  status: optionType | null
  productionLab?: optionType | null
  wearDays?: optionType | null
  changedAligners: number[]
  onSubmit: () => void
  handleCancel?: () => void
  alignerRowStatusChange?: boolean
}

const ModalConfirmAndUpdate: FC<ModalConfirmAndUpdateProps> = (
  props: ModalConfirmAndUpdateProps
) => {
  const {
    setIsModalConfirmAndUpdateOpen,
    status,
    productionLab,
    changedAligners,
    wearDays,
    onSubmit,
    handleCancel = () => setIsModalConfirmAndUpdateOpen && setIsModalConfirmAndUpdateOpen(false),
    alignerRowStatusChange = false,
  } = props
  const [success, setSuccess] = useState<boolean>(false)

  const isConfirmAndUpdateLoading = useSelector(
    (state: RootState) => state.apiStatusProductionLabUpdate.loading
  )

  const changedAlignersString = alignerNumbersArrayToConcatenatedString(changedAligners)

  const statusUpdateTitle = 'Do you want to update status for '
  const productionLabUpdateTitle = 'Do you want to update production lab for'
  const statusAndProductionLab = 'Do you want to update status and production lab for'
  const statusAndWearDays = 'Do you want to update status and wear days for'
  const productionLabAndWearDays = 'Do you want to update production lab and wear days for'
  const wearDaysUpdateTitle = 'Do you want to update wear days for '
  const allUpdateTitle = 'Do you want to update status, production lab & wear days for '
  let title
  if (status && productionLab && wearDays) {
    title = allUpdateTitle
  } else if (status && productionLab) {
    title = statusAndProductionLab
  } else if (status && wearDays) {
    title = statusAndWearDays
  } else if (productionLab && wearDays) {
    title = productionLabAndWearDays
  } else if (status) {
    title = statusUpdateTitle
  } else if (productionLab) {
    title = productionLabUpdateTitle
  } else if (wearDays) {
    title = wearDaysUpdateTitle
  }

  return (
    <div
      className='fixed left-0 top-0 z-[1055] h-full w-full flex justify-center items-center bg-black bg-opacity-40'
      tabIndex={-1}
    >
      {success && (
        <ModalSuccess
          setIsSuccessModelOpen={setSuccess}
          title={'Wear days details have been successfully updated!'}
        />
      )}
      {!success && (
        <div className=' bg-white w-[34rem] rounded-lg p-6 shadow-lg'>
          <div className='flex justify-between items-center'>
            <BackGroundSVG
              svg={SVG_WEAR_DAYS}
              width='26'
              height='26'
              className='w-16 h-16 bg-primarySupport rounded-full'
            />
          </div>
          <div className='mt-4'>
            <div className='text-black text-2xl font-bold flex-wrap w-full'>{title}</div>
          </div>
          <When isTrue={!alignerRowStatusChange}>
            <UpdateBodyForBulkActionsConfirmModal
              {...{
                singleUpdate: !!(
                  (status && !productionLab && !wearDays) ||
                  (!status && productionLab && !wearDays) ||
                  (!status && !productionLab && wearDays)
                ),
                doubleUpdate: !!(
                  (status && productionLab && !wearDays) ||
                  (status && !productionLab && wearDays) ||
                  (!status && productionLab && wearDays)
                ),
                updateAll: !!(status && productionLab && wearDays),
                status,
                productionLab,
                changedAlignersString,
                wearDays,
              }}
            />
          </When>
          <When isTrue={alignerRowStatusChange}>
            <StatusOrProductionLabUpdateModalBody
              changeMessage={'Status changed to'}
              newValue={status?.label as string}
            />
          </When>
          <div className='mt-7 flex gap-8'>
            <ButtonOutlined
              text={'Cancel'}
              className='h-12 bg-transparent border border-primaryColor text-primaryColor'
              onClick={handleCancel}
            />
            <AntdButton
              onClick={onSubmit}
              text={'Confirm & Update'}
              isLoading={isConfirmAndUpdateLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ModalConfirmAndUpdate
