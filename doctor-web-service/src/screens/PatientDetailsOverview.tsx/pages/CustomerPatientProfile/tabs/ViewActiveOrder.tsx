import useDispatchAction from '@hooks/useDispatchAction'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect} from 'react'
import {useSearchParams} from 'react-router-dom'
import {getOrderDetails} from 'redux/Slices/AppSlice/orders/orders.slice'
import userOrderDetails from 'screens/Orders/hooks/userOrderDetails'
import {safeParseInt} from 'utils/ConstFunctions'
import cn from '@utils/cn'
import {IOrder} from 'screens/Orders/orders.types'
import TabSectionCard from '../components/TabSectionCard'
import {Layers, User} from 'lucide-react'
import {PatientDetails} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'

const ViewActiveOrder = () => {
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const order_id = searchParams.get('order_id')
  const {order, loadingOrder} = userOrderDetails()

  useEffect(() => {
    if (!order_id) return
    dispatchAction(
      getOrderDetails({
        doctor_id: safeParseInt(userId),
        order_id: order_id,
      })
    )
  }, [order_id])

  return (
    <TabSectionCard title='Case Details'>
      <Spin indicator={<Spinner loading />} spinning={loadingOrder}>
        {order ? <OrderDetails order={order} /> : <div>No order present</div>}
      </Spin>
    </TabSectionCard>
  )
}

export default ViewActiveOrder

const OrderDetails = ({order}: {order: IOrder}) => {
  return (
    <div className='flex-1 overflow-y-auto flex flex-col gap-4 min-w-3/5'>
      <PatientDetailsCard patient={order?.patient_details} />
      <OrderDetailsCard order={order} />
    </div>
  )
}
const PatientDetailsCard = ({patient}: {patient?: PatientDetails}) => (
  <InfoCard icon={User} title='Patient details'>
    <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
      <LabelValue label='Name' value={patient?.first_name + ' ' + patient?.last_name} />
      <LabelValue label='Gender' value={patient?.gender} />
      <LabelValue label='Age' value={patient?.age} />
      <LabelValue
        label='Patient ID'
        value={patient?.customer_mapped_id ? `#${patient.customer_mapped_id}` : '-'}
        valueClassName='text-indigo-600'
      />
    </div>
  </InfoCard>
)

const OrderDetailsCard = ({order}: {order?: IOrder}) => (
  <InfoCard icon={Layers} title='Order details'>
    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
      <LabelValue label='Order ID' value={`#${order?.order_id}`} />
      <LabelValue
        label='Lab Name'
        value={
          order?.service_products?.org_brand_name ?? order?.service_products?.added_by_user_name
        }
      />
      <LabelValue label='Selected product' value={order?.product_name} />
    </div>
  </InfoCard>
)

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
