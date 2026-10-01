import CaretRightIcon from 'assets/icons/CaretRightIcon'
import PackageIcon from 'assets/icons/PackageIcon'
import clsx from 'clsx'
import {useSelector} from 'react-redux'
import {useNavigate, useParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'

interface SendCaseCardProps {
  draft?: boolean
  orderId?: string | null
}

export const SendCaseCard = ({draft, orderId}: SendCaseCardProps) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-2 border border-mediumGray rounded-lg p-3'>
      <div className='flex md:items-center items-start gap-2'>
        <div
          className={clsx(
            ' p-4 rounded-lg w-fit',
            gettingStartedStepData?.order_status === 'DRAFT'
              ? 'bg-orangeSupport'
              : 'bg-primarySupport'
          )}
        >
          <PackageIcon
            color={
              gettingStartedStepData?.order_status === 'DRAFT'
                ? getColorPalette().orange
                : getColorPalette().primaryColor
            }
          />
        </div>
        <div className='text-base text-textColor'>
          <p className='text-black font-semibold '>Submit a case to the lab</p>
          <p className='text-textColor font-normal text-sm'>
            Submit a new case to the lab to proceed with the treatment.
          </p>
        </div>
      </div>
      <button
        className={clsx(
          'flex float-end gap-2 text-white items-center font-semibold  rounded-lg px-4 py-2 mt-2 w-fit md:ml-0 ml-16',
          draft && orderId
            ? 'bg-orange' // 🔹 use your golden color class here
            : gettingStartedStepData?.order_status === 'DRAFT'
              ? 'bg-orange'
              : 'bg-primaryColor'
        )}
        type='button'
        onClick={() => {
          // 🔹 extra condition for props
          if (draft && orderId) {
            navigate(`/orders/create-order/${orderId}`, {
              state: patientId ? {patientId} : undefined,
            })
          } else if (gettingStartedStepData?.order_status === 'DRAFT' && patientId) {
            navigate(`/orders/create-order/${gettingStartedStepData?.order_id}`, {
              state: {patientId},
            })
          } else if (gettingStartedStepData?.order_status === 'DRAFT') {
            navigate(`/orders/create-order/${gettingStartedStepData?.order_id}`)
          } else {
            navigate('/orders/create-order', {
              state: patientId ? {patientId} : undefined,
            })
          }
        }}
      >
        {draft && orderId
          ? 'Finalize order'
          : gettingStartedStepData?.order_status === 'DRAFT'
            ? 'Finalize order'
            : 'Send a case'}
        <CaretRightIcon color={getColorPalette().white} width='7' height='10' />
      </button>
    </div>
  )
}
