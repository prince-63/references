import React, {CSSProperties} from 'react'
import {Steps, ConfigProvider} from 'antd'
import dayjs from 'dayjs'
import {IOrder} from '../orders.types'
import {useSearchParams} from 'react-router-dom'
import orderStatusConstants from '@constants/orderStatus.constants'
import useAllUserPlan from '@hooks/useAllUserPlan'

const Title = ({children}: {children: React.ReactNode}) => {
  return <p className='font-medium'>{children}</p>
}

const OrderStatusSteps = ({order}: {order?: IOrder | null}) => {
  const {
    isCustomer,
    isDesignLabUser,
    isOrganization,
    isEnterprisePlanUser,
    isVendor,
    isPractice,
    isAlignerCompanyOrg,
  } = useAllUserPlan()
  const [searchParams] = useSearchParams()
  const isCustomerOrder = searchParams.get('isCustomerOrder') === 'true'
  const isPurchaseOrder = order?.is_purchase_order
  const is_customer_order = order?.is_customer_order

  const isManufacturingStepper =
    (isPractice && !is_customer_order) ||
    (isAlignerCompanyOrg && !isPurchaseOrder && !is_customer_order)

  const baseAlignerSteps = [
    {key: 'ORDERED', title: 'Ordered'},
    {key: 'IN_PROGRESS', title: 'Planning'},
    {key: 'MANUFACTURING', title: 'Manufacturing'},
    {key: 'COMPLETED', title: 'Completed'},
  ]

  const defaultSteps = [
    {key: 'ORDERED', title: 'Ordered'},
    {key: 'IN_PROGRESS', title: 'In Progress'},
    {key: 'IN_REVIEW', title: 'In Review'},
    {key: 'APPROVED', title: 'Approved'},
    {key: 'STL_FILES_REQUESTED', title: 'STL Files Requested'},
    {key: 'STL_FILES_UPLOADED', title: 'STL Files Uploaded'},
    {key: 'COMPLETED', title: 'Completed'},
  ]

  const filteredSteps = defaultSteps.filter((step) => {
    if (step.key === 'STL_FILES_REQUESTED' || step.key === 'STL_FILES_UPLOADED') {
      return (
        isCustomer ||
        (!isEnterprisePlanUser && isDesignLabUser) ||
        isPurchaseOrder ||
        ((isOrganization || isEnterprisePlanUser) && (isPurchaseOrder || isCustomerOrder)) ||
        isVendor
      )
    }
    return true
  })

  const updatedSteps = filteredSteps.map((step) => {
    if (order?.status === 'RE_PLAN' && step.key === 'APPROVED') {
      return {...step, key: 'RE_PLAN', title: 'Re-plan'}
    }
    return step
  })

  // Set steps based on isPurchaseOrder
  const selectedSteps = isManufacturingStepper ? baseAlignerSteps : updatedSteps

  let currentStepIndex = 0

  if (!isManufacturingStepper) {
    if (order?.status === orderStatusConstants.NEED_MORE_INFO) {
      currentStepIndex = 1
    } else {
      currentStepIndex = selectedSteps.findIndex((step) => step.key === order?.status)
    }
  } else {
    if (order?.status === orderStatusConstants.NEED_MORE_INFO) {
      currentStepIndex = 1
    } else if (
      order?.manufacturing_status === 'DELIVERED' &&
      order?.unprocessed_aligner_details?.total_aligners === 0
    ) {
      currentStepIndex = 3
    } else if (order?.status === 'COMPLETED') {
      currentStepIndex = order?.manufacturing_status === null ? 1 : 2
    } else if (['APPROVED', 'IN_REVIEW', 'IN_PROGRESS'].includes(order?.status || '')) {
      currentStepIndex = 1
    } else {
      currentStepIndex = 0
    }
  }

  const getTitle = (index: number) =>
    selectedSteps[index].key === 'IN_PROGRESS' &&
    order?.status === orderStatusConstants.NEED_MORE_INFO
      ? 'Need more info'
      : selectedSteps[index].title

  const getDescription = (index: number) => {
    if (isPurchaseOrder || is_customer_order) {
      if (index === 0) {
        return `On ${dayjs(order?.order_details?.created_at).format('DD-MMM-YYYY')}`
      }
      if (index > currentStepIndex) {
        return 'Pending'
      }
    } else {
      if (index === 0) {
        return `On ${dayjs(order?.order_details?.created_at).format('DD-MMM-YYYY')}`
      }
      if (index === 1 && order?.status === 'COMPLETED') {
        return 'Finalized'
      }
      if (
        index === 2 &&
        (order?.manufacturing_status === 'COMPLETED' || order?.manufacturing_status === 'SHIPPED')
      ) {
        return `${order?.unprocessed_aligner_details?.total_aligners} pending`
      }
      if (index > currentStepIndex) {
        return 'Pending'
      }
    }
    return ''
  }

  const stepContainerStyle: CSSProperties = {
    ['--ant-primary-color' as any]: '#00B383',
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#00B383',
        },
      }}
    >
      <div className='overflow-x-auto hiddenScrollbar'>
        <Steps
          current={currentStepIndex}
          responsive={false}
          className='min-w-[350vw] md:min-w-full'
          style={stepContainerStyle}
        >
          {selectedSteps.map((step, index) => (
            <Steps.Step
              key={step.key}
              title={<Title>{getTitle(index)}</Title>}
              description={getDescription(index)}
              status={step.key === 'RE_PLAN' && order?.status === 'RE_PLAN' ? 'error' : undefined}
            />
          ))}
        </Steps>
      </div>
    </ConfigProvider>
  )
}

export default OrderStatusSteps
