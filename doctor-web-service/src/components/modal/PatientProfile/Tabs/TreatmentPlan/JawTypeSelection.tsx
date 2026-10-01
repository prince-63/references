import React from 'react'
import jawTypeOptions from '../../../../../@staticData/jawTypeOptions'

interface Props {
  setJawType: (jawType: string) => void
  jawType: string
}

const JawTypeSelection: React.FC<Props> = ({setJawType, jawType}) => {
  return (
    <div className='flex flex-grow gap-4 ml-4 text-base font-semibold'>
      {jawTypeOptions.map((option, index) => (
        <button
          type='button'
          key={index}
          className={`${
            jawType === option.value
              ? 'bg-primarySupport border border-primaryColor text-primaryColor'
              : 'bg-transparent border border-mediumGray text-textColor'
          }   px-2 rounded-lg font-semibold min-h-[40px]`}
          onClick={() => setJawType(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default JawTypeSelection
