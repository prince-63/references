import treatmentPlanStatusConstants from '@constants/treatmentPlanStatus.constants'
import {getPlanStatus} from '@utils/getPlanStatus'
import When from 'components/when/When'
import moment from 'moment'
import {useNavigate} from 'react-router-dom'
import InfoCard from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCard'
import InfoCardWithContainer from 'screens/Patients/LeadsProfile/main/alignersTracking/components/InfoCardWithContainer'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import getColorPalette from 'utils/getColorPalette'

const ViewPlanInfoCards = ({treatmentPlan}: {treatmentPlan: ITreatmentPlan}) => {
  const navigate = useNavigate()

  const treatmentStatus = getPlanStatus({
    treatmentPlan,
  }) as keyof typeof treatmentPlanStatusConstants

  return (
    <div>
      {' '}
      <When isTrue={treatmentPlan.initiator_status === treatmentPlanStatusConstants.RE_PLAN}>
        <InfoCardWithContainer
          title={`Revision Requested on ${moment(treatmentPlan?.order_status_changed_at).format('DD-MMM-YYYY')}`}
          className='flex md:!justify-between !justify-start border !border-[#F45045]'
          titleClassName='!text-black font-semibold'
          topSectionClassName='bg-[#FEF4F4] rounded-t-xl'
          infoIconColor='#F45045'
          remarksClassName='!bg-transparent'
          hideDismissButton
          remarks={
            <div className='w-full font-medium text-sm break-words'>
              <div
                className='
    text-textColor
    font-figtree
    font-medium
    text-[14px]
    leading-[20px]
    tracking-[0.01em]
  '
              >
                Comment:
              </div>

              {treatmentPlan?.treatment_plan_metadata?.replan_reason ?? '-'}
            </div>
          }
          showRemarksTitle={false}
        />
      </When>
      <When isTrue={treatmentPlan.status === treatmentPlanStatusConstants.PAUSED}>
        <div className='mb-3'>
          <InfoCard
            {...{
              buttonText: 'Take me there',
              iconColor: getColorPalette().primaryColor,
              buttonClassName: 'hidden md:flex ml-6',
              title: 'Treatment paused!',
              content:
                'If you want to resume the treatment you can by going to the aligner tracking page',
              onClick: () => {
                navigate(
                  `/leads-profile/${treatmentPlan?.patient_id}/${treatmentPlan.aligner_journey_id}/alignersTracking`
                )
              },
            }}
          />
        </div>
      </When>
      <When
        isTrue={
          treatmentPlan.status === treatmentPlanStatusConstants.DRAFT &&
          treatmentPlan?.initiator_status === treatmentPlanStatusConstants.APPROVED
        }
      >
        <div className='mb-3'>
          <InfoCard
            className='border border-[#735bf2] bg-[#f5f4fe] text-sm font-normal'
            titleClassName='text-black text-sm font-medium'
            title={`This treatment plan was approved on ${moment(
              treatmentPlan?.updated_at ?? treatmentPlan?.order_status_changed_at
            ).format('DD-MMM-YYYY')}`}
            showButton={false}
          />
        </div>
      </When>
      <When isTrue={treatmentStatus === treatmentPlanStatusConstants.SENT_FOR_APPROVAL}>
        <div className='mb-3'>
          <InfoCard
            className='border border-orange bg-orangeSupport text-sm font-normal'
            infoIconColor='#BE8901'
            titleClassName='text-black text-sm font-medium'
            title={`This treatment plan was sent for approval on ${moment(
              treatmentPlan?.updated_at
            ).format('DD-MMM-YYYY')}`}
            showButton={false}
          />
        </div>
      </When>
      <When isTrue={treatmentPlan.status === treatmentPlanStatusConstants.ARCHIVED}>
        <div className='mb-3'>
          <InfoCard
            className='border border-orange bg-orangeSupport text-sm font-normal'
            titleClassName='text-black text-sm font-medium'
            infoIconColor='#BE8901'
            title={`This treatment plan was archived on ${moment(treatmentPlan?.updated_at).format(
              'DD-MMM-YYYY'
            )}`}
            showButton={false}
          />
        </div>
      </When>
      <When isTrue={treatmentPlan.status === treatmentPlanStatusConstants.DEACTIVATED}>
        <div className='mb-3'>
          <InfoCard
            {...{
              content: (
                <p>
                  This treatment was deactivated on{' '}
                  <span className='font-bold'>
                    {moment(treatmentPlan?.deactivated_at).format('DD-MMM-YYYY')}
                  </span>
                  . Reason: {treatmentPlan?.reason_for_deactivation}
                  {treatmentPlan?.deactivatedRemarks && (
                    <div>Remarks : {treatmentPlan?.deactivatedRemarks}</div>
                  )}
                </p>
              ),
              title: 'Treatment deactivated!',
              className: 'bg-redSupport ',
              titleClassName: 'text-red font-semibold',
              showButton: false,
              infoIconColor: '#F45045',
            }}
          />
        </div>
      </When>
    </div>
  )
}

export default ViewPlanInfoCards
