import FormikCheckBox from 'components/atom/Inputs/FormikCheckBox'
import {useFormikContext} from 'formik'
import {CaseTeamFormValues, InternalUserOption} from '../caseTeam.types'

interface InternalUsersChecklistProps {
  users: InternalUserOption[]
}

const InternalUsersChecklist = ({users}: InternalUsersChecklistProps) => {
  const {errors, values, submitCount} = useFormikContext<CaseTeamFormValues>()

  const selectedUsersCount = Object.values(values.selected_internal_users ?? {}).filter(
    Boolean
  ).length
  const hasServerOrValidationError = Boolean(errors.selected_internal_users)
  const showSelectionError =
    (submitCount > 0 && selectedUsersCount === 0) || hasServerOrValidationError

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center justify-between'>
        <p className='text-base font-medium text-textColor'>Internal Users</p>
        <p className='text-xs font-medium text-mediumGray'>{selectedUsersCount} selected</p>
      </div>

      {users.length === 0 ? (
        <div className='rounded-md border border-lightGray px-3 py-2 text-sm text-mediumGray'>
          No internal users found.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {users.map((user) => (
            <div
              key={user.user_profile_id}
              className='rounded-md border border-lightGray px-3 py-2'
            >
              <FormikCheckBox
                name={`selected_internal_users.${user.user_profile_id}`}
                className='w-full'
                label={
                  <div className='flex flex-col'>
                    <span className='text-sm font-medium text-textColor'>{user.name}</span>
                    <span className='text-xs font-normal text-mediumGray'>{user.email}</span>
                    <span className='text-xs font-normal text-mediumGray'></span>
                  </div>
                }
              />
            </div>
          ))}
        </div>
      )}

      {showSelectionError && (
        <div className='text-xs text-red'>
          Select at least one internal user to create a case team.
        </div>
      )}
    </div>
  )
}

export default InternalUsersChecklist
