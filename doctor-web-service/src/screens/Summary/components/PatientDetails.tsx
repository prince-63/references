import {Image} from 'assets/images/Images/Image'
import When from 'components/when/When'
import hasValue from 'utils/hasValue'
import {IPatient_details} from '../types/summary.types'
import {formatPluralizedString, getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'

const PatientDetails = ({patient_details}: {patient_details: IPatient_details}) => {
  return (
    <div>
      <div className='grid md:grid-cols-2 gap-4'>
        <div className='flex gap-2 justify-start items-center h-11 min-w-[200px]'>
          {patient_details?.profile_picture_url !== null ? (
            <Image
              className='w-11 h-11 object-cover rounded-full'
              src={patient_details?.profile_picture_url}
              showLoading={true}
            />
          ) : (
            <div className='bg-primarySupport border border-primaryColor text-primaryColor text-lg font-medium rounded-full flex justify-center items-center min-w-11 min-h-11'>
              <span>
                {patient_details?.first_name ? patient_details?.first_name.charAt(0) : ''}
              </span>
              <span>
                {patient_details?.last_name !== null
                  ? getFirstLetterCapitalOfWord(patient_details?.last_name.charAt(0))
                  : ''}
              </span>
            </div>
          )}
          <div className='text-black text-base font-semibold w-[180px] truncate ...'>
            {patient_details?.first_name}{' '}
            {hasValue(patient_details?.last_name) && patient_details?.last_name}
            <div className='text-textColor text-sm font-medium'>ID: #{patient_details?.uuid}</div>
          </div>
        </div>
        <div className='grid grid-cols-2 '>
          <ConditionalDiv
            label='Age'
            value={
              patient_details?.age !== null
                ? formatPluralizedString(patient_details?.age, 'year')
                : null
            }
          />
          <ConditionalDiv
            label='Gender'
            value={
              patient_details?.gender !== null
                ? getFirstLetterCapitalOfWord(patient_details?.gender)
                : null
            }
          />
        </div>
      </div>
      <When
        isTrue={hasValue(patient_details?.mobile) || hasValue(patient_details?.practice_location)}
      >
        <div className='border-t border-mediumGray my-4'></div>
        <div className='grid md:grid-cols-2 gap-4'>
          <ConditionalDiv
            label='Contact details'
            value={
              hasValue(patient_details?.country_code && patient_details?.mobile)
                ? patient_details?.country_code + ' ' + patient_details?.mobile
                : null
            }
            value_two={patient_details?.email?.toLocaleLowerCase()}
          />
          <ConditionalDiv label='Practice location' value={patient_details?.practice_location} />
        </div>{' '}
      </When>
    </div>
  )
}

export default PatientDetails

const ConditionalDiv = ({
  label,
  value,
  value_two,
}: {
  label: string
  value: string | number | null
  value_two?: string | number | null
}) => {
  return (
    <div>
      <When isTrue={hasValue(value || value_two)}>
        <div className='text-sm text-textColor font-medium'>{label}</div>
        <div className='flex items-center text-[16px] font-medium'>
          <When isTrue={hasValue(value)}>{value}</When>
          <When isTrue={hasValue(value) && hasValue(value_two)}>
            <div className='w-1 h-1 bg-black rounded-full mx-2'></div>
          </When>
          <When isTrue={hasValue(value_two)}>{value_two}</When>
        </div>
      </When>
    </div>
  )
}
