import {useMemo, useState} from 'react'
import {CalendarCheck, Layers, Package, Truck, CheckCircle2, Box, MapPin} from 'lucide-react'
import cn from '@utils/cn'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {URL_VSP_PRODUCTION_STATUS} from 'redux/Endpoints/apiEndpoints'
import {logToConsole} from '@utils/logToConsole'
import VspProductionShippingForm from './VspProductionShippingForm'

type ProductionStatus = 'ORDER_CREATED' | 'IN_PRODUCTION' | 'PACKAGED' | 'SHIPPED' | 'DELIVERED'

interface StlFile {
  file_id: number
  file_name: string
  url: string
}

interface Shipping {
  id: string
  courier_service?: string
  tracking_number?: string
  tracking_link?: string
  dispatch_date?: string
  shipping_date?: string
  tentative_delivery_date?: string
}

export interface ProductionOrderData {
  production_id: string
  vsp_order_id: string
  status: ProductionStatus
  intermediate_splint_qty: number
  final_splint_qty: number
  dental_arches_upper_qty: number
  dental_arches_lower_qty: number
  others_custom_qty: number
  total_items: number
  production_notes: string
  stl_files: StlFile[]
  shipping: Shipping | null
  created_at: string
  updated_at: string
}

interface ShippingAddress {
  addressed_to?: string
  name?: string
  address_line_1?: string
  address_line_2?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
}

export interface VspProductionOrderDetails {
  order_id: string
  patient_id: number
  status?: string
  billing_details?: {
    name?: string
    address_line?: string
    city?: string
    state?: string
    country?: string
    pincode?: string
  } | null
  shipping_details?: {
    addressed_to?: string
    name?: string
    address_line?: string
    city?: string
    state?: string
    country?: string
    pincode?: string
    default?: boolean
    mobile_number?: string
  } | null
  shipping_address?: ShippingAddress | null
}

interface VspProductionTrackingProps {
  data: ProductionOrderData
  orderDetails?: VspProductionOrderDetails | null
  shippingAddress?: ShippingAddress | null
  onStatusUpdate: () => void
}

const STEPS: {key: ProductionStatus; label: string}[] = [
  {key: 'ORDER_CREATED', label: 'ORDER CREATED'},
  {key: 'IN_PRODUCTION', label: 'IN PRODUCTION'},
  {key: 'PACKAGED', label: 'PACKAGED'},
  {key: 'SHIPPED', label: 'SHIPPED'},
  {key: 'DELIVERED', label: 'DELIVERED'},
]

const STEP_ICONS = [CalendarCheck, Layers, Package, Truck, CheckCircle2]

const getStepIndex = (status: ProductionStatus) => STEPS.findIndex((s) => s.key === status)

