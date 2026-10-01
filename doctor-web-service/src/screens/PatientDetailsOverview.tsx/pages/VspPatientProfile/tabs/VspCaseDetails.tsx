import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {useCallback, useEffect, useState} from 'react'
import {useSearchParams} from 'react-router-dom'
import cn from '@utils/cn'
import {Layers, User, MapPin} from 'lucide-react'
import TabSectionCard from '../../CustomerPatientProfile/components/TabSectionCard'
import apiHelper from '@utils/apiHelper'
import HttpMethod from '@constants/httpMethods.constants'
import {BASE_APP_PATIENT_URL} from 'redux/Endpoints/apiEndpoints'
import EmptyState from '../../CustomerPatientProfile/components/EmptyState'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

type VspOrderResponse = {
  order_id: string
  patient_id: number
  patient_name: string
  created_by_user_profile_id: number
  assigned_to_user_profile_id: number
  service_product_id: number
  service_product_name: string
  status: string
  oral_surgeon_name: string
  orthodontist_name: string
  notes_for_lab: string
  billing_details?: {
    name?: string
    address_line?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
  }
  shipping_details?: {
    name?: string
    mobile_number?: string
    address_line_1?: string
    address_line_2?: string
    city?: string
    state?: string
    zip_code?: string
    country?: string
    same_as_billing?: boolean
  }
  case_records?: any[]
  prescriptions?: any[]
  treatment_plans?: any[]
  created_at?: string
  updated_at?: string
}

const VspCaseDetails = () => {
  const [searchParams] = useSearchParams()
  const order_id = searchParams.get('order_id')
  const [order, setOrder] = useState<VspOrderResponse | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchOrder = useCallback(async () => {
    if (!order_id) return
    setLoading(true)
    try {
      const url = `${BASE_APP_PATIENT_URL}/patient/v1/vsp/orders/${order_id}`
      const response = await apiHelper(url, HttpMethod.GET, undefined, false)
      setOrder(response?.data ?? null)
    } catch (error) {
      console.error('Failed to fetch VSP order details', error)
    } finally {
      setLoading(false)
    }
  }, [order_id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return (
    <TabSectionCard title='Case Summary'>
      <Spin indicator={<Spinner loading />} spinning={loading}>
        {order ? (
          <OrderDetails order={order} />
        ) : (
          <EmptyState
            title='No Order Available'
            subTitle='There are no details available for this case.'
          />
        )}
      </Spin>
    </TabSectionCard>
  )
}

export default VspCaseDetails

const OrderDetails = ({order}: {order: VspOrderResponse}) => {
  return (
    <div className='flex-1 overflow-y-auto flex flex-col gap-4 min-w-3/5'>
      <PatientDetailsCard order={order} />
      <OrderDetailsCard order={order} />
      <BillingShippingCard order={order} />
    </div>
  )
}

const PatientDetailsCard = ({order}: {order: VspOrderResponse}) => {
  const {patientData} = useSelector((state: RootState) => state.customerPatientProfile)
  return (
    <InfoCard icon={User} title='Patient details'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
        <LabelValue label='Name' value={order.patient_name} />
        <LabelValue label='Gender' value={patientData?.gender ?? '-'} />
        <LabelValue label='Age' value={patientData?.age ?? '-'} />
        <LabelValue
          label='Patient ID'
          value={patientData.customer_mapped_id ? `#${patientData.customer_mapped_id}` : '-'}
          valueClassName='text-indigo-600'
        />
      </div>
    </InfoCard>
  )
}

const OrderDetailsCard = ({order}: {order: VspOrderResponse}) => (
  <InfoCard icon={Layers} title='Order details'>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
      <LabelValue label='Selected Product' value={order.service_product_name} />
      <LabelValue label='Oral Surgeon' value={order.oral_surgeon_name} />
      <LabelValue label='Orthodontist' value={order.orthodontist_name} />
    </div>
  </InfoCard>
)

const BillingShippingCard = ({order}: {order: VspOrderResponse}) => {
  const billing = order.billing_details
  const shipping = order.shipping_details
  const isSameAsBilling = shipping?.same_as_billing

  const formatAddress = (addr?: VspOrderResponse['billing_details']) => {
    if (!addr) return null
    const parts = [
      addr.addressed_to,
      addr.mobile_number,
      addr.name,
      addr.address_line,
      [addr.city, addr.state, addr.zip_code].filter(Boolean).join(', '),
      addr.country,
    ].filter(Boolean)
    return parts
  }

  const billingLines = formatAddress(billing)
  const shippingLines = formatAddress(shipping)

  return (
    <InfoCard icon={MapPin} title='Billing & Shipping'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div className='min-w-0'>
          <div className='text-[11px] tracking-wider text-gray-400 font-semibold uppercase mb-2'>
            Billing Address
          </div>
          {billingLines && billingLines.length > 0 ? (
            <div className='text-sm font-medium text-gray-900 space-y-0.5'>
              {billingLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            <div className='text-sm text-gray-400'>-</div>
          )}
        </div>

        <div className='min-w-0'>
          <div className='text-[11px] tracking-wider text-gray-400 font-semibold uppercase mb-2'>
            Shipping Address
          </div>
          {isSameAsBilling ? (
            <div className='text-sm font-medium text-indigo-600 underline'>
              Same as billing address
            </div>
          ) : shippingLines && shippingLines.length > 0 ? (
            <div className='text-sm font-medium text-gray-900 space-y-0.5'>
              {shippingLines.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ) : (
            <div className='text-sm text-gray-400'>-</div>
          )}
        </div>
      </div>
    </InfoCard>
  )
}

const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: React.ComponentType<{className?: string}>
  title: string
  children: React.ReactNode
}) => (
  <div className='bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden'>
    <SectionHeader icon={icon} title={title} />
    <div className='h-px bg-gray-100' />
    <div className='px-5 py-4'>{children}</div>
  </div>
)

const LabelValue = ({
  label,
  value,
  valueClassName,
}: {
  label: string
  value?: React.ReactNode
  valueClassName?: string
}) => (
  <div className='min-w-0'>
    <div className='text-[11px] tracking-wider text-gray-400 font-semibold uppercase'>{label}</div>
    <div className={cn('mt-1 text-sm font-semibold text-gray-900 truncate', valueClassName)}>
      {value !== null && value !== '' ? value : '-'}
    </div>
  </div>
)

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{className?: string}>
  title: string
}) => (
  <div className='flex items-center gap-2 px-5 py-3'>
    <div className='w-7 h-7 rounded-full bg-primarySupport flex items-center justify-center'>
      <Icon className='w-4 h-4 text-primaryColor' />
    </div>
    <div className='text-sm font-semibold text-textColor'>{title}</div>
  </div>
)
