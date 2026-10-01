import {useContext, useEffect, useState} from 'react'
import {Formik} from 'formik'
import {Button, Spin} from 'antd'
import {useDispatch} from 'react-redux'
import {useOutletContext, useParams} from 'react-router-dom'
import {AuthContext} from 'context/AuthContext'
import useDispatchAction from '@hooks/useDispatchAction'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {safeParseInt} from 'utils/ConstFunctions'
import {validationSchema} from 'screens/Orders/Steps/ShippingDetails/config'
import ShippingAddressFields from 'components/shipping/ShippingAddressFields'
import {IShippingDetails} from 'screens/Orders/orders.types'
import {
  addShippingDetails,
  setShipping,
  updateShippingDetails,
} from 'redux/Slices/AppSlice/ProductionSetup/Production.slice'
import {getDefaultShipmentAddress} from 'redux/Slices/AppSlice/orders/orders.slice'
import {
  addVspShippingDetails,
  getVspDefaultShippingAddress,
  updateVspShippingDetails,
  VspDefaultShippingAddressResponse,
} from 'redux/Slices/AppSlice/VSP/orders.slice'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {PracticeProfileOutletContext} from '../types/practiceProfile.types'

type ShippingAddressSettingsProps = {
  readMode?: boolean
}

const emptyShippingAddress: IShippingDetails = {
  addressed_to: '',
  name: '',
  mobile_number: '',
  address_line: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  default: true,
  profile_id: null,
  customer_profile_id: null,
}

const getTextValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
    if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  }
  return ''
}

const shippingAddressCompareFields = [
  'addressed_to',
  'name',
  'mobile_number',
  'address_line',
  'city',
  'state',
  'country',
  'pincode',
  'default',
] as const

type ShippingAddressCompareField = (typeof shippingAddressCompareFields)[number]

const normalizeCompareValue = (field: ShippingAddressCompareField, value: unknown) => {
  if (field === 'default') return Boolean(value)

  return String(value ?? '').trim()
}

const hasShippingAddressChanges = (
  values: Partial<IShippingDetails>,
  initialValues: Partial<IShippingDetails>
) =>
  shippingAddressCompareFields.some(
    (field) =>
      normalizeCompareValue(field, values[field]) !==
      normalizeCompareValue(field, initialValues[field])
  )

const mapVspDefaultShippingAddress = (
  response?: (VspDefaultShippingAddressResponse & Record<string, any>) | null
): IShippingDetails => ({
  ...emptyShippingAddress,
  addressed_to: getTextValue(response?.addressed_to, response?.addressedTo, response?.name),
  name: getTextValue(response?.name),
  mobile_number: getTextValue(response?.mobile_number, response?.mobileNumber),
  address_line: getTextValue(response?.address_line, response?.addressLine),
  city: getTextValue(response?.city),
  state: getTextValue(response?.state),
  country: getTextValue(response?.country),
  pincode: getTextValue(response?.pincode),
  default: response?.default ?? response?.isDefault ?? true,
  profile_id: response?.profile_id ?? response?.profileId ?? null,
  customer_profile_id: response?.customer_profile_id ?? response?.customerProfileId ?? null,
  shipping_id: response?.shipping_id ?? response?.shippingId ?? undefined,
})

