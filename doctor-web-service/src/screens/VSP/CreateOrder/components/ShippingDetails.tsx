import React, {useCallback, useContext, useEffect, useState} from 'react'
import {Formik, FormikProps} from 'formik'
import * as Yup from 'yup'
import Page from 'components/page/Page'
import FormikInput from 'components/atom/Inputs/FormikInput'
import InputGoogleSearch from 'components/atom/Inputs/InputGoogleSearch'
import LabelTitle from 'components/atom/Labels/LabelTitle'
import Footer from './VSPFooter'
import {useDispatch} from 'react-redux'
import {Country} from 'country-state-city'
import {URL_GET_GOOGLE_MAPS_DATA} from 'redux/Endpoints/apiEndpoints'
import {Truck, Receipt} from 'lucide-react'
import {nextStep} from 'redux/Slices/AppSlice/orders/orders.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import ErrorToast from 'components/modal/Alert/ErrorToast'
import {
  createVspOrder,
  getVspDefaultBillingAddress,
  getVspDefaultShippingAddress,
  updateVspOrder,
  VspDefaultBillingAddressResponse,
  VspDefaultShippingAddressResponse,
} from 'redux/Slices/AppSlice/VSP/orders.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import {useNavigate} from 'react-router-dom'
import {useVspOrder} from '../hooks/useVspOrder'
import addressService from 'services/addressCityStateCountry/address.service'
import DropdownSimple from 'components/atom/Dropdown/DropdownSimple'
import {AuthContext} from 'context/AuthContext'

/* ─────────────── Types ─────────────── */

interface ShippingFormValues {
  addressed_to: string
  name: string
  mobile_number: string
  address_line: string
  country: string
  state: string
  city: string
  pincode: string
  default: boolean
  billing_same_as_shipping: boolean
  billing_name: string
  billing_address_line: string
  billing_country: string
  billing_state: string
  billing_city: string
  billing_pincode: string
  billing_default: boolean
}

type ShippingPrefillData = Pick<
  ShippingFormValues,
  | 'addressed_to'
  | 'name'
  | 'mobile_number'
  | 'address_line'
  | 'country'
  | 'state'
  | 'city'
  | 'pincode'
  | 'default'
>

type BillingPrefillData = Pick<
  ShippingFormValues,
  | 'billing_name'
  | 'billing_address_line'
  | 'billing_country'
  | 'billing_state'
  | 'billing_city'
  | 'billing_pincode'
  | 'billing_default'
>

const hasTextValue = (value: unknown) => Boolean(String(value ?? '').trim())

const hasShippingDetailsValue = (details?: Partial<ShippingPrefillData> | null) =>
  Boolean(
    details &&
      [
        details.addressed_to,
        details.name,
        details.mobile_number,
        details.address_line,
        details.country,
        details.state,
        details.city,
        details.pincode,
      ].some(hasTextValue)
  )

const hasBillingDetailsValue = (details?: Partial<BillingPrefillData> | null) =>
  Boolean(
    details &&
      [
        details.billing_name,
        details.billing_address_line,
        details.billing_country,
        details.billing_state,
        details.billing_city,
        details.billing_pincode,
      ].some(hasTextValue)
  )

const getStringValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
  }
  return ''
}

const getBooleanValue = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'boolean') return value
  }
  return false
}

const mapDefaultShippingAddressToForm = (
  details?: VspDefaultShippingAddressResponse | Record<string, any> | null
): ShippingPrefillData => ({
  addressed_to: getStringValue(details?.addressed_to, details?.addressedTo, details?.name),
  name: getStringValue(details?.name),
  mobile_number: getStringValue(details?.mobile_number, details?.mobileNumber),
  address_line: getStringValue(details?.address_line, details?.addressLine),
  country: getStringValue(details?.country),
  state: getStringValue(details?.state),
  city: getStringValue(details?.city),
  pincode: getStringValue(details?.pincode),
  default: getBooleanValue(details?.default, details?.isDefault),
})

const mapDefaultBillingAddressToForm = (
  details?: VspDefaultBillingAddressResponse | Record<string, any> | null
): BillingPrefillData => ({
  billing_name: getStringValue(details?.name),
  billing_address_line: getStringValue(details?.address_line, details?.addressLine),
  billing_country: getStringValue(details?.country),
  billing_state: getStringValue(details?.state),
  billing_city: getStringValue(details?.city),
  billing_pincode: getStringValue(details?.pincode),
  billing_default: getBooleanValue(details?.default, details?.isDefault),
})

