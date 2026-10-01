import {Modal} from 'antd'
import clsx from 'clsx'

const UnprocessedInfoModal = ({
  status,
  setOpenModal,
  openModal,
}: {
  status: string
  setOpenModal: (x: boolean) => void
  openModal: boolean
}) => {
  const getTitle = (status: string) => {
    switch (status) {
      case 'PATIENT':
        return 'Patients'
      case 'UNPROCESSED':
        return 'Unprocessed'
      case 'MANUFACTURING':
        return 'In Manufacturing'
      case 'DELIVERED':
        return 'Delivered till date'
      case 'DUE_BY':
        return 'Due by'
      default:
        return ''
    }
  }

  const getSubTitle = (status: string) => {
    switch (status) {
      case 'PATIENT':
        return 'Patients associated with your account, including active, archived, and refinement cases.'
      case 'UNPROCESSED':
        return 'This includes batches that have not yet entered the manufacturing stage. They are still pending processing by the lab.'
      case 'MANUFACTURING':
        return 'These batches are currently in the manufacturing pipeline. They go through the following stages:'
      case 'DELIVERED':
        return 'This shows the total number of aligners or batches that have been successfully delivered till date. '
      case 'DUE_BY':
        return 'This is the date before which the next batch of aligners should be delivered to ensure the patient’s treatment stays on track.It is calculated based on the end date of the last aligner in the patient’s most recently delivered batch. The due by date will appear once the lab begins manufacturing a new batch.'
      default:
        return ''
    }
  }

  const getDescription = (status: string) => {
    switch (status) {
      case 'PATIENT':
        return (
          <div className='flex flex-col gap-2'>
            <Description
              color='bg-[#BE8901]'
              title='Archived Cases'
              description='These are orders that had their treatment plans deactivated and cannot be continued. A new treatment plan and order must be created to resume treatment.'
            />
            <Description
              color='bg-[#00B383]'
              title='Refinement case'
              description='These are new orders created after a treatment plan was revised. They are used to make adjustments or refinements to the patient’s ongoing treatment.'
            />
          </div>
        )

      case 'MANUFACTURING':
        return (
          <div className='flex flex-col gap-2'>
            <Description
              color='bg-[#4F63DD]'
              title='In Progress'
              description='Manufacturing has started.'
            />
            <Description
              color='bg-[#2E7D32]'
              title='Completed'
              description='Manufacturing is done; the batch is now in inventory and ready to ship.'
            />
            <Description
              color='bg-[#E0802C]'
              title='In Transit'
              description='The batch has been shipped and is on its way to the clinic.'
            />
          </div>
        )

      case 'DUE_BY':
        return (
          <div className='flex flex-col gap-2'>
            <Description
              color='bg-[#E53935]'
              title='Overdue'
              description='The batch is past its due date. Immediate action is recommended.'
            />
            <Description
              color='bg-[#E0802C]'
              title='Due today'
              description='The batch is due today. Complete manufacturing and delivery promptly.'
            />
            <Description
              color='bg-[#00ACC1]'
              title='Due this week'
              description='The batch is due within 7 days. Plan manufacturing accordingly.'
            />

            <Description
              color='bg-[#208B25]'
              title='Due later'
              description='The batch is due within 7 days. Plan manufacturing accordingly.'
            />
          </div>
        )
      default:
        return ''
    }
  }

  return (
    <Modal
      closable={true}
      destroyOnClose={true}
      centered={true}
      open={openModal}
      className={clsx('md:w-[566px] w-full')}
      maskClosable={false}
      width={566}
      footer={null}
      onCancel={() => {
        setOpenModal(false)
      }}
      title={<div className='ml-3'>{getTitle(status)}</div>}
    >
      <div className='flex flex-col gap-3 p-3'>
        <div>{getSubTitle(status)}</div>
        <div>{getDescription(status)}</div>
      </div>
    </Modal>
  )
}

export default UnprocessedInfoModal

const Description = ({
  title,
  color,
  description,
}: {
  title: string
  color: string
  description: string
}) => {
  return (
    <div className=''>
      <div className='flex gap-1 items-center'>
        <div className={clsx('w-2 h-2 rounded-full', color)}></div>
        <div className='font-medium'>{title}</div>
      </div>
      <div className='font-normal text-textColor'>{description}</div>
    </div>
  )
}
