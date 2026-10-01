import jawTypeConstants from '@constants/jawType'
import moment from 'moment'

const AlignerItem = ({
  alignerNo,
  startDate,
  endDate,
  jawType,
}: {
  alignerNo: number
  startDate: string
  endDate: string
  jawType: keyof typeof jawTypeConstants | ''
}) => {
  const formatDate = (date: string) => {
    return moment(date, 'YYYY-MM-DD').format('DD MMM')
  }
  return (
    <div className='flex flex-col gap-1 justify-center'>
      <p className='text-black font-medium text-sm capitalize'>
        {jawType.toLowerCase()} {alignerNo}
      </p>
      <div className='text-xs font-normal flex'>
        <p>{formatDate(startDate)}</p>
        <p>-</p>
        <p>{formatDate(endDate)}</p>
      </div>
    </div>
  )
}

export default AlignerItem
