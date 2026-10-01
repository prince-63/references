import manufacturingConstants from '@constants/manufacturing.constants'
import useDispatchAction from '@hooks/useDispatchAction'
import {Modal} from 'antd'
import clsx from 'clsx'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import {Formik} from 'formik'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {
  postCompleteManufacturing,
  setOpenConfirmShippedModal,
} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import {RootState} from 'redux/store'
import {safeParseInt} from 'utils/ConstFunctions'
import * as Yup from 'yup'
import {useManufacturingDetails} from '../hooks/useManufacturingDetails'

const schema = Yup.object().shape({
  delivery_date: Yup.string().required('Tentative date is required'),
})
const ConfirmShippedModal = ({
  openModal,
  refreshData,
}: {
  openModal: boolean
  refreshData: () => void
}) => {
  const {patientId: id} = useParams()
  const {dispatchAction} = useDispatchAction()
  const {order} = useSelector((state: RootState) => state.orders)
  const patientId = order?.patient_details?.id ?? id
  const {latest_manufacturing_data} = useManufacturingDetails({})
  const defaultDeliveryDate = latest_manufacturing_data?.shipping_added_on
    ? moment(latest_manufacturing_data.shipping_added_on).toISOString()
    : latest_manufacturing_data?.delivered_on
      ? moment(latest_manufacturing_data.delivered_on).toISOString()
      : ''

  return (
    <Formik
      enableReinitialize
      initialValues={{
        delivery_date: defaultDeliveryDate,
      }}
      validationSchema={schema}
      onSubmit={(values) => {
        if (!latest_manufacturing_data) return
        const payload = {
          patient_id: safeParseInt(patientId),
          delivery_date: moment(values.delivery_date).format('YYYY-MM-DD'),
          status: manufacturingConstants.DELIVERED,
          manufacturing_id: latest_manufacturing_data?.manufacturing_batch_id,
          is_show_mark_as_received: true,
        }

        dispatchAction(postCompleteManufacturing(payload))
          .unwrap()
          .then(() => {
            dispatchAction(setOpenConfirmShippedModal(false))
            refreshData()
          })
      }}
    >
      {(formik) => {
        return (
          <Modal
            closable={false}
            destroyOnClose={true}
            open={openModal}
            className={clsx('md:w-[566px] w-full')}
            maskClosable={false}
            width={566}
            footer={
              <div className={clsx('flex gap-2 px-5 pb-5')}>
                <button
                  className={clsx(
                    'w-full text-primaryColor border border-primaryColor py-3 px-6 rounded-lg'
                  )}
                  type='button'
                  onClick={() => {
                    dispatchAction(setOpenConfirmShippedModal(false))
                  }}
                >
                  Cancel
                </button>
                <button
                  className={clsx('w-full text-white bg-primaryColor py-3 px-6 rounded-lg')}
                  type='submit'
                  onClick={() => {
                    formik.handleSubmit()
                  }}
                >
                  Submit
                </button>
              </div>
            }
          >
            <div className='flex flex-col gap-4 p-5'>
              <div className={clsx('md:text-2xl text-xl font-semibold')}>Shipping details</div>
              <div className='flex flex-col gap-3'>
                <FormikDatePicker
                  name='delivery_date'
                  label='Delivered on'
                  required
                  placeholder='DD-MM-YYYY'
                  format='DD-MM-YYYY'
                />
              </div>
            </div>
          </Modal>
        )
      }}
    </Formik>
  )
}

export default ConfirmShippedModal
