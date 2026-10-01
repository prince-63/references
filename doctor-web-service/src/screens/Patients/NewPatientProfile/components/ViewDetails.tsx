import React from 'react'
import CaretRightIcon from 'assets/icons/CaretRightIcon'
import {Action, Aligner} from '../patientTimeline.types'
import cn from '@utils/cn'
interface ViewDetailsProps {
  onClick: (action: Action, aligner: Aligner) => void
  text?: string
  action: Action
  aligner: Aligner
  showIcon?: boolean
  className?: string
}

const ViewDetails: React.FC<ViewDetailsProps> = ({
  onClick,
  text = 'View details',
  action,
  aligner,
  showIcon = true,
  className = 'bg-primarySupport border border-primaryColor h-10 px-4 rounded-lg',
}) => {
  return (
    <button
      className={cn(
        'text-primaryColor text-sm font-semibold flex items-center gap-1  w-fit',
        className
      )}
      onClick={() => onClick(action, aligner)}
      type='button'
    >
      <p>{text}</p>
      {showIcon && <CaretRightIcon color={'#735BF2'} width='9' height='14' />}
    </button>
  )
}

export default ViewDetails
