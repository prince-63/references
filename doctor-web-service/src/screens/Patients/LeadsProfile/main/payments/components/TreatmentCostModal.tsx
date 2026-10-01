import AntdButton from 'components/atom/Buttons/AntdButton'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import {useFormik, useFormikContext} from 'formik'
import {useContext, useState} from 'react'
import {SVG_CROSS} from 'utils/SvgConstants'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import * as Yup from 'yup'
import {useParams} from 'react-router-dom'
import {
  postTreatmentCost,
  setIsTreatmentCostModalVisible,
} from 'redux/Slices/AppSlice/Payments/Payments.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import InputDropdownFormik from 'components/atom/Inputs/InputDropdownFormik'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import PatientDetails from 'components/patientDetails/PatientDetails'
import {FilterDrawerFormikContextType} from 'screens/billingsAndPayments/billingsAndPayments.types'

const validationSchema = Yup.object().shape({
  treatmentCost: Yup.string()
    .min(3, 'Minimum 3 digits required')
    .required('Please enter a treatment cost'),
})

const TreatmentCostModal = ({
  isOnBillingsAndPaymentsPage,
  patientTreatmentCostData,
}: {
  isOnBillingsAndPaymentsPage?: boolean
  patientTreatmentCostData?: {
    initialTreatmentCost: string
    patientId: number
    patientName?: string
    profileUrl?: string | null
  }
}) => {
  const {dispatchAction} = useDispatchAction()
  const {patientId} = useParams()
  const {userId}: any = useContext(AuthContext)
  const billingPageFormik = useFormikContext<FilterDrawerFormikContextType>()

  const {paymentDetail, postTreatmentCostLoading} = useSelector(
    (state: RootState) => state.payments
  )

  const [errorMsg, setErrorMsg] = useState('')

  const formik = useFormik<{
    treatmentCost: string
  }>({
    initialValues: {
      treatmentCost: String(
        !isOnBillingsAndPaymentsPage
          ? hasValue(paymentDetail?.cost)
            ? paymentDetail?.cost
            : ''
          : patientTreatmentCostData?.initialTreatmentCost
      ),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      await dispatchAction(
        postTreatmentCost({
          doctor_id: safeParseInt(userId),
          patient_id: !isOnBillingsAndPaymentsPage
            ? safeParseInt(patientId)
            : safeParseInt(patientTreatmentCostData?.patientId),
          cost: String(values.treatmentCost),
        })
      )
        .unwrap()
        .then((res: any) => {
          if (res) {
            if (isOnBillingsAndPaymentsPage) {
              billingPageFormik.handleSubmit()
            }
            dispatchAction(setIsTreatmentCostModalVisible(false))
            SuccessToast('Treatment cost updated successfully.')
          }
        })
        .catch((error: any) => {
          if (error?.error_code === 'T00002') {
            setErrorMsg('Treatment cost cannot be lower than any previously added payments.')
          }
        })
    },
  })

  return (
    <ModalLayout className='w-full md:w-fit py-8 px-8' isResponsive>
      <div className='flex justify-between items-center'>
        <div className='text-[24px] font-semibold mr-10'>Treatment cost details</div>
        <div
          className='cursor-pointer'
          onClick={() => dispatchAction(setIsTreatmentCostModalVisible(false))}
        >
          <CommonSVG svg={SVG_CROSS} width='32' height='32' />
        </div>
      </div>
      <When isTrue={isOnBillingsAndPaymentsPage}>
        {patientTreatmentCostData?.patientName && (
          <div className='mt-2'>
            <PatientDetails
              {...{
                patient: {
                  patient_name: patientTreatmentCostData?.patientName,
                  profile_url: patientTreatmentCostData?.profileUrl,
                },
              }}
            />
          </div>
        )}
      </When>
      <div className='md:w-[400px] mt-4'>
        <InputDropdownFormik
          formik={formik}
          required={true}
          name='treatmentCost'
          label='Treatment cost'
          classNameLabel='font-medium'
          className=''
          minLength={3}
          maxLength={7}
          onChange={(value) => {
            setErrorMsg('')
            formik.setFieldValue('treatmentCost', value)
          }}
        />
        {errorMsg && <div className='text-red text-xs'>{errorMsg}</div>}
      </div>
      <div className='flex mt-7 gap-8'>
        <AntdButton
          text={'Save'}
          className='h-12 !bg-primaryColor w-full hover:!bg-primaryColor text-[16px] font-semibold'
          loading={postTreatmentCostLoading}
          onClick={() => formik.handleSubmit()}
        />
      </div>
    </ModalLayout>
  )
}

export default TreatmentCostModal
