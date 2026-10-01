import {useFeatureAccess} from '@hooks/useFeatureAccess'
import clsx from 'clsx'
import When from 'components/when/When'
import {useSelector} from 'react-redux'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'
import TabHeader from '../items/TabHeader'
import useAllUserPlan from '@hooks/useAllUserPlan'

const PlansListHeader = ({
  hasActivePlan,
  assignedToVendor,
  handleCreateTreatmentPlan,
}: {
  hasActivePlan: boolean
  assignedToVendor: boolean
  handleCreateTreatmentPlan: () => void
}) => {
  const palette = getColorPalette()
  const {getIndividualTaskList, getAllTask} = useSelector((state: RootState) => state.workFlow)
  const {permissionChecks} = useFeatureAccess()
  const {isStarterPlanUser} = useAllUserPlan()
  const createPlanPermission = permissionChecks?.patientProfileActions?.createNewPlan?.isViewable
  const findNewCaseObjects = (
    cases: PatientTaskDetails[] | PatientTaskDetails | null | undefined
  ): boolean => {
    const list = Array.isArray(cases) ? cases : cases ? [cases as PatientTaskDetails] : []
    return list.some((caseItem) => caseItem?.workflow_name !== 'New Case')
  }

  const findIsTaskOutsourced = (
    cases: PatientTaskDetails[] | PatientTaskDetails | null | undefined
  ): boolean => {
    const list = Array.isArray(cases) ? cases : cases ? [cases as PatientTaskDetails] : []
    return list.some((caseItem) => caseItem?.workflow_name === 'Plan Outsourced')
  }

  const showTreatmentPlanButton =
    findNewCaseObjects(getIndividualTaskList) && !findIsTaskOutsourced(getAllTask)

  return (
    <div className='mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
      <TabHeader
        title='Treatment Plans'
        description='Monitor the progress and status of all treatment plans.'
      />
      <When
        isTrue={
          (assignedToVendor && showTreatmentPlanButton && createPlanPermission) || isStarterPlanUser
        }
      >
        <button
          disabled={hasActivePlan}
          title={
            hasActivePlan
              ? 'A plan is active — creating a new plan is disabled'
              : 'Create new treatment plan'
          }
          className={clsx(
            'w-full rounded-lg px-4 py-3 text-center font-semibold md:w-auto md:font-medium',
            {
              'text-white': !hasActivePlan,
              'cursor-not-allowed text-gray-600': hasActivePlan,
            }
          )}
          style={
            !hasActivePlan
              ? {background: palette.primaryColor}
              : {background: '#d1d5db', color: '#4b5563'}
          }
          onClick={handleCreateTreatmentPlan}
        >
          Create New Plan
        </button>
      </When>
    </div>
  )
}

export default PlansListHeader
