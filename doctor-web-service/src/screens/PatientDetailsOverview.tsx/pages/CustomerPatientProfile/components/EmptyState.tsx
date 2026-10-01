import {FileText} from 'lucide-react'

const EmptyState = ({title, subTitle}: {title: string; subTitle?: string}) => {
  return (
    <div
      className='w-full rounded-3xl border border-dashed bg-primarySupport
     border-mediumGray flex flex-col items-center justify-center py-16'
    >
      <div className='flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-lightGray'>
        <FileText size={24} color='#666666 ' />
      </div>
      <h2 className='text-sm font-medium text-textColor mb-1'>{title ?? 'No Data'}</h2>
      <div className='text-sm font-normal text-textColor'>{subTitle ?? ''}</div>
    </div>
  )
}

export default EmptyState
