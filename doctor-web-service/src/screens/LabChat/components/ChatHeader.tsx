import {Dropdown} from 'antd'
import type {MenuProps} from 'antd'
import {ArrowLeft, MessageSquareText, MoreVertical} from 'lucide-react'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {LabChatProgress, LabChatThread} from '../types'

interface ChatHeaderProps {
  selectedThread: LabChatThread
  selectedThreadProgress: LabChatProgress | null
  onBackToList: () => void
  onGroupInfoClick: () => void
  onAssignCaseTeamClick: () => void
  compact?: boolean
  isCheckInInProgress?: boolean
}

export const ChatHeader = ({
  selectedThread,
  selectedThreadProgress,
  onBackToList,
  onGroupInfoClick,
  onAssignCaseTeamClick,
  compact = false,
  isCheckInInProgress = false,
}: ChatHeaderProps) => {
  const {isEnterprisePlanUser} = useAllUserPlan()
  const progressLabel =
    selectedThreadProgress &&
    selectedThreadProgress.alignerNumber > 0 &&
    selectedThreadProgress.totalAligners > 0
      ? `Aligner ${selectedThreadProgress.alignerNumber} of ${selectedThreadProgress.totalAligners}`
      : 'Aligner -- of --'
  const progressPercentage = selectedThreadProgress?.progressPercentage ?? 0
  const shouldShowProgress = Number.isFinite(progressPercentage) && progressPercentage > 0
  const patientAddedByName = String(selectedThread?.patient_added_by_name ?? '').trim()
  const shouldShowPatientAddedByName = isEnterprisePlanUser && patientAddedByName.length > 0
  const actionItems: MenuProps['items'] = [
    {
      key: 'group-info',
      label: <span aria-label='Group info'>Group info</span>,
      onClick: onGroupInfoClick,
    },
    ...(isEnterprisePlanUser
      ? [
          {
            key: 'assign-case-team',
            label: <span aria-label='Assign case-team'>Assign case-team</span>,
            onClick: onAssignCaseTeamClick,
          },
        ]
      : []),
  ]

  if (compact) {
    return (
      <div className='shrink-0 border-b border-gray-200 px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <MessageSquareText size={18} className='text-primaryColor' />
          <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wide'>Case Chat</h3>
        </div>
        <div className='flex items-center gap-3'>
          <span className='h-2.5 w-2.5 rounded-full bg-green-500' />
          {isEnterprisePlanUser ? (
            <Dropdown menu={{items: actionItems}} trigger={['click']} placement='bottomRight'>
              <button
                type='button'
                disabled={isCheckInInProgress}
                className='inline-flex items-center justify-center text-gray-400 transition-colors hover:text-gray-600'
                aria-label='Chat actions'
                title='Chat actions'
              >
                <MoreVertical className='h-4 w-4' />
              </button>
            </Dropdown>
          ) : (
            <MoreVertical className='h-4 w-4 text-gray-400' />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='shrink-0 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-4 py-4 md:px-6'>
      <div className='mb-3 md:hidden'>
        <button
          type='button'
          onClick={onBackToList}
          className='inline-flex items-center gap-2 text-sm font-medium text-gray-700'
          disabled={isCheckInInProgress}
        >
          <ArrowLeft className='h-4 w-4' />
          Back to patients
        </button>
      </div>

      <div className='flex items-start justify-between gap-3'>
        <div className='flex-1'>
          <div className='mb-3 flex items-center gap-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primaryColor text-lg font-semibold text-white'>
              {selectedThread.patientInitials}
            </div>
            <div>
              <h2 className='text-xl font-bold text-gray-900 md:text-2xl'>
                {selectedThread.patientName}
              </h2>
              <p className='mt-0.5 text-sm text-gray-500'>
                {!!selectedThread.customer_mapped_id && selectedThread.customer_mapped_id}
              </p>
              {shouldShowPatientAddedByName || shouldShowProgress ? (
                <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs md:text-sm'>
                  {shouldShowPatientAddedByName ? (
                    <div className='inline-flex items-center gap-1'>
                      <span className='font-medium text-gray-900'>{patientAddedByName}</span>
                    </div>
                  ) : null}
                  {shouldShowProgress ? (
                    <div className='inline-flex items-center gap-2'>
                      <span className='font-semibold uppercase tracking-wide text-gray-500'>
                        Progress:
                      </span>
                      <span className='font-medium text-gray-900'>{progressLabel}</span>
                      <div className='h-2 w-24 overflow-hidden rounded-full bg-gray-200 md:w-32'>
                        <div
                          className='h-full bg-primaryColor'
                          style={{width: `${progressPercentage}%`}}
                        />
                      </div>
                      <span className='text-xs text-gray-500'>{progressPercentage}%</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        {isEnterprisePlanUser ? (
          <Dropdown menu={{items: actionItems}} trigger={['click']} placement='bottomRight'>
            <button
              type='button'
              disabled={isCheckInInProgress}
              className='inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800'
              aria-label='Chat actions'
              title='Chat actions'
            >
              <MoreVertical className='h-5 w-5' />
            </button>
          </Dropdown>
        ) : null}
      </div>
    </div>
  )
}
