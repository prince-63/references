import {capitalizeFirstLetter} from 'utils/ConstFunctions'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import When from 'components/when/When'
import DateComponent from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/DateComponent'
import Tag from 'components/tags/Tag'
import {Divider} from 'antd'
import AlignerChangeDetails from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/components/alignerChangeDetails/components/AlignerChangeDetails'

const AlignerChangeDrawerContent = () => {
  const {alignerUpdateDetails} = useSelector((state: RootState) => state.alignerTracking)
  return (
    <div>
      <div className='flex flex-col text-textColor gap-2'>
        <span>
          <span className='text-black text-lg font-semibold'>
            {capitalizeFirstLetter(alignerUpdateDetails?.previous_aligner_details?.jaw_type || '')}{' '}
            {alignerUpdateDetails?.previous_aligner_details?.sr_no} to{' '}
          </span>
          {'  '}
          <span className='text-black text-lg font-semibold'>
            {capitalizeFirstLetter(alignerUpdateDetails?.next_aligner_details?.jaw_type || '')}{' '}
            {alignerUpdateDetails?.next_aligner_details?.sr_no}
          </span>
        </span>
        <DateComponent {...{date: alignerUpdateDetails?.perform_at}} />
        <When isTrue={alignerUpdateDetails?.category === 'CRITICAL'}>
          <Tag value={'CRITICAL'} className='bg-red text-white w-fit' />
        </When>
      </div>
      <Divider className='my-4' />
      <AlignerChangeDetails
        {...{
          changeDate: alignerUpdateDetails?.aligner?.change_date,
          endDate: alignerUpdateDetails?.aligner?.end_date,
          changeOffset: alignerUpdateDetails?.aligner?.change_offset,
        }}
      />
    </div>
  )
}

export default AlignerChangeDrawerContent
