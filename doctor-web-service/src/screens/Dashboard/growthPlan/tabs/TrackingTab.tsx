import React from 'react'
import Section from '../components/Section'
import StatusPill from '../components/StatusPill'
import TabMetricItem from '../components/TabMetricItem'
import getColorPalette from 'utils/getColorPalette'

const TrackingTab = ({
  trackingTotal,
  growth,
  hideZero,
  goToAlignerTrackingByStage,
  goToAnalyticsWithCompliance,
  goToPatientsByAppConnection,
  goToAnalyticsPendingUpdates,
}: {
  trackingTotal: number
  growth: any
  hideZero: boolean
  goToAlignerTrackingByStage: (
    stage: 'Starting Soon' | 'Ongoing' | 'Paused' | 'In Refinement' | 'Completed'
  ) => void
  goToAnalyticsWithCompliance: (key: 'NEEDS_ATTENTION' | 'AT_RISK' | 'ON_TRACK') => void
  goToPatientsByAppConnection: (status: 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED') => void
  goToAnalyticsPendingUpdates: () => void
}) => {
  const pal = getColorPalette()
  return (
    <Section
      title={
        <>
          <span>TREATMENT TRACKING</span>
          <StatusPill count={trackingTotal} tone='info' />
        </>
      }
    >
      <div className='grid grid-cols-1 gap-4'>
        <div className='flex flex-col gap-4'>
          <div className='rounded-lg border border-lighterGray bg-white p-3 md:p-4'>
            <h4 className='text-sm font-semibold uppercase mb-2'>TREATMENT STAGES</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
              {(() => {
                const ps = (growth as any)?.treatment_stage || {}
                const list: [string, number][] = [
                  ['Starting Soon', ps.starting_soon ?? 0],
                  ['Ongoing', ps.ongoing ?? 0],
                  ['Paused', ps.paused ?? 0],
                  ['In Refinement', ps.in_refinement ?? 0],
                  ['Completed', ps.completed ?? 0],
                ]
                return list
              })()
                .filter(([, c]) => !hideZero || (c as number) > 0)
                .map(([name, count]) => {
                  const descMap: Record<string, string> = {
                    'Starting Soon': 'Ready to begin. Schedule visit and deliver aligners.',
                    Ongoing: 'Active aligner treatments currently in progress',
                    Paused: 'Treatment temporarily on hold',
                    'In Refinement': 'Additional aligners or adjustments required',
                    Completed: 'Finished treatments',
                  }
                  const isPaused = String(name) === 'Paused'
                  return (
                    <TabMetricItem
                      key={String(name)}
                      label={String(name)}
                      count={Number(count)}
                      tone='info'
                      subLabel={descMap[String(name)]}
                      subLabelColor={isPaused ? pal.red : undefined}
                      onClick={() => goToAlignerTrackingByStage(name as any)}
                    />
                  )
                })}
            </div>
          </div>
          {/* Patient Compliance Tracking */}
          <div className='rounded-lg border border-lighterGray bg-white p-3 md:p-4'>
            <h4 className='text-sm font-semibold uppercase mb-1'>PATIENT COMPLIANCE TRACKING</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
              {[
                [
                  'NEEDS ATTENTION',
                  (growth as any)?.patient_compliance?.needs_attention ?? 0,
                  'Aligner change overdue for 7+ days, immediate follow-up needed',
                  pal.red,
                ] as const,
                [
                  'AT RISK',
                  (growth as any)?.patient_compliance?.at_risk ?? 0,
                  'Aligner change overdue for < 7 days, monitor closely',
                  pal.red,
                ] as const,
                [
                  'ON TRACK',
                  (growth as any)?.patient_compliance?.on_track ?? 0,
                  'All aligner changes up to date, no action needed',
                  undefined,
                ] as const,
              ]
                .filter(([, c]) => !hideZero || (c as number) > 0)
                .map(([label, count, sub, color]) => (
                  <TabMetricItem
                    key={label}
                    label={String(label)}
                    count={Number(count)}
                    tone={
                      label === 'ON TRACK' ? 'success' : label === 'AT RISK' ? 'warning' : 'error'
                    }
                    subLabel={sub as string}
                    subLabelColor={color as string | undefined}
                    onClick={() =>
                      goToAnalyticsWithCompliance(
                        (label === 'ON TRACK'
                          ? 'ON_TRACK'
                          : label === 'AT RISK'
                            ? 'AT_RISK'
                            : 'NEEDS_ATTENTION') as 'NEEDS_ATTENTION' | 'AT_RISK' | 'ON_TRACK'
                      )
                    }
                  />
                ))}
            </div>
          </div>
          {/* App Connection */}
          <div className='rounded-lg border border-lighterGray bg-white p-3 md:p-4'>
            <h4 className='text-sm font-semibold uppercase mb-2'>APP CONNECTION</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
              {[
                [
                  'Connected',
                  'App installed and currently being used',
                  (growth as any)?.app_connection_status?.connected ?? 0,
                  'success',
                ] as const,
                [
                  'Pending',
                  'Invitation sent, patient has not yet registered',
                  (growth as any)?.app_connection_status?.pending ?? 0,
                  'warning',
                ] as const,
                [
                  'Not Connected',
                  'App invitation not sent',
                  (growth as any)?.app_connection_status?.not_connected ?? 0,
                  'error',
                ] as const,
              ].map(([title, sub, count, tone]) => (
                <TabMetricItem
                  key={title}
                  label={title}
                  subLabel={sub}
                  count={Number(count)}
                  tone={tone as 'success' | 'warning' | 'error' | 'info'}
                  onClick={() =>
                    goToPatientsByAppConnection(
                      (title === 'Connected'
                        ? 'CONNECTED'
                        : title === 'Pending'
                          ? 'PENDING'
                          : 'NOT_CONNECTED') as 'CONNECTED' | 'PENDING' | 'NOT_CONNECTED'
                    )
                  }
                />
              ))}
            </div>
          </div>
          {/* Pending Updates */}
          <div className='rounded-lg border border-lighterGray bg-white p-3 md:p-4'>
            <h4 className='text-sm font-semibold uppercase mb-1'>PENDING UPDATES</h4>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
              {(() => {
                const count = Number(
                  (growth as any)?.pending_updates?.unique_patients_with_pending_updates ?? 0
                )
                if (hideZero && count <= 0) return null
                return (
                  <TabMetricItem
                    key={'ALIGNER CHANGES & CHECK INS'}
                    label={'ALIGNER CHANGES & CHECK INS'}
                    count={count}
                    tone='info'
                    subLabel={'Aligner changes and check-ins pending review'}
                    onClick={goToAnalyticsPendingUpdates}
                  />
                )
              })()}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

export default TrackingTab
