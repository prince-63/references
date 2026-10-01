import {Modal} from 'antd'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {useSelector} from 'react-redux'
import {useSearchParams} from 'react-router-dom'
import {RootState} from 'redux/store'
import getInitialValues from '../helpers/getInitialValues'

const ConfirmAddCustomRole = ({
  open,
  setOpen,
  onClick,
  formik,
}: {
  open: boolean
  setOpen: (x: boolean) => void
  formik: any
  onClick: ({values, formik}: {values: ReturnType<typeof getInitialValues>; formik: any}) => void
}) => {
  const [searchParams] = useSearchParams()
  const isEdit = searchParams.get('edit') === 'true'
  const {loadingAddCustomRole} = useSelector((state: RootState) => state.accessControl)

  return (
    <Modal
      destroyOnClose={true}
      style={{fontFamily: 'figtree'}}
      closable={false}
      open={open}
      title={
        <p className='font-semibold text-2xl'>{isEdit ? 'Confirm changes?' : 'Add Custom Role?'}</p>
      }
      width={500}
      centered
      footer={
        isEdit ? (
          <div className='flex justify-between gap-2'>
            <AntdButton
              key='submit'
              text='Save'
              htmlType='submit'
              className='h-11 w-full bg-primaryColor text-center'
              loading={loadingAddCustomRole}
              onClick={() => onClick({values: formik.values, formik})} // ✅ now typed correctly
            />
            <button
              className='w-full rounded-lg h-10 px-5 text-primaryColor border border-primaryColor bg-primarySupport justify-start'
              type='button'
              onClick={() => setOpen(false)}
            >
              Go back
            </button>
          </div>
        ) : (
          <div className='flex justify-between gap-2'>
            <button
              className='w-full rounded-lg h-10 px-5 text-primaryColor border border-primaryColor bg-primarySupport justify-start'
              type='button'
              onClick={() => setOpen(false)}
            >
              Go back
            </button>

            <AntdButton
              key='submit'
              text='Save'
              htmlType='submit'
              className='h-11 w-full bg-primaryColor text-center'
              loading={loadingAddCustomRole}
              onClick={() => onClick({values: formik.values, formik})} // ✅ now typed correctly
            />
          </div>
        )
      }

      //   onCancel={() => handleClose(formik)}
    >
      <div className='text-normal text-textColor'>
        {isEdit
          ? 'Once saved, these changes will impact ALL users with this role assigned to ongoing orders. Are you sure you want to save changes?'
          : 'This will create a new role with the selected permissions. You can always edit it later if needed.'}
      </div>
    </Modal>
  )
}

export default ConfirmAddCustomRole
