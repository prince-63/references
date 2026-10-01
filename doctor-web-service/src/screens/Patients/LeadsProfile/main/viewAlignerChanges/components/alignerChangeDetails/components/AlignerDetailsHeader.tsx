import alignerUpdateTypeConstants from '@constants/alignerUpdateType.constants'
import When from 'components/when/When'
import {IAction} from 'screens/Patients/LeadsProfile/leadsProfile.types'
import {capitalizeFirstLetter} from 'utils/ConstFunctions'

const AlignerDetailsHeader = ({alignerUpdateItem}: {alignerUpdateItem: IAction}) => {
  return (
    <div className='text-lg'>
      <When isTrue={alignerUpdateItem?.type === alignerUpdateTypeConstants.ALIGNER_CHANGE}>
        <span className='text-black font-semibold'>
          {capitalizeFirstLetter(alignerUpdateItem?.previous_aligner?.jaw_type)}{' '}
          {alignerUpdateItem?.previous_aligner?.aligner_sr_no} to{' '}
          {capitalizeFirstLetter(alignerUpdateItem?.new_aligner?.jaw_type)}{' '}
          {alignerUpdateItem?.new_aligner?.aligner_sr_no}
        </span>{' '}
        <span>aligner change</span>
      </When>
      <When isTrue={alignerUpdateItem?.type === alignerUpdateTypeConstants.CHECK_IN}>
        <span className='text-black font-semibold'>
          {capitalizeFirstLetter(alignerUpdateItem?.previous_aligner?.jaw_type)}{' '}
          {alignerUpdateItem?.previous_aligner?.aligner_sr_no}
        </span>{' '}
        <span>check in</span>
      </When>
      <When isTrue={alignerUpdateItem?.type === alignerUpdateTypeConstants.ISSUE_REPORT}>
        <span>Reported an issue for</span>{' '}
        <span className='text-black font-semibold'>
          {capitalizeFirstLetter(alignerUpdateItem?.previous_aligner?.jaw_type)}{' '}
          {alignerUpdateItem?.previous_aligner?.aligner_sr_no}
        </span>
      </When>
    </div>
  )
}

export default AlignerDetailsHeader
