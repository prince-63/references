import {Modal} from 'antd'
import CloseIcon from 'assets/icons/CloseIcon'
import clsx from 'clsx'

const InfoModal = ({
  showInfoAlinerUpdate = false,
  showModal,
  setShowModal,
}: {
  showInfoAlinerUpdate?: boolean
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}) => {
  return (
    <Modal
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={[]}
      zIndex={2000}
      closeIcon={false}
      width={566}
    >
      {showInfoAlinerUpdate ? (
        <div className='flex flex-col gap-6 p-3'>
          <div>
            <div className='flex justify-between items-center'>
              <div className='flex items-center justify-center text-2xl font-semibold'>
                What are pending updates?
              </div>
              <div
                className='cursor-pointer'
                onClick={() => {
                  setShowModal(false)
                }}
              >
                <CloseIcon width='22' height='22' />
              </div>
            </div>
            <div className='text-base text-textColor font-normal'>
              Pending items require your review and action to keep treatment progress on track.
              These include:
            </div>
          </div>
          <div className='flex flex-col justify-start items-start gap-3'>
            <div>
              <div className='text-base font-medium'>Unapproved Aligner Changes</div>
              <div className='text-base text-textColor font-normal'>
                Approve aligner changes to update treatment status.
              </div>
            </div>
            <div>
              <div className='text-base font-medium'>Unapproved Aligner Check-ins</div>
              <div className='text-base text-textColor font-normal'>
                Approve patient check-ins to mark them as completed.{' '}
              </div>
            </div>
            <div>
              <div className='text-base font-medium'>Unresolved Issues Reported</div>
              <div className='text-base text-textColor font-normal'>
                Review patient-reported issues and mark them as resolved when addressed.{' '}
              </div>
            </div>

            <div className='text-base text-textColor font-normal'>
              Each item remains pending until manually approved or resolved. Taking timely action
              ensures smooth treatment progress.{' '}
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-6 p-3'>
          <div>
            <div className='flex justify-between items-center'>
              <div className='flex items-center justify-center text-2xl font-semibold'>
                Understanding patient compliance
              </div>
              <div
                className='cursor-pointer'
                onClick={() => {
                  setShowModal(false)
                }}
              >
                <CloseIcon width='22' height='22' />
              </div>
            </div>
            <div className='text-base text-textColor font-normal'>
              Compliance is based on the most recent aligner change date, not the overall history.
              It updates with each aligner change.
            </div>
          </div>
          <div className='flex flex-col justify-start items-start gap-3'>
            <PointNote
              title='Needs attention'
              color='red'
              subtitle='The aligner change is overdue by more than 7 days. Immediate follow-up is recommended.'
            />
            <PointNote
              title='At risk'
              color='orange'
              subtitle='The aligner change is overdue by less than 7 days. Monitor closely.'
            />
            <PointNote
              title='On track'
              color='tertiaryColor'
              subtitle='The next aligner change is scheduled and approaching.'
            />
          </div>
        </div>
      )}
    </Modal>
  )
}

export default InfoModal

const PointNote = ({title, color, subtitle}: {title: string; color: string; subtitle: string}) => {
  return (
    <div className='flex flex-col justify-start items-start'>
      <div className='flex items-center justify-start gap-1'>
        <div
          className={clsx('flex items-center justify-center w-2 h-2 rounded-full ', `bg-${color}`)}
        ></div>
        <div className={`font-medium text-base text-${color}`}>{title}</div>
      </div>

      <div className='text-base text-textColor font-normal'>{subtitle}</div>
    </div>
  )
}
