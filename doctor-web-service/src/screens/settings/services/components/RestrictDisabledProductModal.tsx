import AntdButton from 'components/atom/Buttons/AntdButton'
import ModalLayout from 'components/modal/ModalLayout'

const RestrictDisabledProductModal = ({setClose}: {setClose: (x: boolean) => void}) => {
  return (
    <ModalLayout>
      <div className='flex flex-col gap-6'>
        <div className='flex flex-col gap-3 text-center '>
          <p className='font-bold text-2xl text-black'>Cannot Disable</p>
          <p className='text-textColor text-base'>
            At least one product or service must remain active. Please enable another item before
            disabling this one.
          </p>
        </div>
        <div className='flex  gap-2'>
          <AntdButton
            className='bg-primaryColor text-white h-12 font-semibold text-base w-full hover:!bg-primaryColor'
            text='OK'
            onClick={() => setClose(false)}
          />
        </div>
      </div>
    </ModalLayout>
  )
}

export default RestrictDisabledProductModal
