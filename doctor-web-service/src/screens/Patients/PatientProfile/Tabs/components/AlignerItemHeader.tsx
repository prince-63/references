import {RowData} from '../../types/Aligners.types'
import Tag from 'components/tags/Tag'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {
  capitalizeFirstLetter,
  formatPluralizedString,
  getValueOrEmptyString,
  secToHour,
} from 'utils/ConstFunctions'
import When from 'components/when/When'
import CalendarDotsIcon from 'assets/icons/CalendarDotsIcon'
import WearDuration from '../../components/WearDuration'
import hasValue from 'utils/hasValue'
import productionStatusTypesConstants from '@constants/productionStatusTypes.constants'
import ClockTime from 'assets/icons/ClockTime'

const AlignerItemHeader = ({
  aligner,
  isDiscardedTreatment,
  showButton,
  initialCurrentAlignerNumber,
  isManualTracking,
}: {
  aligner: RowData
  isDiscardedTreatment: boolean
  showButton: (aligner: RowData) => boolean
  onPressEditTreatmentIcon: (aligner: RowData) => void
  initialCurrentAlignerNumber: number
  isManualTracking?: boolean
}) => {
  const {dataLeadsOverview} = useSelector((state: RootState) => state.leadsProfile)
  const isCurrentAligner = aligner.alignerNo === aligner.currentAlignerNo
  const getAlignersColumnClassName = () => {
    if (isCurrentAligner) {
      return 'text-primaryColor '
    } else if (!showButton(aligner)) {
      return 'text-grayDisabled '
    } else {
      return 'text-black '
    }
  }
  return (
    <div className='flex flex-col gap-4'>
      <div className='flex  justify-between items-center '>
        <div className='flex items-center gap-2 font-semibold text-base'>
          <div className={`${getAlignersColumnClassName()} `}>
            <p>
              {capitalizeFirstLetter(aligner?.alignerType)} {aligner?.alignerNo}
            </p>
          </div>
          <When isTrue={isCurrentAligner}>
            <Tag value='Current' className='bg-primarySupport text-primaryColor text-sm' />
          </When>
        </div>
        <div
          className={` flex justify-between items-center  ${
            isDiscardedTreatment ||
            dataLeadsOverview.treatment_plan?.aligner_treatment_status ===
              treatmentPlanStatusConstants.PAUSED
              ? 'pointer-events-none opacity-60'
              : ''
          }`}
        >
          {/* {showButton(aligner) ? (
            <div onClick={() => onPressEditTreatmentIcon(aligner)} className={'cursor-pointer'}>
              <CommonSVG svg={SVG_Gray_PENCIL} width='15' height='15' color='#666666' />
            </div>
          ) : null} */}
        </div>
      </div>
      <hr className='' />
      <div className='flex gap-2 items-center'>
        <CalendarDotsIcon color='#666666' />
        <WearDuration
          changeDate={aligner?.changeDate}
          changeOffset={aligner?.change_offset}
          startDate={aligner?.startDate}
          endDate={aligner?.endDate}
          isManualTracking={isManualTracking}
          disabled={!showButton(aligner)}
          showHyphen={
            aligner?.status === productionStatusTypesConstants.ISSUED_TO_PATIENT &&
            (hasValue(initialCurrentAlignerNumber)
              ? isManualTracking
                ? aligner?.alignerNo < initialCurrentAlignerNumber
                : aligner?.alignerNo < initialCurrentAlignerNumber - 1
              : aligner?.status === productionStatusTypesConstants.ISSUED_TO_PATIENT)
          }
        />
      </div>
      <When isTrue={!isManualTracking}>
        <div className='flex gap-2 items-center text-base  text-textColor  font-medium'>
          <ClockTime />
          {aligner?.avgWearTime === null || String(aligner?.avgWearTime) === 'NaN' ? (
            <span className='text-grayDisabled'>--</span>
          ) : (
            <p>
              {' '}
              {getValueOrEmptyString(aligner?.avgWearTime) === '--'
                ? '--'
                : formatPluralizedString(secToHour(aligner?.avgWearTime), 'Hour')}
            </p>
          )}
        </div>
      </When>
    </div>
  )
}

export default AlignerItemHeader
