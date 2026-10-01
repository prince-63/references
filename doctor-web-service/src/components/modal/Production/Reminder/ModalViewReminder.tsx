import {Dispatch, SetStateAction} from 'react'
import Button from '../../../atom/Buttons/Button'
import ButtonOutlinedRed from '../../../atom/Buttons/ButtonOutlinedRed'
import BackGroundSVG from '../../../atom/SVG/BackGroundSVG'
import {SVG_CALENDER_PRIMARY, SVG_CROSS, SVG_TIMER_PRIMARY} from '../../../../utils/SvgConstants'
import CommonSVG from '../../../atom/SVG/CommonSVG'
import ModalLayout from 'components/modal/ModalLayout'
import dayjs from 'dayjs'

interface ModalViewReminderProps {
  setIsModalViewReminderOpen: Dispatch<SetStateAction<boolean>>
  reminderDate: string
  reminderTime?: string
  onDeleteReminderClick: () => void
  onEditReminderClick: () => void
}

const ModalViewReminder = ({
  setIsModalViewReminderOpen,
  reminderDate,
  onDeleteReminderClick,
  onEditReminderClick,
  reminderTime,
}: ModalViewReminderProps) => {
  const formattedDateTime = reminderTime
    ? dayjs(`${reminderDate}T${reminderTime}`).format('DD MMMM YYYY, hh:mm A')
    : dayjs(reminderDate).format('DD MMMM YYYY')
  return (
    <ModalLayout>
      <div className='flex justify-between items-center'>
        <BackGroundSVG
          svg={SVG_TIMER_PRIMARY}
          width='26'
          height='26'
          className='w-16 h-16 bg-primarySupport rounded-full'
        />
        <div
          className='cursor-pointer'
          onClick={() => {
            setIsModalViewReminderOpen(false)
          }}
        >
          <CommonSVG svg={SVG_CROSS} width='47' height='47' />
        </div>
      </div>
      <div className='mt-4'>
        <div className='text-black text-2xl font-semibold'>Reminder</div>
        <div className='mt-2 mb-7 text-textColor text-base font-normal'>
          Edit or delete the reminder to set a new one
        </div>
      </div>

      <div className=' w-full border border-gray-500 rounded-lg flex flex-col p-4'>
        <div className=' text-textColor text-base font-normal'>Remind me on</div>
        <div className='flex gap-4 items-center justify-start'>
          <span>
            <BackGroundSVG
              svg={SVG_CALENDER_PRIMARY}
              width='16'
              height='16'
              className='!w-10 !h-10 bg-primarySupport rounded-full'
            />
          </span>
          <span className='text-xl font-semibold'>{formattedDateTime}</span>
        </div>
      </div>

      <div className='mt-7 flex gap-8'>
        <ButtonOutlinedRed
          text='Delete Reminder'
          className='!h-12'
          onClick={() => {
            onDeleteReminderClick()
          }}
        />
        <Button
          text={'Edit Reminder'}
          className='h-12'
          onClick={() => {
            onEditReminderClick()
          }}
        />
      </div>
    </ModalLayout>
  )
}

export default ModalViewReminder