/* ─────────────── Validation ─────────────── */

const validationSchema = Yup.object({
  addressed_to: Yup.string()
    .min(2, 'Must be at least 2 characters')
    .max(150, 'Must be 150 characters or less')
    .nullable(),
  name: Yup.string().min(2).max(150, 'Must be 150 characters or less').nullable(),
  mobile_number: Yup.string()
    .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
    .min(10, 'Mobile number must be at least 10 digits')
    .max(15, 'Mobile number must be at most 15 digits')
    .nullable(),
  address_line: Yup.string().nullable(),
  country: Yup.string().nullable(),
  state: Yup.string().nullable(),
  city: Yup.string().nullable(),
  billing_name: Yup.string().min(2).max(150, 'Must be 150 characters or less').nullable(),
  billing_address_line: Yup.string().nullable(),
  billing_country: Yup.string().nullable(),
  billing_state: Yup.string().nullable(),
  billing_city: Yup.string().nullable(),
})

/* ─────────────── Google Places helper ─────────────── */

const fillAddressFromPlace = async (
  placeId: string,
  formik: FormikProps<ShippingFormValues>,
  prefix: '' | 'billing_'
) => {
  try {
    const response = await fetch(URL_GET_GOOGLE_MAPS_DATA(placeId))
    if (!response.ok) throw new Error('Failed to fetch Google Maps data')

    const data = await response.json()
    const placeDetails = data.result

    formik.setFieldValue(`${prefix}address_line`, placeDetails?.formatted_address || '')
    formik.setFieldValue(`${prefix}name`, placeDetails?.name || '')

    const addressList = placeDetails?.address_components || []
    addressList.forEach((address: any) => {
      const types: string[] = address.types

      if (types.includes('country')) {
        const countryName = Country.getAllCountries().find(
          (c) => c.name.toLowerCase() === address.long_name.toLowerCase()
        )?.name
        if (countryName) formik.setFieldValue(`${prefix}country`, countryName)
      }
      if (types.includes('administrative_area_level_1')) {
        formik.setFieldValue(`${prefix}state`, address.long_name)
      }
      if (types.includes('locality')) {
        formik.setFieldValue(`${prefix}city`, address.long_name)
      }
      if (types.includes('postal_code')) {
        formik.setFieldValue(`${prefix}pincode`, address.long_name)
      }
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Google Maps API error:', error)
  }
}

/* ─────────────── Section Header ─────────────── */

const SectionHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
}) => (
  <div className='flex items-start gap-3'>
    <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600'>
      {icon}
    </div>
    <div>
      <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
      <p className='mt-0.5 text-sm text-gray-500 leading-5'>{subtitle}</p>
    </div>
  </div>
)

/* ─────────────── Shipping Section ─────────────── */

