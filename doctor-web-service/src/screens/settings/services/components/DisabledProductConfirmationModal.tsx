import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const DisabledProductConfirmationModal = ({
  setClose,
  onConfirm,
}: {
  setClose: (x: boolean) => void
  onConfirm: () => void
}) => {
  const {loadingAddProduct} = useSelector((state: RootState) => state.uiServices)

  return (
    <ModalLayout>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-3 text-center'>
          <p className='font-bold text-2xl text-black'> Disable Product?</p>
          <p className='text-textColor text-base'>
            Are you sure you want to disable? It will no longer appear in the product list during
            order creation or be visible to customers.
          </p>
        </div>
        <div className='flex  gap-2'>
          <button
            className='bg-white text-red border border-red h-12 font-semibold text-base w-full rounded'
            type='button'
            onClick={() => setClose(false)}
          >
            Cancel
          </button>
          <AntdButton
            className='bg-red text-white h-12 font-semibold text-base w-full hover:!bg-red'
            text='Yes, Disable'
            onClick={onConfirm}
            loading={loadingAddProduct}
            disabled={loadingAddProduct}
          />
        </div>
      </div>
    </ModalLayout>
  )
}

export default DisabledProductConfirmationModal
