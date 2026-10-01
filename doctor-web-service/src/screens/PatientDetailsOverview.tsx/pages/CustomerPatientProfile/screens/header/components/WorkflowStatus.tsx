import {StatusBadge} from '@utils/getStatusConfig'
import {PatientTaskDetails} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import WorkflowStatusSelector from 'screens/Kanban/components/WorkflowStatusSelector'

const WorkflowStatus = ({
  task,
  patientId,
  fallbackStatus,
}: {
  task: PatientTaskDetails | null
  patientId?: string
  fallbackStatus: string | null
}) => {
  if (!task) return <StatusBadge status={fallbackStatus} />

  return (
    <WorkflowStatusSelector
      taskId={task.id}
      patientId={patientId}
      workflowId={task.workflow_id}
      workflowName={task.workflow_name}
      currentStatusId={task.current_workflow_status_id}
      currentStatusLabel={task.current_workflow_status_label_name}
      taskDetails={task}
      className='!min-w-[180px]'
    />
  )
}

export default WorkflowStatus
