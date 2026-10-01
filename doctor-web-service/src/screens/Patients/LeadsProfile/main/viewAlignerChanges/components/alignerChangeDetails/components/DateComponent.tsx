import actionTypes from '@constants/actionTypes'
import ActionListOptions from '@staticData/ActionListOptions'
import TimeIcon from 'assets/icons/TimeIcon'
import moment from 'moment'

const DateComponent = ({date}: {date: string}) => {
  const Icon = ActionListOptions[actionTypes.UPDATE_START_DATE].icon

  return (
    <div className='flex gap-3 font-medium'>
      <div className='flex gap-2 items-center text-sm '>
        <Icon color={'#666666'} width='16' height='16' />
        <p>{moment(date).format('DD-MMM-YYYY')}</p>
        <div />

        <div className='flex gap-2 items-center text-sm '>
          <TimeIcon color={'#666666'} width='16' height='16' />
          <p>{moment(date).format('hh:mm A')}</p>
        </div>
      </div>
    </div>
  )
}

export default DateComponent
