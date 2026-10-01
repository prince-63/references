import reducer, {
  resetWorkflow,
  setAlignerWorkflow,
  getWorkFlow,
  getCardConfiguration,
  getAuditLogs,
  getNewWorkflow,
  getIndividualTask,
} from './workflow.slice'

describe('workflow.slice reducer', () => {
  const baseState = reducer(undefined, {type: 'init'})

  it('sets and resets aligner workflow metadata', () => {
    const aligner = [{id: '1', name: 'A', label: 'A', statuses: []}] as any
    const populated = reducer(baseState, setAlignerWorkflow(aligner))
    expect(populated.aligner).toEqual(aligner)
    expect(populated.source).toBe('redux')
    expect(typeof populated.updatedAt).toBe('number')

    const cleared = reducer(populated, resetWorkflow())
    expect(cleared.aligner).toEqual([])
    expect(cleared.source).toBe('unknown')
    expect(cleared.updatedAt).toBeUndefined()
  })

  it('handles workflow fetch lifecycle flags', () => {
    const pending = reducer(baseState, getWorkFlow.pending('req', {order_type: 'ALIGNER'} as any))
    expect(pending.loadingWorkFlow).toBe(true)

    const payload = [{id: 'w1'}] as any
    const fulfilled = reducer(
      pending,
      getWorkFlow.fulfilled(payload, 'req', {order_type: 'ALIGNER'} as any)
    )
    expect(fulfilled.loadingWorkFlow).toBe(false)
    expect(fulfilled.workFlowData).toEqual(payload)
  })

  it('stores card configuration and audit logs', () => {
    const fields = [{id: 1, label: 'Field'}] as any
    const withConfig = reducer(
      baseState,
      getCardConfiguration.fulfilled(fields, 'req', {profileId: 3} as any)
    )
    expect(withConfig.cardConfiguration).toEqual(fields)
    expect(withConfig.loadingCardConfiguration).toBe(false)

    const auditPayload = {
      content: [{id: 9}],
      pagination_details: {page_number: 1},
    } as any
    const withAudits = reducer(
      withConfig,
      getAuditLogs.fulfilled(auditPayload, 'req', {patient_id: 1} as any)
    )
    expect(withAudits.getAuditLogsList).toEqual(auditPayload.content)
    expect(withAudits.auditLogsPaginationDetails).toEqual(auditPayload.pagination_details)

    const afterError = reducer(
      withAudits,
      getAuditLogs.rejected('err' as any, 'req', {patient_id: 1} as any)
    )
    expect(afterError.loadingCardConfiguration).toBe(false)
    expect(afterError.auditLogsPaginationDetails).toBeNull()
  })

  it('handles new workflow creation lifecycle', () => {
    const pending = reducer(
      baseState,
      getNewWorkflow.pending('req', {
        kanban_name: 'X',
        kanban_header_name: 'Y',
        organization_id: 1,
      } as any)
    )
    expect(pending.loadingWorkFlow).toBe(true)

    const payload = {id: 'new'} as any
    const fulfilled = reducer(
      pending,
      getNewWorkflow.fulfilled(payload, 'req', {
        kanban_name: 'X',
        kanban_header_name: 'Y',
        organization_id: 1,
      } as any)
    )
    expect(fulfilled.loadingWorkFlow).toBe(false)
    expect(fulfilled.newWorkFlowData).toEqual(payload)
  })

  it('sets individual task lists from payload', () => {
    const pending = reducer(
      baseState,
      getIndividualTask.pending('req', {patient_id: 1, doctor_id: 2} as any)
    )
    expect(pending.loadingWorkFlow).toBe(true)

    const tasks = [
      {id: 1, patient_name: 'A'},
      {id: 2, patient_name: 'B'},
    ] as any
    const fulfilled = reducer(
      pending,
      getIndividualTask.fulfilled(tasks, 'req', {patient_id: 1, doctor_id: 2} as any)
    )
    expect(fulfilled.loadingWorkFlow).toBe(false)
    expect(fulfilled.getAllTask).toEqual(tasks)
    expect(fulfilled.getIndividualTaskList).toEqual(tasks[1])

    const rejected = reducer(
      fulfilled,
      getIndividualTask.rejected('err' as any, 'req', {patient_id: 1, doctor_id: 2} as any)
    )
    expect(rejected.loadingWorkFlow).toBe(false)
    expect(rejected.getAllTask).toEqual([])
    expect(rejected.getIndividualTaskList).toBeNull()
  })
})
