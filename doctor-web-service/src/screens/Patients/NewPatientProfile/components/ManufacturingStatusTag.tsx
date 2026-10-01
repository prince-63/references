import clsx from 'clsx'
import When from 'components/when/When'
import {ManufacturingStatus} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'

const ManufacturingStatusTag = ({
  status,
  showBorder = true,
}: {
  status: ManufacturingStatus
  showBorder?: boolean
}) => {
  return (
    <div>
      <When isTrue={status === 'PENDING' || status === null}>
        <StatusTag
          color={showBorder ? 'bg-orange' : ''}
          className={clsx(showBorder ? 'bg-orangeSupport' : 'bg-transparent')}
          text={showBorder ? 'Manufacturing Pending' : ''}
        />
      </When>
      <When isTrue={status === 'MANUFACTURING_STARTED'}>
        <StatusTag
          color={'bg-[#4F63DD]'}
          className={clsx(showBorder ? 'bg-[#4F63DD26]' : 'text-sm text text-textColor')}
          text={showBorder ? 'Manufacturing In Progress' : ' In Progress'}
        />
      </When>
      <When isTrue={status === 'COMPLETED'}>
        <StatusTag
          color={'bg-[#2E7D32]'}
          className={clsx(showBorder ? 'bg-[#2E7D3226]' : 'text-sm text text-textColor')}
          text={showBorder ? 'Manufacturing Completed' : 'Completed'}
        />
      </When>
      <When isTrue={status === 'SHIPPED'}>
        <StatusTag
          color={'bg-[#E0802C]'}
          className={clsx(showBorder ? 'bg-[#E0802C26]' : 'text-sm text text-textColor')}
          text='In Transit'
        />
      </When>
      <When isTrue={status === 'DELIVERED'}>
        <StatusTag
          color={showBorder ? 'bg-[#6D59D9]' : ''}
          className={clsx(showBorder ? 'bg-[#6D59D926]' : 'bg-transparent')}
          text={showBorder ? 'Delivered' : ''}
        />
      </When>
    </div>
  )
}

export default ManufacturingStatusTag

const StatusTag = ({color, className, text}: {color: string; className: string; text: string}) => {
  return (
    <div className={clsx('flex gap-1 px-4 py-1 items-center rounded-3xl', className)}>
      <div className={clsx('w-2 h-2 rounded-full', color)}></div>
      <div className='text-textColor text-sm font-medium'>{text}</div>
    </div>
  )
}