const ShippingAddressSettings = ({readMode = false}: ShippingAddressSettingsProps) => {
  const {profileId} = useContext(AuthContext)
  const {customerId} = useParams<{customerId: string}>()
  const {isVspPlanning} = useOutletContext<PracticeProfileOutletContext>()
  const {dispatchAction} = useDispatchAction()
  const dispatch = useDispatch()
  const {isPractice, isCustomer} = useAllUserPlan()
  const [shippingData, setShippingData] = useState<IShippingDetails>(emptyShippingAddress)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const parsedProfileId = safeParseInt(profileId)
    const parsedCustomerId = safeParseInt(customerId)

    if (!parsedProfileId || !parsedCustomerId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const request = isVspPlanning
      ? dispatchAction(
          getVspDefaultShippingAddress({
            profileId: parsedProfileId,
            customerProfileId: parsedCustomerId,
          })
        )
      : dispatchAction(
          getDefaultShipmentAddress({
            profileId: parsedProfileId,
            customerId: parsedCustomerId,
          })
        )

    request
      .unwrap()
      .then((response: IShippingDetails | VspDefaultShippingAddressResponse) => {
        const nextShippingData = isVspPlanning
          ? mapVspDefaultShippingAddress(response as VspDefaultShippingAddressResponse)
          : {
              ...emptyShippingAddress,
              ...(response as IShippingDetails),
              shipping_id:
                (response as any)?.shipping_id ?? (response as any)?.shippingId ?? undefined,
              default: (response as IShippingDetails)?.default ?? true,
            }

        setShippingData(nextShippingData)
        dispatchAction(setShipping(nextShippingData))
      })
      .catch(() => {
        setShippingData(emptyShippingAddress)
        dispatchAction(setShipping(null))
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [customerId, dispatchAction, isVspPlanning, profileId])

  return (
    <div className='px-4 sm:px-6'>
      <div className='mb-6'>
        <h2 className='text-2xl md:text-3xl font-semibold'>Shipping Address</h2>
        <p className='mt-2 text-sm text-textColor'>
          Add the default shipping details for this practice profile.
        </p>
      </div>

      <Spin spinning={isLoading}>
        <Formik
          initialValues={shippingData}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={async (values) => {
            if (!hasShippingAddressChanges(values, shippingData)) return

            const parsedProfileId = safeParseInt(profileId)
            const parsedCustomerId = safeParseInt(customerId)

            if (!parsedProfileId || !parsedCustomerId) {
              ErrorToast('Missing required identifiers to save shipping details.')
              return
            }

            setIsSaving(true)
            const shippingId =
              (shippingData as any)?.shipping_id ?? (shippingData as any)?.shippingId ?? null
            const shouldSaveAsDefault = !isPractice && !isCustomer
            const payloadValues = {
              ...values,
              default: shouldSaveAsDefault,
            }

            let shippingAction
            if (shippingId) {
              if (isVspPlanning) {
                shippingAction = updateVspShippingDetails({
                  ...payloadValues,
                  shipping_id: shippingId,
                  profile_id: parsedProfileId,
                  customer_profile_id: parsedCustomerId,
                })
              } else {
                shippingAction = updateShippingDetails({
                  ...payloadValues,
                  shipping_id: shippingId,
                  profile_id: parsedProfileId,
                  customer_profile_id: parsedCustomerId,
                  treatement_plan_id: undefined,
                })
              }
            } else {
              if (isVspPlanning) {
                shippingAction = addVspShippingDetails({
                  ...payloadValues,
                  profile_id: parsedProfileId,
                  customer_profile_id: parsedCustomerId,
                })
              } else {
                shippingAction = addShippingDetails({
                  ...payloadValues,
                  profile_id: parsedProfileId,
                  customer_profile_id: parsedCustomerId,
                  treatement_plan_id: undefined,
                })
              }
            }

            dispatchAction(shippingAction)
              .unwrap()
              .then((response: any) => {
                const nextShippingData = {
                  ...emptyShippingAddress,
                  ...response,
                  shipping_id: response?.shipping_id ?? shippingId ?? undefined,
                  profile_id: parsedProfileId,
                  customer_profile_id: parsedCustomerId,
                  default: response?.default ?? shouldSaveAsDefault,
                }
                setShippingData(nextShippingData)
                dispatchAction(setShipping(nextShippingData))
                SuccessToast('Shipping details saved successfully')
              })
              .catch(() => {
                ErrorToast('Failed to save shipping details')
              })
              .finally(() => {
                setIsSaving(false)
              })
          }}
        >
          {(formik) => {
            const hasChanges = hasShippingAddressChanges(formik.values, shippingData)

            return (
              <div className='max-w-4xl rounded-xl border border-gray-200 bg-white p-4 sm:p-6'>
                <ShippingAddressFields formik={formik} dispatch={dispatch} />

                {!readMode && (
                  <div className='mt-6 flex justify-end'>
                    <Button
                      type='primary'
                      className='min-w-28'
                      loading={isSaving}
                      disabled={!hasChanges || isSaving}
                      onClick={() => {
                        if (!hasChanges) return
                        formik.handleSubmit()
                      }}
                    >
                      Save
                    </Button>
                  </div>
                )}
              </div>
            )
          }}
        </Formik>
      </Spin>
    </div>
  )
}

export default ShippingAddressSettings
