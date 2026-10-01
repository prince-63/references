import clsx from 'clsx'
import When from 'components/when/When'
import {ManufacturingStatus} from 'screens/Patients/LeadsProfile/main/overview/types/GettingStarted.types'

const ManufacturingStatusTextTag = ({status}: {status: ManufacturingStatus}) => {
  return (
    <>
      <When isTrue={status === 'PENDING' || status === null}>
        <TextTag dotColor='bg-orange' label='Manufacturing Pending' />
      </When>
      <When isTrue={status === 'MANUFACTURING_STARTED'}>
        <TextTag dotColor='bg-[#4F63DD]' label='In Progress' />
      </When>
      <When isTrue={status === 'COMPLETED'}>
        <TextTag dotColor='bg-[#2E7D32]' label='Completed' />
      </When>
      <When isTrue={status === 'SHIPPED'}>
        <TextTag dotColor='bg-[#E0802C]' label='In Transit' />
      </When>
      <When isTrue={status === 'DELIVERED'}>
        <TextTag dotColor='bg-[#6D59D9]' label='Delivered' />
      </When>
    </>
  )
}

export default ManufacturingStatusTextTag

const TextTag = ({dotColor, label}: {dotColor: string; label: string}) => {
  return (
    <div className='flex gap-1 items-center'>
      <div className={clsx('w-2 h-2 rounded-full', dotColor)}></div>
      <div className='font-figtree text-xs font-semibold leading-4 tracking-[0.12px] text-textColor'>
        {label}
      </div>
    </div>
  )
}
