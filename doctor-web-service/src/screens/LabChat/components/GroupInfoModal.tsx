import ModalLayout from 'components/modal/ModalLayout'
import Spinner from 'components/spinner/Spinner'
import {LabChatByIdResponse} from 'redux/Slices/AppSlice/LabChat/LabChat.slice'

interface GroupInfoModalProps {
  isOpen: boolean
  onClose: () => void
  chatInfo: LabChatByIdResponse | null
  loading: boolean
  errorMessage: string | null
  onRetry: () => void
}

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '--'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--'
  return date.toLocaleString()
}

const getBooleanLabel = (value: boolean) => (value ? 'Yes' : 'No')

const InfoRow = ({label, value}: {label: string; value: string | number}) => (
  <div className='flex items-start justify-between gap-4 border-b border-gray-100 py-2 text-sm'>
    <span className='font-medium text-gray-600'>{label}</span>
    <span className='text-right text-gray-900'>{value}</span>
  </div>
)

export const GroupInfoModal = ({
  isOpen,
  onClose,
  chatInfo,
  loading,
  errorMessage,
  onRetry,
}: GroupInfoModalProps) => {
  if (!isOpen) return null

  return (
    <ModalLayout
      className='w-[760px] max-w-[96vw] max-h-[88vh]'
      title='Group info'
      onClose={onClose}
    >
      {loading ? (
        <div className='rounded-md border border-gray-200 bg-gray-50 px-4 py-6'>
          <Spinner loading />
        </div>
      ) : null}

      {!loading && errorMessage ? (
        <div className='rounded-md border border-red-200 bg-red-50 px-4 py-4'>
          <p className='text-sm text-red-700'>{errorMessage}</p>
          <button
            type='button'
            onClick={onRetry}
            className='mt-3 rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100'
          >
            Retry
          </button>
        </div>
      ) : null}

      {!loading && !errorMessage && !chatInfo ? (
        <div className='rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600'>
          No group details available.
        </div>
      ) : null}

      {!loading && !errorMessage && chatInfo ? (
        <div className='space-y-6'>
          <section className='rounded-md border border-gray-200 p-4'>
            <h3 className='mb-3 text-base font-semibold text-gray-900'>Basic details</h3>
            <InfoRow label='Chat Name' value={chatInfo.chat_name || '--'} />
          </section>

          <section className='rounded-md border border-gray-200 p-4'>
            <h3 className='mb-3 text-base font-semibold text-gray-900'>Participants</h3>
            {Array.isArray(chatInfo.participants) && chatInfo.participants.length > 0 ? (
              <div className='space-y-3'>
                {chatInfo.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className='rounded-md border border-gray-100 bg-gray-50 p-3'
                  >
                    <p className='text-sm font-semibold text-gray-900'>
                      {participant.user_name || '--'}
                    </p>
                    <p className='mt-1 text-xs text-gray-600'>{participant.user_email || '--'}</p>
                    <div className='mt-2 grid grid-cols-1 gap-2 text-xs text-gray-700 md:grid-cols-2'>
                      <span>Added Via Team: {participant.added_via_case_team_name || '--'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-600'>No participants found.</p>
            )}
          </section>

          <section className='rounded-md border border-gray-200 p-4'>
            <h3 className='mb-3 text-base font-semibold text-gray-900'>Case Teams</h3>
            {Array.isArray(chatInfo.case_teams) && chatInfo.case_teams.length > 0 ? (
              <div className='space-y-3'>
                {chatInfo.case_teams.map((caseTeam) => (
                  <div
                    key={caseTeam.id}
                    className='rounded-md border border-gray-100 bg-gray-50 p-3'
                  >
                    <p className='text-sm font-semibold text-gray-900'>
                      {caseTeam.team_name || '--'}
                    </p>
                    <div className='mt-2 grid grid-cols-1 gap-2 text-xs text-gray-700 md:grid-cols-2'>
                      <span>Active: {getBooleanLabel(!!caseTeam.is_active)}</span>
                      <span>Members: {caseTeam.member_count ?? 0}</span>
                      <span>Created At: {formatDateTime(caseTeam.created_at)}</span>
                      <span>Description: {caseTeam.description || '--'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-600'>No case teams found.</p>
            )}
          </section>
        </div>
      ) : null}
    </ModalLayout>
  )
}

export default GroupInfoModal
