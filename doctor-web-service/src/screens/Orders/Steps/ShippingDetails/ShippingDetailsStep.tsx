// ShippingDetailsStep.tsx
import Page from 'components/page/Page'
import ShippingForm from './components/ShippingForm'
import {useState} from 'react'
import StepCard from '../../components/StepCard'
import {Truck} from 'lucide-react'

const ShippingDetailsStep = () => {
  const [loading, setLoading] = useState<boolean>(false)

  return (
    <Page title='' loading={loading} containerClassName='min-h-full'>
      <StepCard
        title='Shipping Details'
        subtitle='Where should we deliver the order?'
        icon={<Truck className='w-5 h-5' />}
        className='md:w-4/5 lg:w-3/5'
      >
        <ShippingForm setLoading={setLoading} />
      </StepCard>
    </Page>
  )
}

export default ShippingDetailsStep
