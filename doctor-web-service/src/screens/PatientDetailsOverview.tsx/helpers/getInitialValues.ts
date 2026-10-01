import {TaskCardTask} from '../components/TaskCard'

export default (task: TaskCardTask | null) => {
  return {
    title: task?.title ?? '',
    description: task?.description ?? null,
    assign_id: task?.assignee_profile_id ?? '',
    due_date: task?.due_date ?? '',
    status: task?.status ?? 'PENDING',
  }
}
