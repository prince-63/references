import useDispatchAction from '@hooks/useDispatchAction'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import RadioGroupIconWithDescription, {
  RadioOptionWithDescription,
} from 'components/RadioGroup/RadioGroupIconWithDescription'
import FormikInput from 'components/atom/Inputs/FormikInput'
import Footer from 'screens/Orders/components/Footer'
import {AuthContext} from 'context/AuthContext'
import {Formik} from 'formik'
import {useContext, useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {getVendorsList, nextStep, setIsLabSelected} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  getProductList,
  setPlanningProductSelected,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {createVspOrder, updateVspOrder} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {RootState} from 'redux/store'
import {validationSchema} from '../validation/VspOrderDetailsSchem'
import {safeParseInt} from 'utils/ConstFunctions'
import {useNavigate, useParams, useSearchParams} from 'react-router-dom'
import hasValue from 'utils/hasValue'
import Page from 'components/page/Page'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {getLeadsProfileDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

type OrderDetailsValues = {
  selected_product: string
  oral_surgeon_name: string
  orthodontist_name: string
  oral_surgeon_me: boolean
  orthodontist_me: boolean
}

const OrderDetailsStep = () => {
  const {dispatchAction} = useDispatchAction()
  const {planningProductSelected} = useSelector((state: RootState) => state.productionSetup)
  const {activeVendorsList} = useSelector((state: RootState) => state.orders)
  const {vspOrderDetails} = useSelector((state: RootState) => state.vspOrders)
  const {profileId, userId, userDetail} = useContext(AuthContext)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const patientId = searchParams.get('patient_id')
  const {orderId} = useParams()
  const {ownerProducts} = useSelector((state: RootState) => state.productionSetup)
  const {isEnterprisePlanUser} = useAllUserPlan()

  const {data: patientDetails} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)

  const assignedPractice = patientDetails?.patient_details?.assigned_practice

  useEffect(() => {
    dispatchAction(
      getVendorsList({
        doctor_id: safeParseInt(userId),
        withoutOwnDoctor: true,
      })
    )
  }, [dispatchAction, userId])

  useEffect(() => {
    dispatchAction(
      getProductList({
        owner_profile_id: safeParseInt(profileId),
        vendor_profile_ids: (activeVendorsList || [])
          .map((vendor) => safeParseInt(vendor?.value))
          .filter((id) => id > 0),
        product_type: 'ALIGNER',
        search: '',
      })
    )
  }, [dispatchAction, profileId, activeVendorsList])

  useEffect(() => {
    if (patientId) {
      dispatchAction(
        getLeadsProfileDetails({
          patient_id: safeParseInt(patientId),
          doctor_id: safeParseInt(userId),
        } as any)
      )
    }
  }, [dispatchAction, patientId, userId])

  const meName = useMemo(() => {
    const firstName = String((userDetail as any)?.first_name ?? '').trim()
    const lastName = String((userDetail as any)?.last_name ?? '').trim()
    return `${firstName} ${lastName}`.trim()
  }, [userDetail])

  const productOptions: RadioOptionWithDescription[] = useMemo(() => {
    if (!ownerProducts?.length) return []

    return [...ownerProducts].reverse().map((product) => ({
      value: String(product.id),
      label: product.product_name,
      description: product.product_description ?? '',
    }))
  }, [ownerProducts])
  const selectedProductId = String(planningProductSelected?.id ?? '')

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
    <Page
      title={<p className='text-2xl font-bold text-gray-900'>Order Details</p>}
      headerClassName='flex md:flex-row items-center'
      exitConfirmPredicate={false}
      containerClassName='w-full'
    >
      <div className='inline-flex items-center gap-1.5 rounded-full py-1 text-base font-medium'>
        Select your required VSP product and assign providers.
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values) => {
          if (!values.selected_product) {
            ErrorToast('Please select a product to proceed')
            return
          }

          const serviceProductId = safeParseInt(values.selected_product)
          if (!serviceProductId) {
            ErrorToast('Please select a valid product to proceed')
            return
          }

          const existingOrderId = orderId ?? vspOrderDetails?.order_id

          const receiverProfileId = isEnterprisePlanUser
            ? safeParseInt(planningProductSelected?.profile_id) || safeParseInt(profileId)
            : safeParseInt(planningProductSelected?.profile_id)

          const senderProfileId = isEnterprisePlanUser
            ? safeParseInt(assignedPractice?.practice_profile_id) || safeParseInt(profileId)
            : safeParseInt(profileId)

          try {
            if (hasValue(existingOrderId)) {
              await dispatchAction(
                updateVspOrder({
                  order_id: String(existingOrderId),
                  service_product_id: serviceProductId,
                  oral_surgeon_name: values.oral_surgeon_name,
                  orthodontist_name: values.orthodontist_name,
                  status: vspOrderDetails?.status ?? 'DRAFT',
                  patient_id: safeParseInt(patientId!),
                  receiver_profile_id: receiverProfileId > 0 ? receiverProfileId : undefined,
                  sender_profile_id: senderProfileId > 0 ? senderProfileId : undefined,
                })
              ).unwrap()

              if (!orderId && existingOrderId) {
                navigate(`/vsp/create-order/${existingOrderId}?patient_id=${patientId}`, {
                  replace: true,
                })
              }
              dispatchAction(nextStep())
            } else {
              const created = await dispatchAction(
                createVspOrder({
                  patient_id: safeParseInt(patientId!),
                  service_product_id: serviceProductId,
                  oral_surgeon_name: values.oral_surgeon_name,
                  orthodontist_name: values.orthodontist_name,
                  status: 'DRAFT',
                  receiver_profile_id: receiverProfileId > 0 ? receiverProfileId : undefined,
                  sender_profile_id: senderProfileId > 0 ? senderProfileId : undefined,
                })
              ).unwrap()

              if (created?.order_id) {
                navigate(`/vsp/create-order/${created.order_id}?patient_id=${patientId}`, {
                  replace: true,
                })
                dispatchAction(nextStep())
              }
            }
          } catch (error: any) {
            const errorCode = typeof error === 'string' ? error : error?.error_code
            if (errorCode === 'END000') {
              ErrorToast('You have exceeded your plan limit. Please upgrade to continue.')
            }
          }
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
                    options={productOptions}
                    selectedOption={formik.values.selected_product}
                    onOptionChange={(value) => {
                      formik.setFieldValue('selected_product', value)

                      const selectedProduct = ownerProducts.find((p) => String(p.id) === value)
                      if (!selectedProduct) return

                      dispatchAction(
                        setPlanningProductSelected({
                          id: selectedProduct.id,
                          product_name: selectedProduct.product_name,
                          product_description: selectedProduct.product_description ?? '',
                          product_type: selectedProduct.product_type,
                          product_category_name: selectedProduct.product_category_name,
                          profile_id: selectedProduct.profile_id,
                          organization_id: selectedProduct.organization_id,
                          doctor_id: selectedProduct.doctor_id,
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
    </Page>
  )
}

export default OrderDetailsStep
