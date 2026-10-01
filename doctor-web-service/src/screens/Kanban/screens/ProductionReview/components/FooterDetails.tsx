// screens/Kanban/screens/ProductionReview/FooterDetails.tsx
import {Card, SectionTitle} from '../ProductionSetupReview'
import {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import clsx from 'clsx'
import ChecklistWithProgress from 'screens/PatientDetailsOverview.tsx/components/ChecklistWithProgress'
import useAllUserPlan from '@hooks/useAllUserPlan'

const FooterDetails = () => {
  const {isEnterprisePlanUser, isPractice} = useAllUserPlan()
  const {instructions, productType, shipping} = useSelector(
    (state: RootState) => state.productionSetup
  )
  const hasShipping =
    !!shipping &&
    typeof shipping === 'object' &&
    (shipping.addressed_to ||
      shipping.name ||
      shipping.address_line ||
      shipping.city ||
      shipping.state ||
      shipping.country ||
      shipping.pincode)

  const isOutsource = productType === 'OUTSOURCE'

  return (
    <div className={clsx('grid gap-5', isOutsource ? 'md:grid-cols-2 grid-cols-1' : 'grid-cols-1')}>
      {/* Left (or full-width) Card */}
      <Card className={clsx(!isOutsource && 'md:col-span-2')}>
        <SectionTitle title='Production Instructions' />
        <div className='rounded-lg border bg-white mb-3'>
          {/* Render checklist in VIEW-ONLY mode here */}
          <ChecklistWithProgress readOnly />
        </div>

        <div className='space-y-2'>
          <SectionTitle title='Production Comment' />
          <div className='bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm text-slate-700'>
            {instructions ? (
              <span className='font-medium text-slate-700'>{instructions}</span>
            ) : (
              <span className='text-slate-400 italic'>No comments added</span>
            )}
          </div>
        </div>
      </Card>

      {/* Right column: Shipping (only when outsource/enterprise/practice) */}
      {(isOutsource || isEnterprisePlanUser || isPractice) && (
        <Card>
          <SectionTitle title='Shipping Address' />
          {hasShipping ? (
            <div className='text-sm text-slate-700 space-y-1'>
               <div className='font-medium'>{shipping?.addressed_to}</div>
              <div className='font-medium'>{shipping?.name}</div>
              <div>{shipping?.mobile_number}</div>
              <div>{shipping?.address_line}</div>
              <div>{[shipping?.city, shipping?.state].filter(Boolean).join(', ')}</div>
              <div>{shipping?.country}</div>
              <div>{shipping?.pincode}</div>
            </div>
          ) : (
            <div className='text-sm text-slate-500'>No shipping address added.</div>
          )}
        </Card>
      )}
    </div>
  )
}

export default FooterDetails
