import ModalLayout from 'components/modal/ModalLayout'
import Spinner from 'components/spinner/Spinner'
import {CreateCaseTeamResponse} from 'redux/Slices/AppSlice/CaseTeam/caseTeam.slice'

interface AssignCaseTeamModalProps {
  isOpen: boolean
  onClose: () => void
  caseTeams: CreateCaseTeamResponse[]
  loading: boolean
  assignLoading: boolean
  errorMessage: string | null
  onRetry: () => void
  onSelectCaseTeam: (caseTeamId: number) => void
}

export const AssignCaseTeamModal = ({
  isOpen,
  onClose,
  caseTeams,
  loading,
  assignLoading,
  errorMessage,
  onRetry,
  onSelectCaseTeam,
}: AssignCaseTeamModalProps) => {
  if (!isOpen) return null

  return (
    <ModalLayout
      className='w-[520px] max-w-[96vw] max-h-[80vh]'
      title='Assign case-team'
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

      {!loading && !errorMessage && caseTeams.length === 0 ? (
        <div className='rounded-md border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-600'>
          No case teams found.
        </div>
      ) : null}

      {!loading && !errorMessage && caseTeams.length > 0 ? (
        <div className='space-y-3'>
          <p className='text-sm text-gray-600'>Select a case team to assign it to this chat.</p>
          <div className='space-y-2'>
            {caseTeams.map((caseTeam) => (
              <button
                key={caseTeam.id}
                type='button'
                disabled={assignLoading}
                onClick={() => onSelectCaseTeam(caseTeam.id)}
                className='flex w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-3 text-left hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
              >
                <div>
                  <p className='text-sm font-semibold text-gray-900'>
                    {caseTeam.team_name || '--'}
                  </p>
                  <p className='mt-0.5 text-xs text-gray-600'>
                    {caseTeam.member_count ?? 0} member
                    {(caseTeam.member_count ?? 0) === 1 ? '' : 's'}
                  </p>
                </div>
                <span className='text-xs font-medium text-primaryColor'>
                  {assignLoading ? 'Assigning...' : 'Assign'}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </ModalLayout>
  )
}

export default AssignCaseTeamModal
