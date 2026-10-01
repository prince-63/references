import useAllUserPlan from '@hooks/useAllUserPlan'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import clsx from 'clsx'
import InfoCard from 'components/instruction/InfoCard'
import {useSelector} from 'react-redux'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {RootState} from 'redux/store'
import getColorPalette from 'utils/getColorPalette'
import hasValue from 'utils/hasValue'

const NoPlansState = ({
  hasActivePlan,
  assignedToVendor,
  handleCreateTreatmentPlan,
}: {
  hasActivePlan: boolean
  assignedToVendor: boolean
  handleCreateTreatmentPlan: () => void
}) => {
  const {getIndividualTaskList, getAllTask} = useSelector((state: RootState) => state.workFlow)
  const {permissionChecks} = useFeatureAccess()
  const {isPractice} = useAllUserPlan()
  const {plansList} = useSelector((state: RootState) => state.kanban)
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
    (findNewCaseObjects(getIndividualTaskList) || hasValue(plansList?.plans_list)) &&
    !findIsTaskOutsourced(getAllTask)

  return (
    <>
      {isPractice && (
        <InfoCard
          title='The treatment plan is being prepared by the lab. Please wait while it is sent.'
          className='w-full text-primaryColor my-4'
        />
      )}
      <div className='flex flex-col items-center justify-center py-20'>
        <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          {/* icon placeholder */}
          <div className='text-3xl text-gray-400'>🗂️</div>
        </div>
        <div className='text-lg font-semibold text-textColor mb-2'>No Treatment Plans</div>
        <div className='text-sm text-gray-500 mb-4 text-center max-w-xl'>
          There are no treatment plans for this patient yet. Create a new treatment plan to get
          started.
        </div>

        {assignedToVendor && showTreatmentPlanButton && createPlanPermission && (
          <button
            disabled={hasActivePlan}
            title={
              hasActivePlan
                ? 'A plan is active — creating a new plan is disabled'
                : 'Create new treatment plan'
            }
            className={clsx('px-4 py-2 rounded font-medium', {
              'text-white': !hasActivePlan,
              'cursor-not-allowed text-gray-600': hasActivePlan,
            })}
            style={
              !hasActivePlan
                ? {background: getColorPalette().primaryColor}
                : {background: '#d1d5db'}
            }
            onClick={handleCreateTreatmentPlan}
          >
            + Create New Plan
          </button>
        )}
      </div>
    </>
  )
}
export default NoPlansState
