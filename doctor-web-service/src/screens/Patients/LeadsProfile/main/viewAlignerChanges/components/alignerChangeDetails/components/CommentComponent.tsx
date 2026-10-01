import {IComment} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import moment from 'moment'
import {clsx} from 'yet-another-react-lightbox'
import {Image} from 'assets/images/Images/Image'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'

const CommentComponent = ({comment}: {comment: IComment}) => {
  return (
    <div className='flex gap-3 items-start'>
      {comment?.sender_profile_image_url !== null && comment?.sender_profile_image_url !== 'N/A' ? (
        <Image
          className='min-w-8 h-8 object-cover rounded-full'
          src={comment?.sender_profile_image_url}
        />
      ) : (
        <PatientProfileInitials
          {...{
            name: comment?.sender_name ?? '',
            className: 'w-8 h-8 border border-mediumGray bg-lightGray',
          }}
        />
      )}
      <div className='flex flex-col gap-1.5 flex-1'>
        <div className='flex gap-2 items-baseline text-textColor font-medium '>
          <p className='text-black text-sm'>{comment?.sender_name}</p>
          <p className='text-xs'>{moment(comment.created_at).format('DD-MMM-YYYY h:mm A')}</p>
        </div>
        <div
          className={clsx(
            'p-4 border border-mediumGray text-black text-sm font-medium rounded-[4px] break-all'
          )}
        >
          {comment.feedback_message}
        </div>
      </div>
    </div>
  )
}

export default CommentComponent
