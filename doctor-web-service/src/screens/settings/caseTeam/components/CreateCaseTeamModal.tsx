import AntdButton from 'components/atom/Buttons/AntdButton'
import FormikInput from 'components/atom/Inputs/FormikInput'
import {Form, Formik, FormikHelpers} from 'formik'
import {Modal} from 'antd'
import InternalUsersChecklist from './InternalUsersChecklist'
import {CaseTeamFormValues, InternalUserOption} from '../caseTeam.types'
import {CreateCaseTeamRequest} from 'redux/Slices/AppSlice/CaseTeam/caseTeam.slice'

interface CreateCaseTeamModalProps {
  open: boolean
  loading: boolean
  internalUsers: InternalUserOption[]
  onClose: () => void
  onCreateCaseTeam: (payload: CreateCaseTeamRequest) => Promise<void>
}

const buildSelectionMap = (users: InternalUserOption[]) => {
  return users.reduce(
    (acc, user) => {
      acc[String(user.user_profile_id)] = false
      return acc
    },
    {} as Record<string, boolean>
  )
}

const CreateCaseTeamModal = ({
  open,
  loading,
  internalUsers,
  onClose,
  onCreateCaseTeam,
}: CreateCaseTeamModalProps) => {
  const initialValues: CaseTeamFormValues = {
    team_name: '',
    description: '',
    selected_internal_users: buildSelectionMap(internalUsers),
  }

  const handleSubmit = async (
    values: CaseTeamFormValues,
    helpers: FormikHelpers<CaseTeamFormValues>
  ) => {
    const selectedMemberIds = Object.entries(values.selected_internal_users)
      .filter(([, selected]) => selected)
      .map(([id]) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0)

    if (!values.team_name.trim()) {
      helpers.setFieldError('team_name', 'Case team name is required.')
      return
    }

    if (selectedMemberIds.length === 0) {
      helpers.setFieldError('selected_internal_users', 'Select at least one internal user.')
      return
    }

    try {
      await onCreateCaseTeam({
        team_name: values.team_name.trim(),
        description: values.description?.trim() || '',
        member_user_profile_ids: selectedMemberIds,
      })

      helpers.resetForm({
        values: {
          team_name: '',
          description: '',
          selected_internal_users: buildSelectionMap(internalUsers),
        },
      })
    } catch (error) {
      return
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      title='Create Case Team'
      width={700}
    >
      <Formik initialValues={initialValues} enableReinitialize onSubmit={handleSubmit}>
        {({isSubmitting}) => (
          <Form className='flex flex-col gap-4 pt-2'>
            <FormikInput
              name='team_name'
              label='Team Name'
              placeholder='Enter case team name'
              maxLength={80}
            />

            <FormikInput
              name='description'
              label='Description'
              placeholder='Add description (optional)'
              maxLength={200}
            />

            <InternalUsersChecklist users={internalUsers} />

            <div className='flex justify-end gap-2'>
              <AntdButton
                text='Cancel'
                htmlType='button'
                onClick={onClose}
                className='h-10 px-5 w-fit rounded-md bg-white text-textColor border border-mediumGray hover:!bg-white hover:!text-textColor'
              />
              <AntdButton
                text='Create Case Team'
                htmlType='submit'
                isLoading={loading || isSubmitting}
                isDisabled={internalUsers.length === 0 || loading || isSubmitting}
                className='h-10 px-5 w-fit rounded-md bg-primaryColor text-white font-semibold hover:bg-primaryColor'
              />
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}

export default CreateCaseTeamModal
