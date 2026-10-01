import React from 'react'
import StatBox from 'screens/Dashboard/components/StatBox'
import PatientTreatmentStage from './PatientTreatmentStage'
import DropdownIcon from 'assets/icons/DropdownIcon'
import cn from '@utils/cn'
import useDashboard from '@hooks/useDashboard'
import {useNavigate} from 'react-router-dom'
import ActiveNewPracticeOrders from './ActiveNewPracticeOrders'
import NewOrdersManufacture from './NewOrdersManufacture'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
const NO_BORDER_CLASS_NAME = 'border-none md:w-1/3 w-full'
const OrdersCardContent = ({
  count,
  percentage,
}: {
  count?: number | null
  percentage?: number | null
}) => {
  const getTrendIconColor = () => {
    if (percentage) {
      if (percentage > 0) return '#00B383'
      else if (percentage < 0) return '#F45045'
    }
    return '#B0B0B0'
  }

  const getTrendBackgroundColor = () => {
    if (percentage) {
      if (percentage > 0) return 'bg-tertiarySupport'
      else if (percentage < 0) return 'bg-redSupport'
    }
    return 'bg-lightGray'
  }

  const getTextColor = () => {
    if (percentage) return 'text-black'
    return 'text-textColor'
  }

  return (
    <div className='flex gap-3 items-center'>
      <p>{count ?? 0}</p>
      <div
        className={cn('flex px-3 py-2 rounded-3xl items-center gap-2', getTrendBackgroundColor())}
      >
        <DropdownIcon
          color={getTrendIconColor()}
          className={cn(percentage && percentage >= 0 ? 'rotate-180' : '')}
        />
        <p className={cn('text-sm', getTextColor())}>{percentage ? `${percentage} %` : '--'}</p>
      </div>
    </div>
  )
}

const AlignerOrders = () => {
  const {enterprise_professional_plan} = useDashboard()
  const navigate = useNavigate()
  const {permissionChecks} = useFeatureAccess()
  const dashboard = permissionChecks?.dashboard
  return (
    <div className='w-full flex md:flex-row flex-col gap-2'>
      <div className='md:w-[18%] w-full h-full flex md:flex-col gap-3 overflow-x-auto md:overflow-visible'>
        {dashboard?.patientsCount?.isViewable && (
          <StatBox
            title='Patients'
            count={enterprise_professional_plan?.home?.practice_orders?.patients ?? 0}
            className={`md:min-w-full h-full ${NO_BORDER_CLASS_NAME}`}
            onClick={() => {
              const queryParams = new URLSearchParams({
                isPracticeList: 'true',
              }).toString()
              navigate(`/patients-list?${queryParams}`)
            }}
          />
        )}
        {dashboard?.practicesCount?.isViewable && (
          <StatBox
            title='Practices'
            count={enterprise_professional_plan?.home?.practice_orders?.practices ?? 0}
            className={`md:min-w-full h-full  ${NO_BORDER_CLASS_NAME}`}
            onClick={() => {
              navigate(`/practices`)
            }}
          />
        )}
        {dashboard?.ordersReceivedCount?.isViewable && (
          <StatBox
            title='Orders received '
            count={
              <OrdersCardContent
                count={enterprise_professional_plan?.home?.practice_orders?.total}
                percentage={
                  enterprise_professional_plan?.home?.practice_orders?.order_growth_percentage
                }
              />
            }
            onClick={() => {
              navigate(`/aligner-orders`)
            }}
            className='border-none h-full '
          />
        )}
      </div>
      {dashboard?.planningStatus?.isViewable && (
        <div className='md:w-[26%] w-full h-full'>
          <ActiveNewPracticeOrders isWorkspace={false} isEnterprise={true} />
        </div>
      )}
      {dashboard?.manufacturingStatus?.isViewable && (
        <div className='md:w-[28%] w-full h-full'>
          <NewOrdersManufacture isWorkspace={false} isEnterprise={true} />
        </div>
      )}
      {dashboard?.patientTreatmentStage?.isViewable && (
        <div className='md:w-[28%]  w-full h-full'>
          <PatientTreatmentStage />
        </div>
      )}
    </div>
  )
}

export default AlignerOrders
