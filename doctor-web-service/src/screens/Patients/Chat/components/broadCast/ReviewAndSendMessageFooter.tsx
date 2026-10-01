import {Table} from '@tanstack/react-table'
import AntdButton from 'components/atom/Buttons/AntdButton'
import {FormValues, RowDataForBroadcastListPatients} from './broadCastTypes'
import {FormikProps} from 'formik'
import When from 'components/when/When'

const ReviewAndSendMessageFooter = ({
  table,
  formik,
  toggleSelectPatientDrawer,
  toggleAddMessageDrawer,
}: {
  table?: Table<RowDataForBroadcastListPatients>
  formik: FormikProps<FormValues>
  toggleAddMessageDrawer: (value: boolean) => void
  toggleSelectPatientDrawer?: (value: boolean) => void
}) => {
  return (
    <div className='flex py-2 flex-col md:flex-row justify-between items-center gap-3'>
      <When isTrue={!!table}>
        <p className='text-textColor font-medium text-base'>
          Sending to {table?.getSelectedRowModel().rows.length} patients
        </p>
      </When>
      <div className='flex gap-3 w-full md:w-auto md:ml-auto'>
        <AntdButton
          className=' hover:!bg-white !bg-white hover:!text-textColor h-12 font-semibold text-base w-full md:w-fit border !border-mediumGray !text-textColor '
          isLoading={false}
          text='Go back'
          onClick={() => {
            toggleAddMessageDrawer(false)
            formik.resetForm()
            if (toggleSelectPatientDrawer) {
              toggleSelectPatientDrawer(true)
            }
          }}
        />
        <AntdButton
          className='bg-primaryColor text-white h-12 font-semibold text-base w-full md:w-fit'
          isLoading={formik.isSubmitting}
          disabled={formik.isSubmitting}
          text='Confirm and send'
          htmlType='submit'
          onClick={() => formik.handleSubmit()}
        />
      </div>
    </div>
  )
}

export default ReviewAndSendMessageFooter
