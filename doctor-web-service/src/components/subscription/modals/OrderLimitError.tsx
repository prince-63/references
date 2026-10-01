import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import CloseIcon from 'assets/icons/CloseIcon'
import InfoIcon from 'assets/icons/InfoIcon'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {setOpenOverOrderLimit} from 'redux/Slices/AppSlice/Labs/labs.slice'
import {RootState} from 'redux/store'

const OrderLimitError = () => {
  const navigate = useNavigate()
  const {dispatchAction} = useDispatchAction()
  const {openOverOrderLimit} = useSelector((state: RootState) => state.labs)

  return (
    <Modal
      open={openOverOrderLimit}
      onCancel={() => dispatchAction(setOpenOverOrderLimit(false))}
      footer={[]}
      zIndex={2000}
      closeIcon={false}
    >
      <div className='p-3'>
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center justify-center w-12 h-12 rounded-full bg-redSupport'>
            <InfoIcon color='red' width='24' height='24' />
          </div>
          <div
            className='cursor-pointer'
            onClick={() => {
              dispatchAction(setOpenOverOrderLimit(false))
            }}
          >
            <CloseIcon width='24' height='24' />
          </div>
        </div>
        <div>
          <p className='font-semibold text-2xl '>You’ve reached your order limit</p>
          <p className=' text-textColor text-base font-normal'>
            To process more orders, please contact us to top up your limit.
          </p>
        </div>
        <button
          className='w-full h-12 bg-red text-white font-semibold rounded-lg mt-6'
          onClick={() => {
            navigate('/settings/upgrade-renew-subscription')
            dispatchAction(setOpenOverOrderLimit(false))
          }}
        >
          Upgrade
        </button>
      </div>
    </Modal>
  )
}

export default OrderLimitError
