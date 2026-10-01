import clsx from 'clsx'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import {useNavigate, useParams} from 'react-router-dom'
import useProfileBasePath from '@hooks/useProfileBasePath'
import {SVG_TEETHS, SVG_TEETH_CONNECTED_PRIMARY} from 'utils/SvgConstants'
import {ITreatment} from './types/addTreatment.types'
import treatmentTypeMain from '@constants/treatmentTypeMain'
import CalenderCheck from 'assets/icons/CalenderCheck'
import When from 'components/when/When'
import PatientPlusMobileIcon from 'assets/icons/PatientPlusMobileIcon'
import PulseIcon from 'assets/icons/PulseIcon'
interface props {
  treatment: ITreatment
}
const Label = ({value}: {value: boolean}) => {
  return (
    <span
      className={clsx(
        'px-3 py-0.5 rounded-md font-medium',
        value && 'bg-tertiarySupport text-tertiaryColor',
        !value && 'bg-redSupport text-red'
      )}
    >
      {value ? 'Yes' : 'No'}
    </span>
  )
}

const MobileTreatmentCard = (props: props) => {
  const {treatment} = props
  const navigation = useNavigate()
  const {patientId} = useParams()
  const profileBasePath = useProfileBasePath()

  return (
    <div
      className='flex flex-col cursor-pointer'
      onClick={() => {
        if (treatment.treatment_sub_type === treatmentTypeMain.ALIGNERS) {
          navigation(`${profileBasePath}/${patientId}/plans-list`)
        } else {
          navigation(`${profileBasePath}/${patientId}/plans-list`)
        }
      }}
    >
      <div className='flex w-full rounded-[12px] border border-lightGray p-4'>
        <div className='flex flex-col gap-2 flex-[10]'>
          <div className='flex gap-2 items-center pb-3 border-b'>
            <BackGroundSVG
              svg={
                treatment.treatment_sub_type === treatmentTypeMain.ALIGNERS
                  ? SVG_TEETHS
                  : SVG_TEETH_CONNECTED_PRIMARY
              }
              width={treatment.treatment_sub_type === treatmentTypeMain.ALIGNERS ? '20' : '26'}
              className='w-10 h-10 border border-lightGray rounded-full flex justify-center items-center'
            />
            <span className='text-[16px] font-bold'>
              {treatment.treatment_sub_type === treatmentTypeMain.ALIGNERS
                ? 'Clear aligners'
                : 'Braces'}
            </span>
          </div>
          <div className='flex flex-col gap-4 mt-2'>
            <div className='flex justify-between items-center gap-4'>
              <div className='flex justify-center items-center gap-2'>
                <CalenderCheck />
                <span className='text-sm font-[500]'>Treatment plan </span>
              </div>
              <Label value={treatment.treatment_plan_created} />
            </div>

            <When isTrue={treatment.treatment_sub_type === treatmentTypeMain.ALIGNERS}>
              <div className='flex justify-between items-center gap-4'>
                <div className='flex justify-center items-center gap-2'>
                  <PulseIcon />
                  <span className='text-sm font-[500]'>Tracking </span>
                </div>
                <Label value={treatment.tracking_enabled} />
              </div>
            </When>

            <When isTrue={treatment.treatment_sub_type === treatmentTypeMain.ALIGNERS}>
              <div className='flex justify-between items-center gap-4'>
                <div className='flex justify-center items-center gap-2'>
                  <PatientPlusMobileIcon />
                  <span className='text-sm font-[500]'>Patient Connection </span>
                </div>
                <Label value={treatment.patient_invited} />
              </div>
            </When>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MobileTreatmentCard
