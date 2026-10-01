import React from 'react'
import useActiveProfile from '@hooks/useActiveProfile'
import MetricCardForPractice from '../components/MetricCardForPractice'
import useDashboard from '@hooks/useDashboard'
import AlignerChangesAndCheckInsIcon from 'assets/icons/AlignerChangesAndCheckInsIcon'
import ApprovePlanIcon from 'assets/icons/ApprovePlanIcon'
import AtRiskIcon from 'assets/icons/AtRiskIcon'
import InvitationsPendingIcon from 'assets/icons/InvitationsPendingIcon'
import MoveToProductionIcon from 'assets/icons/MoveToProductionIcon'
import NeedsAttentionIcon from 'assets/icons/NeedsAttentionIcon'
import NotePadIcon2 from 'assets/icons/NotePadIcon2'
import StartingSoonIcon from 'assets/icons/StartingSoonIcon'
import {useNavigate} from 'react-router-dom'
import When from 'components/when/When'

const PracticeHeaderMetrics = ({
  goToAlignerTrackingByStage,
  goToAnalyticsWithCompliance,
  goToAnalyticsPendingUpdates,
  goToPatientsByAppConnection,
}: {
  goToAlignerTrackingByStage: (
    status: 'Starting Soon' | 'Ongoing' | 'Paused' | 'In Refinement' | 'Completed'
  ) => void
  goToAnalyticsWithCompliance: (status: 'NEEDS_ATTENTION' | 'AT_RISK' | 'ON_TRACK') => void
  goToAnalyticsPendingUpdates: () => void
  goToPatientsByAppConnection: (status: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED') => void
}) => {
  const {practice_connected_to_org, enterprise_plan, growth_plan} = useDashboard()
  const navigate = useNavigate()
  const growth =
    (practice_connected_to_org as any) ?? (enterprise_plan as any) ?? (growth_plan as any)
  const {customerTrackingEnabled} = useActiveProfile()

  return (
    <div className='flex flex-col gap-2'>
      <h3 className='text-sm md:text-base font-semibold'>CORE TASKS</h3>
      <div className='text-xs -mt-1 mb-1 text-textColor'>
        Priority actions requiring your attention
      </div>
      {(() => {
        const core_task = (practice_connected_to_org as any)?.coretask || {}
        const patient_compliance = (practice_connected_to_org as any)?.patient_compliance

        return (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3'>
            <MetricCardForPractice
              label='NEW CASE'
              description='Ready for lab submission'
              value={
                core_task?.new_case ??
                (practice_connected_to_org as any)?.my_tasks?.confirm_and_send_cases ??
                (practice_connected_to_org as any)?.my_tasks?.confirm_and_send_case ??
                0
              }
              onClick={() => navigate('/aligner-orders?workFlow=new-case')}
              icon={<NotePadIcon2 />}
            />
            <MetricCardForPractice
              label='APPROVE PLAN'
              description='Plans awaiting review'
              value={
                core_task?.approve_plan ??
                (practice_connected_to_org as any)?.my_tasks?.approve_treatment_plan ??
                0
              }
              onClick={() =>
                navigate(
                  `/aligner-orders?workFlow=planning-outsource&view=kanban&status=${encodeURIComponent(
                    'In Review'
                  )}`
                )
              }
              icon={<ApprovePlanIcon />}
            />
            <MetricCardForPractice
              label='MOVE TO PRODUCTION'
              description='Send to manufacturing'
              value={
                core_task?.move_to_production ??
                (practice_connected_to_org as any)?.my_tasks?.finalize_treatment_plan ??
                0
              }
              onClick={() =>
                navigate(
                  `/aligner-orders?workFlow=planning-outsource&view=kanban&status=${encodeURIComponent(
                    'Approved'
                  )}`
                )
              }
              icon={<MoveToProductionIcon />}
            />
            <When isTrue={customerTrackingEnabled!}>
              <MetricCardForPractice
                label='STARTING SOON'
                description='Ready to begin. Schedule visit and deliver aligners.'
                value={
                  core_task?.starting_soon ??
                  (practice_connected_to_org as any)?.patients_summary?.starting_soon ??
                  0
                }
                onClick={() => goToAlignerTrackingByStage('Starting Soon')}
                icon={<StartingSoonIcon />}
              />
              <MetricCardForPractice
                label='NEEDS ATTENTION'
                description='7+ day aligner change delay, follow-up immediately'
                value={Number(patient_compliance?.needs_attention ?? 0)}
                onClick={() => goToAnalyticsWithCompliance('NEEDS_ATTENTION')}
                icon={<NeedsAttentionIcon />}
              />
              <MetricCardForPractice
                label='AT RISK'
                description='< 7 day aligner change delay, monitor closely'
                value={Number(patient_compliance?.at_risk ?? 0)}
                onClick={() => goToAnalyticsWithCompliance('AT_RISK')}
                icon={<AtRiskIcon />}
              />
              <MetricCardForPractice
                label='ALIGNER CHANGES & CHECK-INS'
                description='Aligner changes and check-ins pending review'
                value={
                  core_task?.aligner_changes_and_check_ins ??
                  Number(
                    (growth as any)?.pending_updates?.unique_patients_with_pending_updates ??
                      (practice_connected_to_org as any)?.my_tasks?.aligner_updates ??
                      0
                  )
                }
                onClick={goToAnalyticsPendingUpdates}
                icon={<AlignerChangesAndCheckInsIcon />}
              />
            </When>

            <MetricCardForPractice
              label='INVITATIONS PENDING'
              description='App invitation pending'
              value={
                core_task?.invitation_pending ??
                Number((growth as any)?.app_connection_status?.pending ?? 0)
              }
              onClick={() => goToPatientsByAppConnection('PENDING')}
              icon={<InvitationsPendingIcon />}
            />
          </div>
        )
      })()}
    </div>
  )
}

export default PracticeHeaderMetrics
