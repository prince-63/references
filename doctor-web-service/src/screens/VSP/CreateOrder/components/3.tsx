import useDispatchAction from '@hooks/useDispatchAction'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import RadioGroupIconWithDescription, {
  RadioOptionWithDescription,
} from 'components/RadioGroup/RadioGroupIconWithDescription'
import FormikInput from 'components/atom/Inputs/FormikInput'
import Footer from 'screens/Orders/components/Footer'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {nextStep, setIsLabSelected} from 'redux/Slices/AppSlice/orders/orders.slice'
import {setPlanningProductSelected} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {createVspOrder, updateVspOrder} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {RootState} from 'redux/store'
import {validationSchema} from '../validation/VspOrderDetailsSchem'
import {safeParseInt} from 'utils/ConstFunctions'
import {useLocation, useNavigate, useParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'

type OrderDetailsValues = {
  selected_product: string
  oral_surgeon_name: string
  orthodontist_name: string
  oral_surgeon_me: boolean
  orthodontist_me: boolean
}

const PRODUCT_OPTIONS: RadioOptionWithDescription[] = [
  {
    value: '1',
    label: 'VSP (3D)',
    description: 'Full 3D Surgical Planning',
  },
  {
    value: '2',
    label: 'VSP with Splints',
    description: 'Planning + Surgical Guides',
  },
  {
    value: '3',
    label: '2D Planning',
    description: 'Standard 2D Ceph Planning',
  },
  {
    value: '4',
    label: 'Only Genioplasty (3D)',
    description: '3D Chin Reconstruction',
  },
  {
    value: '5',
    label: 'Only Genioplasty (2D)',
    description: '2D Chin Planning',
  },
]

const OrderDetailsStep = () => {
  const {dispatchAction} = useDispatchAction()
  const {planningProductSelected} = useSelector((state: RootState) => state.productionSetup)
  const {orderPatientDetails, patientDetails} = useSelector((state: RootState) => state.orders)
  const {vspOrderDetails} = useSelector((state: RootState) => state.vspOrders)
  const {profileId, userId, organizationId, userDetail} = useContext(AuthContext)
  const navigate = useNavigate()
  const {state} = useLocation()
  const {orderId} = useParams()

  const meName = useMemo(() => {
    const firstName = String((userDetail as any)?.first_name ?? '').trim()
    const lastName = String((userDetail as any)?.last_name ?? '').trim()
    return `${firstName} ${lastName}`.trim()
  }, [userDetail])

  const selectedProductId = String(planningProductSelected?.id ?? '')
  const resolvedPatientId = 11041

  const initialValues: OrderDetailsValues = {
    selected_product: String(vspOrderDetails?.service_product_id ?? selectedProductId),
    oral_surgeon_name: String(vspOrderDetails?.oral_surgeon_name ?? ''),
    orthodontist_name: String(vspOrderDetails?.orthodontist_name ?? ''),
    oral_surgeon_me:
      hasValue(vspOrderDetails?.oral_surgeon_name) && vspOrderDetails?.oral_surgeon_name === meName,
    orthodontist_me:
      hasValue(vspOrderDetails?.orthodontist_name) && vspOrderDetails?.orthodontist_name === meName,
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={async (values) => {
        dispatchAction(nextStep())
      }}
    >
      {(formik) => {
        return (
          <>
            <div className='mx-auto w-full max-w-[980px] space-y-8 pb-28'>
              <div className='space-y-3'>
                <p className='text-xl font-semibold text-[#344054]'>
                  Select Product <span className='text-[#F04438]'>*</span>
                </p>
                <RadioGroupIconWithDescription
                  options={PRODUCT_OPTIONS}
                  selectedOption={formik.values.selected_product}
                  onOptionChange={(value) => {
                    formik.setFieldValue('selected_product', value)

                    const selectedOption = PRODUCT_OPTIONS.find((option) => option.value === value)
                    if (!selectedOption) return

                    dispatchAction(
                      setPlanningProductSelected({
                        id: safeParseInt(value),
                        product_name: String(selectedOption.label),
                        product_description: String(selectedOption.description ?? ''),
                        product_type: 'SERVICE',
                        product_category_name: 'PLANNING',
                        profile_id: safeParseInt(profileId),
                        organization_id: safeParseInt(organizationId),
                        doctor_id: safeParseInt(userId),
                      } as any)
                    )
                    dispatchAction(setIsLabSelected(true))
                  }}
                  wrapperClassName='grid w-full grid-cols-1 gap-4 md:grid-cols-2'
                  className='!min-h-[84px] !flex-row-reverse !items-center !justify-between !rounded-2xl !border-[#D0D5DD] !px-5 !py-4'
                />
                {formik.touched.selected_product && formik.errors.selected_product ? (
                  <p className='text-sm text-[#F04438]'>{formik.errors.selected_product}</p>
                ) : null}
              </div>

              <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xl font-medium text-[#344054]'>Oral Surgeon name</p>
                    <label className='inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#4462EA]'>
                      <input
                        type='checkbox'
                        checked={formik.values.oral_surgeon_me}
                        onChange={(event) => {
                          const checked = event.target.checked
                          formik.setFieldValue('oral_surgeon_me', checked)
                          formik.setFieldValue('oral_surgeon_name', checked ? meName : '')
                        }}
                        className='h-4 w-4 rounded border-[#D0D5DD] text-[#4462EA]'
                      />
                      ME
                    </label>
                  </div>
                  <FormikInput
                    name='oral_surgeon_name'
                    placeholder='Oral Surgeon Name'
                    className='!h-12 !rounded-xl !border-[#D0D5DD] !bg-white !px-4 !text-base !text-[#101828] placeholder:!text-[#98A2B3] focus:!border-[#4462EA]'
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <p className='text-xl font-medium text-[#344054]'>Orthodontist name</p>
                    <label className='inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#4462EA]'>
                      <input
                        type='checkbox'
                        checked={formik.values.orthodontist_me}
                        onChange={(event) => {
                          const checked = event.target.checked
                          formik.setFieldValue('orthodontist_me', checked)
                          formik.setFieldValue('orthodontist_name', checked ? meName : '')
                        }}
                        className='h-4 w-4 rounded border-[#D0D5DD] text-[#4462EA]'
                      />
                      ME
                    </label>
                  </div>
                  <FormikInput
                    name='orthodontist_name'
                    placeholder="Orthodontist's Name"
                    className='!h-12 !rounded-xl !border-[#D0D5DD] !bg-white !px-4 !text-base !text-[#101828] placeholder:!text-[#98A2B3] focus:!border-[#4462EA]'
                  />
                </div>
              </div>
            </div>

            <Footer
              onNext={() => formik.handleSubmit()}
              disableNext={!formik.values.selected_product}
              loadingNext={formik.isSubmitting}
            />
          </>
        )
      }}
    </Formik>
  )
}

export default OrderDetailsStep
