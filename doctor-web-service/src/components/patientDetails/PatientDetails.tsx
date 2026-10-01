import {Image} from 'assets/images/Images/Image'
import React from 'react'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

const PatientDetails = ({
  patient,
}: {
  patient: {
    patient_name: string
    profile_url?: string | null
  }
}) => {
  return (
    <div className='flex flex-col gap-2 font-medium text-base '>
      <p className='text-textColor'>Patient</p>
      <div className='flex gap-2 cursor-default items-center'>
        {hasValue(patient.profile_url) ? (
          <Image
            className='w-8 h-8 rounded-full  object-cover cursor-pointer bg-transparent'
            src={patient.profile_url ?? ''}
            alt='patient photo'
            showLoading={true}
            onClick={(e: React.MouseEvent<HTMLImageElement>) => {
              e.stopPropagation()
            }}
          />
        ) : (
          <div className='bg-mediumGray text-textColor text-base font-medium rounded-full flex justify-center items-center min-w-8 min-h-8'>
            <span>
              {hasValue(patient?.patient_name)
                ? patient?.patient_name?.split(' ')[0]?.charAt(0)
                : ''}
            </span>
            <span>
              {hasValue(patient?.patient_name)
                ? getFirstLetterCapitalOfWord(
                    patient?.patient_name.split(' ').slice(-1)[0].charAt(0)
                  )
                : ''}
            </span>
          </div>
        )}

        <p className='text-black text-base font-semibold'>{patient.patient_name}</p>
      </div>
    </div>
  )
}

export default PatientDetails
