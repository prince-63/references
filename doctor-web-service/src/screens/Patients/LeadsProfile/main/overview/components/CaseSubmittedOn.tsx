import CaretRightIcon from 'assets/icons/CaretRightIcon'
import When from 'components/when/When'
import moment from 'moment'
import {useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {RootState} from 'redux/store'

const CaseSubmittedOn = () => {
  const navigate = useNavigate()
  const {gettingStartedStepData} = useSelector((state: RootState) => state.GettingStartedOverview)
  const case_submitted_date = moment(gettingStartedStepData?.in_planning?.case_submitted_at).format(
    'DD-MMM-YYYY'
  )
  return (
    <When
      isTrue={
        gettingStartedStepData?.order_status !== null &&
        gettingStartedStepData?.order_status !== 'DRAFT'
      }
    >
      <div className='flex gap-1'>
        <div className='text-base font-semibold'>Case submitted</div>
        <div className='flex gap-2 items-center font-medium text-sm text-textColor'>
          On {case_submitted_date}
        </div>
        <button
          type='button'
          className='text-primaryColor font-semibold  flex gap-2 items-center ml-2'
          onClick={() => {
            navigate(`/orders/${gettingStartedStepData?.order_id}`)
          }}
        >
          View details <CaretRightIcon color='#666666' />
        </button>
      </div>
    </When>
  )
}

export default CaseSubmittedOn
