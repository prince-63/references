import {FileText} from 'lucide-react'

const EmptyDataCard = ({emptyText}: {emptyText?: string}) => {
  return (
    <div className='w-full border border-mediumGray rounded flex flex-col items-center justify-center py-16'>
      <div className='flex justify-center items-center mb-4 w-12 h-12 rounded-full bg-lightGray'>
        <FileText size={24} color='#666666 ' />
      </div>
      <h2 className='text-sm font-medium text-textColor mb-2'>{emptyText ?? 'No Data'}</h2>
    </div>
  )
}

export default EmptyDataCard
