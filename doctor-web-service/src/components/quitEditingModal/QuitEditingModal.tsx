import {Modal} from 'antd'
import ButtonOutlined from 'components/atom/Buttons/ButtonOutlined'
import ButtonOutlinedRed from 'components/atom/Buttons/ButtonOutlinedRed'

const QuitEditingModal = ({
  visible = true,
  setQuitModalVisible = () => true,
  onOkClick = () => true,
  title = 'Quit Editing?',
  subTitle = 'You have unsaved changes. Are you sure you want to leave?',
}: {
  visible: boolean
  setQuitModalVisible: (value: boolean) => void
  onOkClick: () => void
  title?: string
  subTitle?: string
}) => {
  return (
    <Modal
      open={visible}
      onCancel={() => setQuitModalVisible(false)}
      destroyOnClose={true}
      style={{fontFamily: 'figtree', top: '25%'}}
      title={<p className='text-black text-2xl font-bold mt-4 text-center'>{title}</p>}
      transitionName=''
      footer={
        <div className='flex flex-row h-auto justify-between gap-6 mt-4'>
          <ButtonOutlined
            onClick={() => setQuitModalVisible(false)}
            text='Go back'
            className={
              'h-14 !border-mediumGray !text-textColor hover:bg-white hover:drop-shadow-none font-semibold'
            }
          />
          <ButtonOutlinedRed
            text='Yes, cancel'
            className='bg-redSupport'
            onClick={() => {
              setQuitModalVisible(false)
              onOkClick()
            }}
          />
        </div>
      }
    >
      <div className='w-auto h-auto mt-3 text-textColor text-base font-normal leading-snug text-center'>
        {subTitle}
      </div>
    </Modal>
  )
}
export default QuitEditingModal
