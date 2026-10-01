import {Formik} from 'formik'
import * as Yup from 'yup'
import moment from 'moment'
import FormikDatePicker from 'components/atom/Inputs/FormikDatePicker'
import FormikInput from 'components/atom/Inputs/FormikInput'
import HttpMethod from '@constants/httpMethods.constants'
import apiHelper from '@utils/apiHelper'
import {logToConsole} from '@utils/logToConsole'
import {postVspProductionShipping} from '@utils/vspProductionShipping'
import useDispatchAction from '@hooks/useDispatchAction'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {URL_VSP_PRODUCTION_STATUS} from 'redux/Endpoints/apiEndpoints'
import {postShippingDetails} from 'redux/Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import hasValue from 'utils/hasValue'
import {safeParseInt} from 'utils/ConstFunctions'
import type {ProductionOrderData} from './VspProductionTracking'
import {useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

interface ShippingFormValues {
  shipping_date: string
  tentative_date: string
  tracking_link: string
  tracking_number: string
  files: File[]
}

const validationSchema = Yup.object({
  shipping_date: Yup.string().nullable(),
  tentative_date: Yup.string().required('Tentative date is required'),
  tracking_link: Yup.string().nullable(),
  tracking_number: Yup.string().nullable(),
})

const VspProductionShippingForm = ({
  data,
  onCancel,
  onStatusUpdate,
}: {
  data: ProductionOrderData
  onCancel: () => void
  onStatusUpdate: () => void
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)

  return (
    <Formik<ShippingFormValues>
      initialValues={{
        shipping_date: data.shipping?.shipping_date ?? data.shipping?.dispatch_date ?? '',
        tentative_date: data.shipping?.tentative_delivery_date ?? '',
        tracking_link: data.shipping?.tracking_link ?? '',
        tracking_number: data.shipping?.tracking_number ?? '',
        files: [],
      }}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values, actions) => {
        const patient_id = safeParseInt(patientId)
        const manufacturingId = data.production_id

        if (!patient_id || !manufacturingId) {
          ErrorToast('Unable to find shipping details for this case.')
          actions.setSubmitting(false)
          return
        }

        try {
          const formattedShippingDate = values.shipping_date
            ? moment(values.shipping_date).format('YYYY-MM-DD')
            : null
          const formattedTentativeDate = moment(values.tentative_date).format('YYYY-MM-DD')
          const trimmedTrackingNumber = String(values.tracking_number ?? '').trim()
          const trimmedTrackingLink = values.tracking_link?.trim() ?? ''

          if (serviceConfig?.VSP_PLANNING) {
            await postVspProductionShipping({
              production_id: manufacturingId,
              tracking_number: trimmedTrackingNumber,
              tentative_date: formattedTentativeDate,
              tracking_link: trimmedTrackingLink,
              shipping_date: formattedShippingDate,
            })
          } else {
            const payload = {
              details: {
                status: 'SHIPPED',
                shipping_date: formattedShippingDate,
                tentative_delivery_date: formattedTentativeDate,
                manufacturing_id: manufacturingId,
                tracking_number: trimmedTrackingNumber,
                tracking_link: trimmedTrackingLink,
                patient_id: patient_id,
                shipping_added_on: hasValue(data.shipping?.tentative_delivery_date)
                  ? null
                  : moment().format('YYYY-MM-DD'),
              },
              files: values.files,
            }

            await dispatchAction(postShippingDetails(payload)).unwrap()
          }

          await apiHelper(
            URL_VSP_PRODUCTION_STATUS,
            HttpMethod.PATCH,
            {production_id: data.production_id, status: 'SHIPPED'},
            true
          )

          SuccessToast('Shipping details saved successfully.')
          onStatusUpdate()
        } catch (error: any) {
          logToConsole('Failed to save shipping details', error)
          ErrorToast(error?.status?.message ?? error?.message ?? 'Failed to save shipping details')
        } finally {
          actions.setSubmitting(false)
        }
      }}
    >
      {(formik) => (
        <div className='max-w-[760px]'>
          <div className='space-y-5 rounded-2xl border border-[#EAECF0] bg-white p-5 md:p-6'>
            <div>
              <h2 className='text-xl font-semibold text-gray-900'>Shipping details</h2>
            </div>

            <div className='flex flex-col gap-3'>
              <FormikDatePicker
                name='shipping_date'
                label='Shipping date'
                placeholder='DD-MM-YYYY'
                format='DD-MM-YYYY'
              />

              <FormikDatePicker
                name='tentative_date'
                label='Tentative date'
                placeholder='DD-MM-YYYY'
                required
                format='DD-MM-YYYY'
              />

              <FormikInput name='tracking_link' label='Tracking link' placeholder='Paste link' />

              <FormikInput
                name='tracking_number'
                label='Tracking number'
                placeholder='Tracking number'
              />
            </div>
          </div>

          <div className='mt-6 flex gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={formik.isSubmitting}
              className='h-11 flex-1 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='button'
              onClick={() => formik.handleSubmit()}
              disabled={formik.isSubmitting}
              className='h-11 flex-1 rounded-xl bg-[#4A62E8] text-sm font-semibold text-white shadow-sm transition hover:bg-[#3E57DD] disabled:opacity-50'
            >
              Mark as Shipped
            </button>
          </div>
        </div>
      )}
    </Formik>
  )
}

export default VspProductionShippingForm
