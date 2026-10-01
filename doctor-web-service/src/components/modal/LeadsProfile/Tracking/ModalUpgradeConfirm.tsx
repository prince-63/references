import NotePadIcon from 'assets/icons/NotePadIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import ModalLayout from 'components/modal/ModalLayout'
import {useNavigate, useParams} from 'react-router-dom'

const ModalUpgradeConfirm = ({
  setIsModalUpgradeOpen,
}: {
  setIsModalUpgradeOpen: (isModalUpgradeOpen: boolean) => void
}) => {
  const {patientId} = useParams()
  const navigate = useNavigate()

  const handleUpgradeClick = () => {
    setIsModalUpgradeOpen(false)
    const queryParams = new URLSearchParams({
      new: 'false',
    }).toString()
    navigate(`/profile/${patientId}/plans-list?${queryParams}`)
  }
  return (
    <ModalLayout className='flex flex-col justify-center items-center p-10 w-[598px]'>
      <div className='flex w-16 h-16 bg-primarySupport rounded-full items-center justify-center'>
        <NotePadIcon />
      </div>

      <div className='text-center mt-6 text-black text-2xl font-semibold '>
        To upgrade to patient mobile app you will need to create a new treatment plan
      </div>

      <div className='w-full flex gap-4 mt-8'>
        <ButtonOutlined
          text={'Cancel'}
          className='h-14'
          onClick={() => {
            setIsModalUpgradeOpen(false)
          }}
        />

        <AntdButton
          text='Create new treatment plan'
          className='h-14 !w-full !bg-primaryColor'
          onClick={() => {
            handleUpgradeClick()
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default ModalUpgradeConfirm
