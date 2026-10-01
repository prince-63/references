import {useState} from 'react'
import {RowDataForAppointmentsList} from '../types/appointments.types'
import {Popover} from 'antd'
import AppointmentRowActions from './AppointmentRowActions'
import ColorIcon from 'components/colorIcon/ColorIcon'
import dayjs from 'dayjs'
import hasValue from 'utils/hasValue'
import RupeeCurrencyIcon from 'assets/icons/RupeeCurrencyIcon'
import {SVG_TEETH_CONNECTED_GRAY} from 'utils/SvgConstants'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import formatAmount from 'screens/Calendar/helpers/formatAmount'

const AppointmentListItem = ({appointment}: {appointment: RowDataForAppointmentsList}) => {
  const [openPopover, setOpenPopover] = useState(false)
  const formattedStartDate = dayjs(appointment.start_date).format('DD MMMM YYYY, hh:mm A')
  const formattedEndDate = appointment.end_date
    ? dayjs(appointment.end_date).format('hh:mm A')
    : null
  const formattedAmount = formatAmount(appointment.amount)

  return (
    <div className='p-4 flex flex-col gap-3 border border-lighterGray rounded-lg font-medium text-sm justify-center'>
      <div className='flex justify-between items-center gap-2 text-base font-semibold'>
        <p>
          {' '}
          {formattedStartDate} {hasValue(formattedEndDate) ? `to ${formattedEndDate}` : null}
        </p>
        <Popover
          content={
            <AppointmentRowActions {...{setOpenPopover, selectedAppointment: appointment}} />
          }
          getPopupContainer={(triggerNode) => triggerNode.parentElement as HTMLElement}
          overlayInnerStyle={{padding: '4px', fontFamily: 'figtree'}}
          placement='left'
          open={openPopover}
          trigger={['click']}
          onOpenChange={(open) => {
            setOpenPopover(open)
          }}
          className='transition ease-in-out duration-200'
        >
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
            }}
            className='flex gap-[1.78px]'
          >
            <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
            <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
            <ColorIcon {...{color: '#B0B0B0', className: 'w-[4px] h-[4px]'}} />
          </button>
        </Popover>
      </div>
      <div className='w-full border border-lighterGray mx-1 '></div>
      <div className='flex gap-2'>
        <RupeeCurrencyIcon />
        {formattedAmount ? formattedAmount : 'Not added'}
      </div>
      <div className='flex text-textColor gap-2 break-all'>
        <div>
          <CommonSVG svg={SVG_TEETH_CONNECTED_GRAY} width='20' height='20' />
        </div>
        {appointment.notes ? appointment.notes : 'Not added'}
      </div>
    </div>
  )
}

export default AppointmentListItem
