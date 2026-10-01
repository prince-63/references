import React, {useState} from 'react'

interface TreatmentPlanDetailsProps {
  bracesTreatmentPlanDetail?: {
    remarks?: string
  }
}

const Notes: React.FC<TreatmentPlanDetailsProps> = ({bracesTreatmentPlanDetail}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleReadMoreClick = () => {
    setIsExpanded(!isExpanded)
  }

  const maxLength = 150
  const noteText = bracesTreatmentPlanDetail != undefined ? bracesTreatmentPlanDetail.remarks : ''

  return (
    <div>
      <div className="w-auto text-textColor text-sm font-medium font-['Figtree'] leading-tight tracking-tight">
        Note
      </div>
      {noteText != undefined ? (
        <div className='w-auto h-auto text-black text-sm font-normal leading-tight tracking-tight'>
          {isExpanded || noteText.length <= maxLength
            ? noteText
            : `${noteText.substring(0, maxLength)}...`}
          {noteText.length > maxLength && (
            <span onClick={handleReadMoreClick} className='text-primaryColor cursor-pointer'>
              {isExpanded ? ' Read Less' : ' Read More'}
            </span>
          )}
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

export default Notes