const formatDateTime = (value?: string | null) => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const getAddressLines = (
  address?:
    | {
        addressed_to?: string
        name?: string
        address_line?: string
        city?: string
        state?: string
        pincode?: string
        country?: string
      }
    | {
        addressed_to?: string
        mobile_number?: string
        name?: string
        address_line_1?: string
        address_line_2?: string
        city?: string
        state?: string
        zip_code?: string
        country?: string
      }
    | null
) => {
  if (!address) return []

  const streetLine =
    'address_line' in address
      ? address.address_line
      : [address.address_line_1, address.address_line_2].filter(Boolean).join(', ')

  const postalCode = 'pincode' in address ? address.pincode : address.zip_code

  const mobileNumber = 'mobile_number' in address ? address.mobile_number : undefined

  return [
    address.addressed_to,
    mobileNumber, // ✅ added after addressed_to
    address.name,
    streetLine,
    [address.city, address.state, postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean) as string[]
}

const VspProductionTracking = ({
  data,
  orderDetails,
  shippingAddress,
  onStatusUpdate,
}: VspProductionTrackingProps) => {
  const currentIndex = getStepIndex(data.status)
  const resolvedShippingAddress = useMemo(() => {
    if (!orderDetails?.shipping_details) return shippingAddress ?? null

    return {
      addressed_to: orderDetails.shipping_details.addressed_to,
      mobile_number: orderDetails.shipping_details.mobile_number,
      name: shippingAddress?.name ?? orderDetails.shipping_details.name,
      address_line_1: shippingAddress?.address_line_1 ?? orderDetails.shipping_details.address_line,
      address_line_2: shippingAddress?.address_line_2,
      city: shippingAddress?.city ?? orderDetails.shipping_details.city,
      state: shippingAddress?.state ?? orderDetails.shipping_details.state,
      zip_code: shippingAddress?.zip_code ?? orderDetails.shipping_details.pincode,
      country: shippingAddress?.country ?? orderDetails.shipping_details.country,
    }
  }, [orderDetails?.shipping_details, shippingAddress])

  return (
    <div className='flex flex-col gap-6'>
      {/* Stepper */}
      <div className='rounded-2xl border border-gray-200 bg-white px-8 py-6'>
        <div className='flex items-start justify-between gap-4'>
          {STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i]
            const isCompleted = i <= currentIndex
            const isActive = i === currentIndex

            return (
              <div key={step.key} className='relative flex flex-1 flex-col items-center gap-2'>
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full transition-all',
                    isCompleted
                      ? 'bg-[#4A62E8] text-white'
                      : 'border-2 border-gray-200 bg-white text-gray-400'
                  )}
                >
                  <Icon className='h-5 w-5' />
                </div>
                <span
                  className={cn(
                    'text-center text-[11px] font-semibold tracking-wide',
                    isActive ? 'text-[#4A62E8]' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  )}
                >
                  {step.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-[calc(50%+2rem)] right-[calc(-50%+2rem)] top-6 h-[2px] -translate-y-1/2',
                      i < currentIndex ? 'bg-[#4A62E8]' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className='flex gap-6'>
        {/* Production Actions */}
        <div className='flex-1 rounded-2xl border border-gray-200 bg-white p-6'>
          <h2 className='mb-1 text-lg font-bold text-gray-900'>Production Actions</h2>
          <div className='mb-6 h-px bg-gray-200' />

          <ProductionActionContent data={data} onStatusUpdate={onStatusUpdate} />
          <ProductionDetailsCard data={data} />
        </div>

        {/* Order Summary Sidebar */}
        <div className='w-[280px] shrink-0 flex flex-col gap-5'>
          <OrderSummary data={data} />
          <AddressDetailsCard
            billingDetails={orderDetails?.billing_details}
            shippingAddress={resolvedShippingAddress}
          />
        </div>
      </div>
    </div>
  )
}

export default VspProductionTracking

/* ─── Production Action Content by Status ─── */

function ProductionActionContent({
  data,
  onStatusUpdate,
}: {
  data: ProductionOrderData
  onStatusUpdate: () => void
}) {
  switch (data.status) {
    case 'ORDER_CREATED':
    case 'IN_PRODUCTION':
      return <InProductionAction data={data} onStatusUpdate={onStatusUpdate} />
    case 'PACKAGED':
      return <PackagedAction data={data} onStatusUpdate={onStatusUpdate} />
    case 'SHIPPED':
      return <ShippedAction data={data} onStatusUpdate={onStatusUpdate} />
    case 'DELIVERED':
      return <DeliveredAction />
    default:
      return null
  }
}

/* ─── IN_PRODUCTION ─── */

function InProductionAction({
  data,
  onStatusUpdate,
}: {
  data: ProductionOrderData
  onStatusUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleMarkAsPackaged = async () => {
    setLoading(true)
    try {
      await apiHelper(
        URL_VSP_PRODUCTION_STATUS,
        HttpMethod.PATCH,
        {production_id: data.production_id, status: 'PACKAGED'},
        true
      )
      onStatusUpdate()
    } catch (error) {
      logToConsole('Failed to mark as packaged', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center py-8'>
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF]'>
        <Box className='h-7 w-7 text-[#4A62E8]' strokeWidth={1.5} />
      </div>
      <h3 className='mb-2 text-lg font-semibold text-gray-900'>Splints are being manufactured</h3>
      <p className='mb-8 max-w-sm text-center text-sm text-gray-500'>
        Once the 3D printing and quality checks are complete, mark the order as packaged.
      </p>
      <button
        type='button'
        onClick={handleMarkAsPackaged}
        disabled={loading}
        className='inline-flex h-11 items-center gap-2 rounded-xl bg-[#4A62E8] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3E57DD] disabled:opacity-50'
      >
        <Package className='h-4 w-4' />
        Mark as Packaged
      </button>
    </div>
  )
}

/* ─── PACKAGED ─── */

function PackagedAction({
  data,
  onStatusUpdate,
}: {
  data: ProductionOrderData
  onStatusUpdate: () => void
}) {
  const [showShippingForm, setShowShippingForm] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleDirectDelivery = async () => {
    setLoading(true)
    try {
      await apiHelper(
        URL_VSP_PRODUCTION_STATUS,
        HttpMethod.PATCH,
        {production_id: data.production_id, status: 'DELIVERED'},
        true
      )
      onStatusUpdate()
    } catch (error) {
      logToConsole('Failed to mark as delivered', error)
    } finally {
      setLoading(false)
    }
  }

  if (showShippingForm) {
    return (
      <VspProductionShippingForm
        data={data}
        onCancel={() => setShowShippingForm(false)}
        onStatusUpdate={onStatusUpdate}
      />
    )
  }

  return (
    <div className='flex flex-col items-center py-8'>
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF]'>
        <Truck className='h-7 w-7 text-[#4A62E8]' strokeWidth={1.5} />
      </div>
      <h3 className='mb-2 text-lg font-semibold text-gray-900'>Order Packaged &amp; Ready</h3>
      <p className='mb-8 max-w-sm text-center text-sm text-gray-500'>
        The items are ready for dispatch. Please add shipping details or mark directly as delivered
        if handed over.
      </p>
      <div className='flex gap-3'>
        <button
          type='button'
          onClick={() => setShowShippingForm(true)}
          className='inline-flex h-11 items-center gap-2 rounded-xl bg-[#4A62E8] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3E57DD]'
        >
          <Truck className='h-4 w-4' />
          Add Shipping Details
        </button>
        <button
          type='button'
          onClick={handleDirectDelivery}
          disabled={loading}
          className='inline-flex h-11 items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50'
        >
          <CheckCircle2 className='h-4 w-4' />
          Direct Delivery
        </button>
      </div>
    </div>
  )
}

/* ─── SHIPPED ─── */

function ShippedAction({
  data,
  onStatusUpdate,
}: {
  data: ProductionOrderData
  onStatusUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const shipping = data.shipping

  const handleConfirmDelivery = async () => {
    setLoading(true)
    try {
      await apiHelper(
        URL_VSP_PRODUCTION_STATUS,
        HttpMethod.PATCH,
        {production_id: data.production_id, status: 'DELIVERED'},
        true
      )
      onStatusUpdate()
    } catch (error) {
      logToConsole('Failed to confirm delivery', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex flex-col items-center py-6'>
      {shipping && (
        <div className='mb-6 w-full max-w-md rounded-xl border border-[#4A62E8]/20 bg-[#FAFBFF] p-5'>
          <div className='mb-3 flex items-center gap-2'>
            <Truck className='h-5 w-5 text-[#4A62E8]' />
            <h4 className='text-sm font-semibold text-gray-900'>Package is in transit</h4>
          </div>
          <div className='grid grid-cols-2 gap-x-8 gap-y-2'>
            {shipping.tracking_number && (
              <div>
                <p className='text-[11px] text-gray-400'>Tracking ID</p>
                <p className='text-sm font-bold text-gray-900'>{shipping.tracking_number}</p>
              </div>
            )}
            {shipping.tracking_link && (
              <div>
                <p className='text-[11px] text-gray-400'>Tracking Link</p>
                <a
                  href={
                    shipping.tracking_link.startsWith('http')
                      ? shipping.tracking_link
                      : `https://${shipping.tracking_link}`
                  }
                  target='_blank'
                  rel='noreferrer'
                  className='text-sm font-bold text-[#4A62E8] underline'
                >
                  Open Link
                </a>
              </div>
            )}
            {(shipping.shipping_date || shipping.dispatch_date) && (
              <div className='col-span-2 mt-1'>
                <p className='text-[11px] text-gray-400'>Dispatched On</p>
                <p className='text-sm font-bold text-gray-900'>
                  {shipping.shipping_date || shipping.dispatch_date}
                </p>
              </div>
            )}
            {shipping.tentative_delivery_date && (
              <div className='col-span-2'>
                <p className='text-[11px] text-gray-400'>Tentative Delivery</p>
                <p className='text-sm font-bold text-gray-900'>
                  {shipping.tentative_delivery_date}
                </p>
              </div>
            )}
            {!shipping.tracking_number &&
              !shipping.tracking_link &&
              !shipping.shipping_date &&
              !shipping.dispatch_date &&
              !shipping.tentative_delivery_date &&
              shipping.courier_service && (
                <div>
                  <p className='text-[11px] text-gray-400'>Courier</p>
                  <p className='text-sm font-bold text-gray-900'>{shipping.courier_service}</p>
                </div>
              )}
          </div>
        </div>
      )}

      <p className='mb-4 text-sm text-gray-500'>
        Once the doctor confirms receipt, complete the case.
      </p>
      <button
        type='button'
        onClick={handleConfirmDelivery}
        disabled={loading}
        className='inline-flex h-11 items-center gap-2 rounded-xl bg-[#16a34a] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#15803d] disabled:opacity-50'
      >
        <CheckCircle2 className='h-4 w-4' />
        Confirm Delivery &amp; Close Case
      </button>
    </div>
  )
}

/* ─── DELIVERED ─── */

function DeliveredAction() {
  return (
    <div className='flex flex-col items-center py-8'>
      <div className='mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7]'>
        <CheckCircle2 className='h-8 w-8 text-[#16a34a]' />
      </div>
      <h3 className='mb-2 text-lg font-bold text-gray-900'>Order Delivered</h3>
      <p className='max-w-sm text-center text-sm text-gray-500'>
        The surgical splints have reached the practice. This VSP case is now successfully closed.
      </p>
    </div>
  )
}

/* ─── Order Summary Sidebar ─── */

function OrderSummary({data}: {data: ProductionOrderData}) {
  const items = [
    {label: 'Intermediate Splint', qty: data.intermediate_splint_qty},
    {label: 'Final Splint', qty: data.final_splint_qty},
    {label: 'Dental Arches (Upper)', qty: data.dental_arches_upper_qty},
    {label: 'Dental Arches (Lower)', qty: data.dental_arches_lower_qty},
    {label: 'Others / Custom', qty: data.others_custom_qty},
  ].filter((item) => item.qty > 0)

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5'>
      <h3 className='mb-3 text-xs font-bold uppercase tracking-wider text-gray-500'>
        Order Summary
      </h3>

      <div className='rounded-xl border border-gray-200'>
        {items.map((item, i) => (
          <div
            key={item.label}
            className={cn(
              'flex items-center justify-between px-4 py-2.5',
              i < items.length - 1 && 'border-b border-gray-100'
            )}
          >
            <span className='text-sm text-gray-600'>{item.label}</span>
            <span className='text-sm font-semibold text-[#4A62E8]'>{item.qty}</span>
          </div>
        ))}
        <div className='flex items-center justify-between border-t border-gray-200 bg-gray-50/60 px-4 py-2.5'>
          <span className='text-sm font-bold text-gray-800'>Total Items</span>
          <span className='text-sm font-bold text-[#4A62E8]'>{data.total_items}</span>
        </div>
      </div>
    </div>
  )
}

function AddressDetailsCard({
  billingDetails,
  shippingAddress,
}: {
  billingDetails?: VspProductionOrderDetails['billing_details']
  shippingAddress?: ShippingAddress | null
}) {
  const billingLines = getAddressLines(billingDetails)
  const shippingLines = getAddressLines(shippingAddress)

  if (!billingLines.length && !shippingLines.length) return null

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5'>
      <div className='mb-4 flex items-center gap-2'>
        <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primarySupport'>
          <MapPin className='h-4 w-4 text-primaryColor' />
        </div>
        <h3 className='text-sm font-semibold text-textColor'>Billing & Shipping</h3>
      </div>

      <div className='space-y-4'>
        {billingLines.length > 0 && (
          <div>
            <h4 className='mb-2 text-xs font-bold uppercase tracking-wider text-gray-500'>
              Billing Address
            </h4>
            <div className='space-y-1 text-sm leading-relaxed text-gray-700'>
              {billingLines.map((line) => (
                <p key={line} className='break-words'>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {shippingLines.length > 0 && (
          <div className={cn(billingLines.length > 0 && 'border-t border-gray-100 pt-4')}>
            <h4 className='mb-2 text-xs font-bold uppercase tracking-wider text-gray-500'>
              Shipping Address
            </h4>
            <div className='space-y-1 text-sm leading-relaxed text-gray-700'>
              {shippingLines.map((line) => (
                <p key={line} className='break-words'>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductionDetailsCard({data}: {data: ProductionOrderData}) {
  const detailItems = [
    {label: 'Production ID', value: data.production_id},
    {label: 'VSP Order ID', value: data.vsp_order_id},
    {label: 'Status', value: data.status?.replaceAll('_', ' ')},
    {label: 'Created At', value: formatDateTime(data.created_at)},
    {label: 'Updated At', value: formatDateTime(data.updated_at)},
    {label: 'Production Notes', value: data.production_notes},
  ].filter((item) => item.value)

  const stlFiles = Array.isArray(data.stl_files) ? data.stl_files.filter((file) => file?.url) : []

  if (!detailItems.length && !stlFiles.length) return null

  return (
    <div className='mt-6 rounded-2xl border border-gray-200 bg-gray-50/40'>
      <div className='border-b border-gray-200 px-5 py-4'>
        <h3 className='text-base font-semibold text-gray-900'>Production Details</h3>
      </div>

      <div className='space-y-5 px-5 py-4'>
        {detailItems.length > 0 && (
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {detailItems.map((item) => (
              <DetailLabelValue key={item.label} label={item.label} value={item.value} />
            ))}
          </div>
        )}

        {stlFiles.length > 0 && (
          <div>
            <div className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
              STL Files
            </div>
            <div className='space-y-2'>
              {stlFiles.map((file) => (
                <a
                  key={file.file_id}
                  href={file.url}
                  target='_blank'
                  rel='noreferrer'
                  className='block rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-primaryColor transition hover:border-primaryColor/40'
                >
                  {file.file_name || file.url}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailLabelValue({label, value}: {label: string; value?: React.ReactNode}) {
  if (!value) return null

  return (
    <div className='min-w-0'>
      <div className='text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
        {label}
      </div>
      <div className='mt-1 break-words text-sm font-semibold text-gray-900'>{value}</div>
    </div>
  )
}
