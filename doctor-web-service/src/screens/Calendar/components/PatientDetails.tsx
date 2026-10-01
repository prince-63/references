import {Image} from 'assets/images/Images/Image'
import React from 'react'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import {useEvent} from './EventContext'

const PatientDetails = () => {
  const {event} = useEvent()
  const {patient_name, profile_url} = event.extendedProps.content.details
  return (
    <div className='flex gap-2 cursor-default items-center'>
      {profile_url ? (
        <Image
          className='w-8 h-8 max-w-8 max-h-8 min-w-8 min-h-8 rounded-full  object-cover bg-transparent'
          src={profile_url} // Dummy user photo
          alt='patient photo'
          size={20}
          showLoading={true}
          onClick={(e: React.MouseEvent<HTMLImageElement>) => {
            e.stopPropagation()
          }}
        />
      ) : (
        <div className='bg-mediumGray text-textColor text-base font-medium rounded-full flex justify-center items-center min-w-8 min-h-8'>
          <span>{hasValue(patient_name) ? patient_name?.split(' ')[0].charAt(0) : ''}</span>
          <span>
            {patient_name
              ? getFirstLetterCapitalOfWord(patient_name?.split(' ').slice(-1)[0].charAt(0))
              : ''}
          </span>
        </div>
      )}
      <p className='text-black text-base font-semibold'>{patient_name}</p>
    </div>
  )
}

export default PatientDetails
