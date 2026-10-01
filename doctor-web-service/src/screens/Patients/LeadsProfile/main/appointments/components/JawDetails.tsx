import LevelingIcon from 'assets/icons/LevelingIcon'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {getFirstLetterCapitalOfWord} from 'utils/ConstFunctions'
import {SVG_TEETH_CONNECTED_GRAY} from 'utils/SvgConstants'
import {jawTypeDetail} from '../types/appointments.types'
import bracesTreatmentStages from '@constants/bracesTreatmentStages'

const JawDetails = ({item, status}: {item: jawTypeDetail; status: string}) => {
  return (
    <div className='flex flex-col text-textColor md:w-[30%] md:h-20 md:pl-5 md:pr-4 pt-3 gap-2 md:gap-0'>
      <div className='flex gap-2 flex-row md:flex-col md:gap-0'>
        <div className='md:hidden'>
          <LevelingIcon />
        </div>
        <div
          className={`text-start ${
            status === '' ? 'text-textColor' : 'text-black'
          } text-sm font-medium  leading-tight`}
        >
          {item.treatment_stage_type === ''
            ? getFirstLetterCapitalOfWord(bracesTreatmentStages.NOT_SELECTED)
            : item.treatment_stage_type}
        </div>
      </div>
      <div className='flex gap-2 flex-row md:flex-col md:gap-0'>
        <div className='md:hidden'>
          <CommonSVG svg={SVG_TEETH_CONNECTED_GRAY} width='20' height='20' />
        </div>
        <div
          className={`text-start ${
            item.material_name === '' ? 'text-textColor' : 'text-black/opacity-20'
          } text-sm font-medium  leading-tight flex gap-1`}
        >
          <p>{item.shape === '' ? 'Not added' : item.shape}</p>-
          <p>{item.material_name === '' ? 'Not added' : item.material_name}</p>-
          <p>{item.material_size === '' ? 'Not added' : item.material_size}</p>
        </div>
      </div>
    </div>
  )
}

export default JawDetails
