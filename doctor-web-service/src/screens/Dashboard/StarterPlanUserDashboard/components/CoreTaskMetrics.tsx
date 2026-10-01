import useDashboard from '@hooks/useDashboard'
import AlignerChangesAndCheckInsIcon from 'assets/icons/AlignerChangesAndCheckInsIcon'
import AtRiskIcon from 'assets/icons/AtRiskIcon'
import InvitationsPendingIcon from 'assets/icons/InvitationsPendingIcon'
import NeedsAttentionIcon from 'assets/icons/NeedsAttentionIcon'
import MetricCardForPractice from 'screens/Dashboard/growthPlan/components/MetricCardForPractice'

const CoreTaskMetrics = ({
  goToAnalyticsWithCompliance,
  goToAnalyticsPendingUpdates,
  goToPatientsByAppConnection,
}: {
  goToAnalyticsWithCompliance: (status: 'NEEDS_ATTENTION' | 'AT_RISK' | 'ON_TRACK') => void
  goToAnalyticsPendingUpdates: () => void
  goToPatientsByAppConnection: (status: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED') => void
}) => {
  const {starter_plan} = useDashboard()

  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm md:text-base font-semibold'>CORE TASKS</h3>
      <div className='text-xs -mt-1 mb-1 text-textColor'>
        Priority actions requiring your attention
      </div>
      {(() => {
        const core_task = starter_plan?.core_task

        return (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3'>
            <MetricCardForPractice
              label='NEEDS ATTENTION'
              description='7+ day aligner change delay, follow-up immediately'
              value={Number(core_task?.needs_attention ?? 0)}
              onClick={() => goToAnalyticsWithCompliance('NEEDS_ATTENTION')}
              icon={<NeedsAttentionIcon />}
            />
            <MetricCardForPractice
              label='AT RISK'
              description='< 7 day aligner change delay, monitor closely'
              value={Number(core_task?.at_risk ?? 0)}
              onClick={() => goToAnalyticsWithCompliance('AT_RISK')}
              icon={<AtRiskIcon />}
            />
            <MetricCardForPractice
              label='ALIGNER CHANGES & CHECK-INS'
              description='Aligner changes and check-ins pending review'
              value={core_task?.aligner_change_and_checkin ?? 0}
              onClick={goToAnalyticsPendingUpdates}
              icon={<AlignerChangesAndCheckInsIcon />}
            />

            <MetricCardForPractice
              label='INVITATIONS PENDING'
              description='App invitation pending'
              value={core_task?.invitation_pending ?? 0}
              onClick={() => goToPatientsByAppConnection('PENDING')}
              icon={<InvitationsPendingIcon />}
            />
          </div>
        )
      })()}
    </div>
  )
}

export default CoreTaskMetrics