const ShippingSection = ({
  formik,
  dispatch,
  shippingSameAsBilling,
  onToggleSame,
}: {
  formik: FormikProps<ShippingFormValues>
  dispatch: any
  shippingSameAsBilling: boolean
  onToggleSame: () => void
  countryOptions: any[]
  stateOptions: any[]
  cityOptions: any[]
  onCountryChange: (country: string) => void
  onStateChange: (country: string, state: string) => void
}) => {
  const handleShippingPlaceChange = (value: any) => {
    const placeId = value?.value?.place_id
    if (placeId) fillAddressFromPlace(placeId, formik, '')
  }

  return (
    <div className='space-y-5 rounded-2xl border border-[#EAECF0] bg-white p-5 md:p-6'>
      <SectionHeader
        icon={<Truck className='h-5 w-5' />}
        title='Shipping Details'
        subtitle='Where should we deliver the order?'
      />

      <div
        className='flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-all hover:border-gray-300'
        onClick={onToggleSame}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
            shippingSameAsBilling
              ? 'border-primaryColor bg-primaryColor'
              : 'border-gray-300 bg-white'
          }`}
        >
          {shippingSameAsBilling && (
            <svg
              className='h-3 w-3 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={3}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
            </svg>
          )}
        </span>
        <span className='text-sm font-medium text-gray-700'>Same as billing address</span>
      </div>

      {!shippingSameAsBilling && (
        <div className='space-y-5 rounded-xl border border-gray-100 bg-gray-50/50 p-5'>
          <FormikInput name='addressed_to' label='Addressed to' />

          <div className='space-y-3'>
            <div>
              <LabelTitle
                title='Address'
                required={false}
                className='text-base text-textColor font-medium'
              />
            </div>
            <InputGoogleSearch handleInputChange={handleShippingPlaceChange} />
          </div>

          <FormikInput name='name' label='Name' maxLength={2000} value={formik.values.name} />

          <div className='flex gap-3'>
            <div className='flex-1'>
              <FormikInput name='address_line' label='Address' maxLength={2000} />
            </div>
            <div className='flex-1'>
              <FormikInput
                name='mobile_number'
                label='Mobile Number'
                maxLength={15}
                placeholder=''
                value={formik.values.mobile_number}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <div className='w-full mt-2'>
              <DropdownSimple
                name='country'
                className=''
                label='Country'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                placeholder='Select a Country'
                value={formik.getFieldProps('country').value}
                dispatch={dispatch}
                allowClear={true}
              />
            </div>

            <div className='w-full mt-2'>
              <DropdownSimple
                name='state'
                className=''
                label='State'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                placeholder='Select a State'
                value={formik.getFieldProps('state').value}
                dispatch={dispatch}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <div className='w-full mt-2'>
              <DropdownSimple
                name='city'
                className=''
                label='City'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                placeholder='Select a City'
                value={formik.getFieldProps('city').value}
                dispatch={dispatch}
              />
            </div>

            <div className='w-full mt-2'>
              <FormikInput
                name='pincode'
                label='Pincode'
                className='py-3'
                value={formik.getFieldProps('pincode').value}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────── Billing Section ─────────────── */

const BillingSection = ({
  formik,
  dispatch,
  billingSameAsShipping,
}: {
  formik: FormikProps<ShippingFormValues>
  dispatch: any
  billingSameAsShipping: boolean
  onToggleSame: () => void
  countryOptions: any[]
  stateOptions: any[]
  cityOptions: any[]
  onCountryChange: (country: string) => void
  onStateChange: (country: string, state: string) => void
}) => {
  const handleBillingPlaceChange = (value: any) => {
    const placeId = value?.value?.place_id
    if (placeId) fillAddressFromPlace(placeId, formik, 'billing_')
  }

  return (
    <div className='space-y-5 rounded-2xl border border-[#EAECF0] bg-white p-5 md:p-6'>
      <SectionHeader
        icon={<Receipt className='h-5 w-5' />}
        title='Billing Details'
        subtitle='Provide the billing address for this order.'
      />

      {!billingSameAsShipping && (
        <div className='space-y-5 rounded-xl border border-gray-100 bg-gray-50/50 p-5'>
          <div className='space-y-3'>
            <div>
              <LabelTitle
                title='Address'
                required={false}
                className='text-base text-textColor font-medium'
              />
            </div>
            <InputGoogleSearch handleInputChange={handleBillingPlaceChange} />
          </div>

          <FormikInput
            name='billing_name'
            label='Name'
            maxLength={2000}
            value={formik.values.billing_name}
          />

          <FormikInput name='billing_address_line' label='Address' maxLength={2000} />

          <div className='flex gap-2'>
            <div className='w-full mt-2'>
              <DropdownSimple
                name='billing_country'
                className=''
                label='Country'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                placeholder='Select a Country'
                value={formik.getFieldProps('billing_country').value}
                dispatch={dispatch}
                allowClear={true}
              />
            </div>

            <div className='w-full mt-2'>
              <DropdownSimple
                name='billing_state'
                className=''
                label='State'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                placeholder='Select a State'
                value={formik.getFieldProps('billing_state').value}
                dispatch={dispatch}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <div className='w-full mt-2'>
              <DropdownSimple
                name='billing_city'
                className=''
                label='City'
                classNameLabel='text-sm text-textColor font-medium'
                formik={formik}
                required={false}
                placeholder='Select a City'
                value={formik.getFieldProps('billing_city').value}
                dispatch={dispatch}
              />
            </div>

            <div className='w-full mt-2'>
              <FormikInput
                name='billing_pincode'
                label='Pincode'
                className='py-3'
                value={formik.getFieldProps('billing_pincode').value}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─────────────── Main Form ─────────────── */

export default function ShippingDetailsForm() {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {vspOrderDetails, orderId} = useVspOrder()
  const {profileId} = useContext(AuthContext)
  const dispatch = useDispatch()
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(false)
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(false)
  const [defaultShippingData, setDefaultShippingData] = useState<ShippingPrefillData | null>(null)
  const [defaultBillingData, setDefaultBillingData] = useState<BillingPrefillData | null>(null)

  const [shippingCountryOptions, setShippingCountryOptions] = useState<any[]>([])
  const [shippingStateOptions, setShippingStateOptions] = useState<any[]>([])
  const [shippingCityOptions, setShippingCityOptions] = useState<any[]>([])

  const [billingCountryOptions, setBillingCountryOptions] = useState<any[]>([])
  const [billingStateOptions, setBillingStateOptions] = useState<any[]>([])
  const [billingCityOptions, setBillingCityOptions] = useState<any[]>([])

  useEffect(() => {
    addressService.getCountryList(dispatch).then((list: any[]) => {
      if (list) {
        setShippingCountryOptions(list)
        setBillingCountryOptions(list)
      }
    })
  }, [dispatch])

  const shippingDetailsFromOrder: ShippingPrefillData = {
    addressed_to: vspOrderDetails?.shipping_details?.addressed_to ?? '',
    name: vspOrderDetails?.shipping_details?.name ?? '',
    mobile_number: vspOrderDetails?.shipping_details?.mobile_number ?? '',
    address_line: vspOrderDetails?.shipping_details?.address_line ?? '',
    country: vspOrderDetails?.shipping_details?.country ?? '',
    state: vspOrderDetails?.shipping_details?.state ?? '',
    city: vspOrderDetails?.shipping_details?.city ?? '',
    pincode: vspOrderDetails?.shipping_details?.pincode ?? '',
    default: Boolean(vspOrderDetails?.shipping_details?.default),
  }

  const billingDetailsFromOrder: BillingPrefillData = {
    billing_name: vspOrderDetails?.billing_details?.name ?? '',
    billing_address_line: vspOrderDetails?.billing_details?.address_line ?? '',
    billing_country: vspOrderDetails?.billing_details?.country ?? '',
    billing_state: vspOrderDetails?.billing_details?.state ?? '',
    billing_city: vspOrderDetails?.billing_details?.city ?? '',
    billing_pincode: vspOrderDetails?.billing_details?.pincode ?? '',
    billing_default: Boolean(vspOrderDetails?.billing_details?.default),
  }

  const hasOrderShippingDetails = hasShippingDetailsValue(shippingDetailsFromOrder)
  const hasOrderBillingDetails = hasBillingDetailsValue(billingDetailsFromOrder)
  const defaultProfileId =
    safeParseInt(vspOrderDetails?.sender_profile_id) || safeParseInt(profileId)
  const defaultCustomerProfileId = safeParseInt(vspOrderDetails?.created_by_user_profile_id) || null

  useEffect(() => {
    let isMounted = true

    if (orderId && !vspOrderDetails) return

    if (!defaultProfileId) {
      setDefaultShippingData(null)
      setDefaultBillingData(null)
      return
    }

    const payload = {
      profileId: defaultProfileId,
      customerProfileId: defaultCustomerProfileId,
    }

    const loadDefaultAddresses = async () => {
      if (hasOrderShippingDetails) {
        if (isMounted) setDefaultShippingData(null)
      } else {
        try {
          const response = await dispatchAction(getVspDefaultShippingAddress(payload)).unwrap()
          if (isMounted) {
            setDefaultShippingData(mapDefaultShippingAddressToForm(response))
          }
        } catch {
          if (isMounted) setDefaultShippingData(null)
        }
      }

      if (hasOrderBillingDetails) {
        if (isMounted) setDefaultBillingData(null)
      } else {
        try {
          const response = await dispatchAction(getVspDefaultBillingAddress(payload)).unwrap()
          if (isMounted) {
            setDefaultBillingData(mapDefaultBillingAddressToForm(response))
          }
        } catch {
          if (isMounted) setDefaultBillingData(null)
        }
      }
    }

    loadDefaultAddresses()

    return () => {
      isMounted = false
    }
  }, [
    defaultCustomerProfileId,
    defaultProfileId,
    dispatchAction,
    hasOrderBillingDetails,
    hasOrderShippingDetails,
    orderId,
    vspOrderDetails,
  ])

  const handleShippingCountryChange = useCallback(
    (country: string) => {
      setShippingStateOptions([])
      setShippingCityOptions([])
      addressService.getStateList(dispatch, country).then((list: any[]) => {
        if (list) setShippingStateOptions(list)
      })
    },
    [dispatch]
  )

  const handleShippingStateChange = useCallback(
    (country: string, state: string) => {
      setShippingCityOptions([])
      addressService.getCityList(dispatch, country, state).then((list: any[]) => {
        if (list) setShippingCityOptions(list)
      })
    },
    [dispatch]
  )

  const handleBillingCountryChange = useCallback(
    (country: string) => {
      setBillingStateOptions([])
      setBillingCityOptions([])
      addressService.getStateList(dispatch, country).then((list: any[]) => {
        if (list) setBillingStateOptions(list)
      })
    },
    [dispatch]
  )

  const handleBillingStateChange = useCallback(
    (country: string, state: string) => {
      setBillingCityOptions([])
      addressService.getCityList(dispatch, country, state).then((list: any[]) => {
        if (list) setBillingCityOptions(list)
      })
    },
    [dispatch]
  )

  const handleToggleBillingSame = (formik: FormikProps<ShippingFormValues>) => {
    const next = !billingSameAsShipping
    setBillingSameAsShipping(next)
    if (next) {
      formik.setFieldValue('billing_name', '')
      formik.setFieldValue('billing_address_line', '')
      formik.setFieldValue('billing_country', '')
      formik.setFieldValue('billing_state', '')
      formik.setFieldValue('billing_city', '')
      formik.setFieldValue('billing_pincode', '')
      formik.setFieldValue('billing_default', false)
    }
  }

  const handleToggleShippingSame = (formik: FormikProps<ShippingFormValues>) => {
    const next = !shippingSameAsBilling
    setShippingSameAsBilling(next)
    if (next) {
      formik.setFieldValue('addressed_to', '')
      formik.setFieldValue('name', '')
      formik.setFieldValue('mobile_number', '')
      formik.setFieldValue('address_line', '')
      formik.setFieldValue('country', '')
      formik.setFieldValue('state', '')
      formik.setFieldValue('city', '')
      formik.setFieldValue('pincode', '')
    }
  }

  return (
    <Page
      title={<p className='text-2xl font-bold text-gray-900'>Shipping &amp; Billing</p>}
      headerClassName='flex md:flex-row items-center'
      exitConfirmPredicate={false}
      containerClassName='w-full'
    >
      <p className='text-sm text-gray-500 -mt-2 mb-6'>
        Provide shipping and billing addresses for this order.
      </p>

      <Formik<ShippingFormValues>
        initialValues={{
          addressed_to: hasOrderShippingDetails
            ? shippingDetailsFromOrder.addressed_to
            : (defaultShippingData?.addressed_to ?? ''),
          name: hasOrderShippingDetails
            ? shippingDetailsFromOrder.name
            : (defaultShippingData?.name ?? ''),
          mobile_number: hasOrderShippingDetails
            ? shippingDetailsFromOrder.mobile_number
            : (defaultShippingData?.mobile_number ?? ''),
          address_line: hasOrderShippingDetails
            ? shippingDetailsFromOrder.address_line
            : (defaultShippingData?.address_line ?? ''),
          country: hasOrderShippingDetails
            ? shippingDetailsFromOrder.country
            : (defaultShippingData?.country ?? ''),
          state: hasOrderShippingDetails
            ? shippingDetailsFromOrder.state
            : (defaultShippingData?.state ?? ''),
          city: hasOrderShippingDetails
            ? shippingDetailsFromOrder.city
            : (defaultShippingData?.city ?? ''),
          pincode: hasOrderShippingDetails
            ? shippingDetailsFromOrder.pincode
            : (defaultShippingData?.pincode ?? ''),
          default: hasOrderShippingDetails
            ? shippingDetailsFromOrder.default
            : (defaultShippingData?.default ?? false),
          billing_same_as_shipping: true,
          billing_name: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_name
            : (defaultBillingData?.billing_name ?? ''),
          billing_address_line: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_address_line
            : (defaultBillingData?.billing_address_line ?? ''),
          billing_country: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_country
            : (defaultBillingData?.billing_country ?? ''),
          billing_state: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_state
            : (defaultBillingData?.billing_state ?? ''),
          billing_city: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_city
            : (defaultBillingData?.billing_city ?? ''),
          billing_pincode: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_pincode
            : (defaultBillingData?.billing_pincode ?? ''),
          billing_default: hasOrderBillingDetails
            ? billingDetailsFromOrder.billing_default
            : (defaultBillingData?.billing_default ?? false),
        }}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={async (values, actions) => {
          try {
            const resolvedOrderId = String(vspOrderDetails?.order_id ?? orderId ?? '').trim()
            const billingDefaultValue = billingSameAsShipping
              ? values.default
              : values.billing_default

            const shippingDetails = shippingSameAsBilling
              ? {
                  addressed_to: values.billing_name,
                  name: values.billing_name,
                  mobile_number: '',
                  address_line: values.billing_address_line,
                  country: values.billing_country,
                  state: values.billing_state,
                  city: values.billing_city,
                  pincode: values.billing_pincode,
                  default: false,
                  profile_id: null,
                  customer_profile_id: null,
                }
              : {
                  addressed_to: values.addressed_to,
                  name: values.name,
                  mobile_number: values.mobile_number,
                  address_line: values.address_line,
                  country: values.country,
                  state: values.state,
                  city: values.city,
                  pincode: values.pincode,
                  default: false,
                  profile_id: null,
                  customer_profile_id: null,
                }

            const billingDetails = billingSameAsShipping
              ? {
                  name: values.name,
                  address_line: values.address_line,
                  country: values.country,
                  state: values.state,
                  city: values.city,
                  pincode: values.pincode,
                  default: billingDefaultValue,
                }
              : {
                  name: values.billing_name,
                  address_line: values.billing_address_line,
                  country: values.billing_country,
                  state: values.billing_state,
                  city: values.billing_city,
                  pincode: values.billing_pincode,
                  default: billingDefaultValue,
                }

            if (resolvedOrderId) {
              await dispatchAction(
                updateVspOrder({
                  order_id: resolvedOrderId,
                  shipping_details: shippingDetails,
                  billing_details: billingDetails,
                  status: vspOrderDetails?.status ?? 'DRAFT',
                  patient_id: vspOrderDetails?.patient_id,
                })
              ).unwrap()
            } else {
              const patientId = safeParseInt(vspOrderDetails?.patient_id)
              const serviceProductId = safeParseInt(vspOrderDetails?.service_product_id)

              if (!patientId || !serviceProductId) {
                ErrorToast('Order details missing. Please complete Order Details first.')
                actions.setSubmitting(false)
                return
              }

              const created = await dispatchAction(
                createVspOrder({
                  patient_id: patientId,
                  service_product_id: serviceProductId,
                  oral_surgeon_name: vspOrderDetails?.oral_surgeon_name,
                  orthodontist_name: vspOrderDetails?.orthodontist_name,
                  shipping_details: shippingDetails,
                  billing_details: billingDetails,
                  status: 'DRAFT',
                })
              ).unwrap()

              if (created?.order_id) {
                navigate(`/vsp/create-order/${created.order_id}`, {replace: true})
              }
            }

            dispatchAction(nextStep())
          } catch (error: any) {
            ErrorToast(error?.status?.message ?? error?.message ?? 'Something went wrong')
          } finally {
            actions.setSubmitting(false)
          }
        }}
      >
        {(formik) => (
          <>
            <div className='mx-auto w-full max-w-[980px] space-y-8 pb-28'>
              <BillingSection
                formik={formik}
                dispatch={dispatch}
                billingSameAsShipping={billingSameAsShipping}
                onToggleSame={() => handleToggleBillingSame(formik)}
                countryOptions={billingCountryOptions}
                stateOptions={billingStateOptions}
                cityOptions={billingCityOptions}
                onCountryChange={handleBillingCountryChange}
                onStateChange={handleBillingStateChange}
              />

              <div className='border-t border-gray-200' />

              <ShippingSection
                formik={formik}
                dispatch={dispatch}
                shippingSameAsBilling={shippingSameAsBilling}
                onToggleSame={() => handleToggleShippingSame(formik)}
                countryOptions={shippingCountryOptions}
                stateOptions={shippingStateOptions}
                cityOptions={shippingCityOptions}
                onCountryChange={handleShippingCountryChange}
                onStateChange={handleShippingStateChange}
              />
            </div>

            <Footer onNext={() => formik.handleSubmit()} loadingNext={formik.isSubmitting} />
          </>
        )}
      </Formik>
    </Page>
  )
}
