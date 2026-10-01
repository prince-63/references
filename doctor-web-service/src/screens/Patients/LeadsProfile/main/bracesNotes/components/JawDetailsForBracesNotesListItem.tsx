import {jawTypeDetail} from '../../appointments/types/appointments.types'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'
import hasValue from 'utils/hasValue'
import ColorIcon from 'components/colorIcon/ColorIcon'

const JawDetailsForBracesNotesListItem = ({item}: {item: jawTypeDetail | null}) => {
  if (!item) return <div className='text-grayDisabled font-medium py-2'>Not filled</div>
  return (
    <div className='flex md:flex-col gap-2 md:gap-1 text-sm items-center md:items-baseline text-textColor font-medium flex-wrap'>
      <div className=''>
        {!hasValue(item.treatment_stage_type)
          ? getFirstLetterCapitalOfWord(bracesTreatmentStages.NOT_SELECTED)
          : item.treatment_stage_type}
      </div>
      <ColorIcon
        {...{
          color: '#D9D9D9',
          className: 'w-2 h-2 md:hidden',
        }}
      />
      <div className='flex gap-2 '>
        <p>{!hasValue(item.shape) ? 'Not added' : item.shape}</p>-
        <p>{!hasValue(item.material_name) ? 'Not added' : item.material_name}</p>-
        <p>{!hasValue(item.material_size) ? 'Not added' : item.material_size}</p>
      </div>
    </div>
  )
}

export default JawDetailsForBracesNotesListItem
