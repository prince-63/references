import CommonSVG from 'components/atom/SVG/CommonSVG'
import Tag from 'components/tags/Tag'
import {SVG_CALENDER, SVG_EXPAND_RIGHT} from 'utils/SvgConstants'
import {useNavigate, useParams} from 'react-router-dom'
import {capitalizeFirstLetter, safeParseInt} from 'utils/ConstFunctions'
import {getBracesTreatmentPlan} from 'redux/Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import useDispatchAction from '@hooks/useDispatchAction'
import bracesTreatmentPlanStatusConstants from '@constants/bracesTreatmentPlanStatus.constants'
import {useContext} from 'react'
import {AuthContext} from 'context/AuthContext'
import {IBracesTreatmentPlanDetails} from '../../types/treatmentPlan.types'
import moment from 'moment'

const TreatmentPlanBracesCard = ({
  bracesTreatmentPlan,
}: {
  bracesTreatmentPlan: IBracesTreatmentPlanDetails
}) => {
  const navigate = useNavigate()
  const {patientId} = useParams()
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()

  const getTagClassName = (status: string) => {
    switch (status) {
      case bracesTreatmentPlanStatusConstants.ACTIVE:
        return 'text-tertiaryColor bg-tertiarySupport'
      case bracesTreatmentPlanStatusConstants.DRAFT:
        return 'bg-primarySupport text-primaryColor'
      case bracesTreatmentPlanStatusConstants.INACTIVE:
        return 'bg-redSupport text-red'
      case bracesTreatmentPlanStatusConstants.PAUSED:
        return 'bg-orangeSupport text-orange'
      default:
        return 'text-tertiaryColor bg-tertiarySupport'
    }
  }

  return (
    <div
      className='border border-grayDisabled rounded-lg w-full flex justify-between items-center p-2.5 cursor-pointer'
      onClick={async () => {
        await dispatchAction(
          getBracesTreatmentPlan({
            doctorId: safeParseInt(userId),
            bracesJourneyId: safeParseInt(bracesTreatmentPlan.braces_journey_id),
          })
        )
        if (
          bracesTreatmentPlan.braces_treatment_stage === bracesTreatmentPlanStatusConstants.DRAFT
        ) {
          const queryParams = new URLSearchParams({
            isNew: 'true',
            new: 'false',
          }).toString()
          navigate(
            `/leads-profile/${patientId}/treatment/braces/old/setupTreatmentPlanBraces?${queryParams}`
          )
        } else {
          const queryParams = new URLSearchParams({
            bracesJourneyId: String(bracesTreatmentPlan.braces_journey_id),
            new: 'false',
            isUpdate: 'true',
            bracesTreatmentStage: bracesTreatmentPlanStatusConstants.ACTIVE,
          }).toString()
          navigate(
            `/leads-profile/${patientId}/treatment/braces/${bracesTreatmentPlan.braces_journey_id}/viewTreatmentPlanBraces?${queryParams}`
          )
        }
      }}
    >
      <div className='flex gap-5 text-textColor text-sm'>
        <div className='flex flex-col gap-4 justify-center'>
          <div className='flex flex-row w-full'>
            <div className='text-black font-semibold text-lg mr-4'>
              {capitalizeFirstLetter(bracesTreatmentPlan.treatment_name)}
            </div>
            <Tag
              value={capitalizeFirstLetter(bracesTreatmentPlan.braces_treatment_stage)}
              className={`${getTagClassName(
                bracesTreatmentPlan.braces_treatment_stage
              )} w-fit text-sm`}
            />
          </div>
          <div className='flex gap-1 font-medium items-center'>
            <CommonSVG svg={SVG_CALENDER} width='24' height='24' />
            Created on:
            <span className='font-semibold'>
              {moment(bracesTreatmentPlan.treatment_created_at).format('DD-MMM-YYYY') ?? '- -'}
            </span>
          </div>
        </div>
      </div>
      <button type='button'>
        <CommonSVG svg={SVG_EXPAND_RIGHT} height='20' width='20' className='cursor-pointer' />
      </button>
    </div>
  )
}

export default TreatmentPlanBracesCard
