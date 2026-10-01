import {Card, SectionTitle} from '../ProductionSetupReview'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'

const OrderDetailsCard = () => {
  const {treatmentPlan} = useSelector((state: RootState) => state.leadsProfileTreatmentPlanReducer)
  const {productSelected, productType} = useSelector((state: RootState) => state.productionSetup)

  return (
    <Card>
      <SectionTitle title='Production Type & Product' />
      <div className='text-sm text-slate-700 space-y-1'>
        <div>
          <div className='text-slate-500'>Order ID</div>
          <div className='font-medium'>{treatmentPlan?.order_id}</div>
        </div>
        <div>
          <div className='text-slate-500'>Production Type</div>
          <div className='font-medium'>
            {productType === 'IN_HOUSE' ? 'In House' : 'Outsourced to Lab'}
          </div>
        </div>
        <div>
          <div className='text-slate-500'>Lab name</div>
          <div className='font-medium'>{productSelected?.added_by_user_name}</div>
        </div>
        <div>
          <div className='text-slate-500'>Product</div>
          <div className='font-medium'>{productSelected?.product_name}</div>
        </div>
      </div>
    </Card>
  )
}

export default OrderDetailsCard
