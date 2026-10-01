import {IComment} from '../orders.types'
import {Image} from 'assets/images/Images/Image'
import clsx from 'clsx'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import dayjs from 'dayjs'

const TimeLineItem = ({comment}: {comment?: IComment}) => {
  return (
    <div className='flex md:gap-3 justify-between items-center font-medium text-sm'>
      <div className={clsx('flex gap-2', comment?.remark ? ' items-start' : 'items-center')}>
        {comment?.profile_image_url ? (
          <Image
            className='w-10 h-10 rounded-[4px] object-cover cursor-pointer bg-transparent'
            src={comment?.profile_image_url}
            alt='profile photo'
          />
        ) : (
          <PatientProfileInitials
            {...{
              name: comment?.display_name ?? '',
              className: 'w-8 h-8 ',
            }}
          />
        )}
        <div>
          <p className='truncate text-wrap break-words'>
            {comment?.display_name}: {comment?.notes}
          </p>
          {comment?.remark && (
            <div>
              <p className='text-textColor font-medium mt-1'>Remark</p>
              <div>{comment?.remark}</div>
            </div>
          )}
        </div>
      </div>
      <p className='text-xs text-textColor text-nowrap'>
        {dayjs(comment?.created_at).format('DD-MMM-YYYY, h:mma')}
      </p>
    </div>
  )
}

export default TimeLineItem
