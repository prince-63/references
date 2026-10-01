import reducer, {
  resetCancelledInvites,
  resetFilterPagination,
  resetKanbanFilters,
  setIsOpenErrorModal,
  setIsOpenMoveToProductionStateModal,
  setSelectedAssignee,
  setSelectedPracticeLocation,
} from './Kanban.slice'
import {getKanbanCountsByProfile, getPatientTaskTrackerFiltered} from './Kanban.slice'

describe('Kanban slice reducers', () => {
  const initialState = reducer(undefined, {type: '@@INIT'})

  it('toggles modal flags and sets error modal content', () => {
    const withFlag = reducer(initialState, setIsOpenMoveToProductionStateModal(true))
    const next = reducer(
      withFlag,
      setIsOpenErrorModal({isOpen: true, text: 'Oops', showText: false})
    )
    expect(next.isOpenMoveToProductionStateModal).toBe(true)
    expect(next.isOpenErrorModal).toEqual({isOpen: true, text: 'Oops', showText: false})
  })

  it('resets pagination filter state and updates workflow key', () => {
    const updated = reducer(initialState, resetFilterPagination({workflowKey: 'ORTHO'}))
    expect(updated.filterTaskList).toEqual([])
    expect(updated.paginationDetails).toMatchObject({page_number: 0, page_size: 10})
    expect(updated.currentWorkflowKey).toBe('ORTHO')
    expect(updated.isFetchingPage).toBe(false)
  })

  it('merges kanban counts payload', () => {
    const action = getKanbanCountsByProfile.fulfilled(
      [{kanban_name: 'K1', count: 3}, null as any],
      'req',
      {profile_id: 1}
    )
    const updated = reducer(initialState, action)
    expect(updated.workflowCounts).toEqual({K1: 3})
  })

  it('appends patient task tracker results with de-dupe on next page', () => {
    const base = {
      ...initialState,
      filterTaskList: [{id: 1} as any],
      isFetchingPage: true,
    }
    const payload = {
      tasks: [{id: 1} as any, {id: 2} as any],
      label_counts: [{label_name: 'X', count: 1, total_count: 1}],
      pagination_details: {has_next: true},
    }
    const action = getPatientTaskTrackerFiltered.fulfilled(payload, 'req', {page_number: 1} as any)
    const next = reducer(base, action)
    expect(next.filterTaskList.map((t: any) => t.id)).toEqual([1, 2])
    expect(next.labelCounts).toHaveLength(1)
    expect(next.hasNext).toBe(true)
    expect(next.isFetchingPage).toBe(false)
    expect(next.lastRequestedPage).toBe(1)
  })

  it('clears fetch flags on patient tracker rejection', () => {
    const base = {...initialState, loadingPatientTaskTracker: true, isFetchingPage: true}
    const action = getPatientTaskTrackerFiltered.rejected(new Error('fail'), 'req', {} as any)
    const next = reducer(base, action)
    expect(next.loadingPatientTaskTracker).toBe(false)
    expect(next.isFetchingPage).toBe(false)
  })

  it('handles filter reset and selection updates', () => {
    const withSelections = reducer(
      reducer(initialState, setSelectedAssignee({value: 1, label: 'Doc'} as any)),
      setSelectedPracticeLocation({value: 2, label: 'Practice'} as any)
    )
    const cleared = reducer(withSelections, resetKanbanFilters())
    expect(cleared.selectedAssignee).toEqual({} as any)
    expect(cleared.selectedPracticeLocation).toEqual({} as any)
  })

  it('resets cancelled invites slice state', () => {
    const dirty = {
      ...initialState,
      cancelledInvites: [{id: 1} as any],
      cancelledInvitesError: 'err',
      cancelledInvitesMeta: {page: 2, size: 5, total: 10, totalPages: 2, isLast: false},
    }
    const next = reducer(dirty, resetCancelledInvites())
    expect(next.cancelledInvites).toEqual([])
    expect(next.cancelledInvitesError).toBeNull()
    expect(next.cancelledInvitesMeta).toEqual({
      page: 0,
      size: 10,
      total: 0,
      totalPages: 0,
      isLast: true,
    })
  })
})
