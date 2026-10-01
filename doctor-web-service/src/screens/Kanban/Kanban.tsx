import {useContext, useEffect, useMemo, useRef, useState} from 'react'
import './styles/kanban.css'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import {getWorkFlowName, safeParseInt} from 'utils/ConstFunctions'
import Page from 'components/page/Page'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {
  getPatientTaskTrackerFiltered,
  resetFilterPagination,
  getCancelledPatientTasks,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {useSearchParams} from 'react-router-dom'
import {getStorageType} from 'utils/storage'
import {getNewWorkflow, getCardConfiguration} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import {getAccessControlUserList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {Tasks} from './components/Task'
import {Spin} from 'antd'
import Spinner from 'components/spinner/Spinner'

const PAGE_SIZE = 10

const Kanban = ({searchQuery = ''}: {searchQuery?: string}) => {
  const {profileId, userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const [searchParams] = useSearchParams()
  const selectedSubWorkflow = searchParams.get('workFlow') || undefined

  const {
    loadingKanBan,
    filterTaskList,
    labelCounts,
    hasNext,
    lastRequestedPage,
    isFetchingPage,
    loadingPatientTaskTracker,
  } = useSelector((state: RootState) => state.kanban)
  const {newWorkFlowData, cardConfiguration} = useSelector((state: RootState) => state.workFlow)

  // --- helper: detect PT codes like PT2021 ---
  const isCustomerCode = (s?: string) => !!s && /^PT\d+$/i.test(s.trim())

  // --- derive workflow name & key ---
  const workflowName = getWorkFlowName(selectedSubWorkflow ?? 'new-case')
  const workflowKey = `ALIGNER|${workflowName}`

  // Reset paging + fetch first page on workflow change (filters are cleared by parent UI)
  useEffect(() => {
    const parsedProfileId = safeParseInt(profileId)
    if (!parsedProfileId) return

    const payloadWF = {
      profile_id: parsedProfileId,
      organization_id: getStorageType().getItem('organizationId')
        ? Number(getStorageType().getItem('organizationId'))
        : null,
      kanban_header_name: 'ALIGNER',
      kanban_name: workflowName,
    }

    // Reset pagination & local visibility on tab change
    dispatchAction(resetFilterPagination({workflowKey}))
    dispatchAction(getCardConfiguration({profileId: parsedProfileId}))

    dispatchAction(getNewWorkflow(payloadWF as any))
      .unwrap()
      .then(() => {
        const payloadFilter = {
          profile_id: parsedProfileId,
          workflow_name: workflowName,
          organization_id: getStorageType().getItem('organizationId')
            ? Number(getStorageType().getItem('organizationId'))
            : null,
          order_type: 'ALIGNER',
          page_number: 0,
          page_size: PAGE_SIZE,
          sort:'UPDATED_ON',
          "order": "DESC"
        }
        // If a Stage/Status is preselected via URL, apply it on the very first load
        const status = searchParams.get('status')
        if (status) {
          ;(payloadFilter as any).workflow_status_name = status
        }
        dispatchAction(getPatientTaskTrackerFiltered(payloadFilter as any))
      })
  }, [workflowKey, dispatchAction, profileId, workflowName])

  // Ensure assigned-user list is available for assignee pickers on cards
  useEffect(() => {
    const payload = {
      doctor_id: safeParseInt(userId),
      search: null,
      status: 'ACCEPTED',
      sub_role_id: null,
      page_number: 0,
      page_size: 0,
    }
    dispatchAction(getAccessControlUserList(payload as any))
  }, [userId])

  useEffect(() => {
    if (selectedSubWorkflow === 'production-in-house') {
      const parsedProfileId = safeParseInt(profileId)
      if (!parsedProfileId) return
      dispatchAction(
        getCancelledPatientTasks({
          profile_id: parsedProfileId,
          workflow_name: 'Production In House',
          page_number: 0,
          page_size: 10,
        })
      )
    }
  }, [selectedSubWorkflow, dispatchAction, profileId])

  // --- statuses -> headers & columns ---
  const statuses = useMemo(() => {
    const wf = Array.isArray(newWorkFlowData) ? newWorkFlowData[0] : newWorkFlowData
    return wf?.statuses || []
  }, [newWorkFlowData])

  const headers = useMemo(
    () =>
      statuses.map((s: any) => ({
        id: s.id,
        name: s.name,
        label_name: s.label_name,
        color: s.color,
        position: s.position,
        custom: s.custom,
        internal_name: s.internal_name,
      })),
    [statuses]
  )

  const kanbanColumns = useMemo(() => {
    const countMap = new Map<string, number>()
    ;(labelCounts ?? []).forEach((lc) => countMap.set(lc.label_name, lc.count ?? 0))
    const cols = statuses.map((s: any, idx: number) => ({
      id: s.id ?? idx,
      name: s.label_name ?? s.name,
      order: s.position ?? idx,
      color: s.color,
      internal_name: s.internal_name,
      count: countMap.get(s.label_name ?? s.name) ?? 0,
    }))
    cols.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
    return cols
  }, [statuses, labelCounts])

  // --- global search on tasks (client-side; server filters are managed in parent) ---
  const rawQuery = searchQuery?.trim() || ''
  const normalizedQuery = rawQuery.toLowerCase()

  const allFilteredTasks = useMemo(() => {
    const list = filterTaskList ?? []
    if (!normalizedQuery) return list

    // If the query is a PT code, match against customer_mapped_id (and similar) robustly.
    if (isCustomerCode(rawQuery)) {
      const q = rawQuery.toUpperCase()
      return list.filter((t: any) => {
        const custom_id =
          (t?.customer_mapped_id ??
            t?.customer_code ?? // just in case other APIs use a different key
            t?.case_code ??
            '') + ''
        return custom_id.toUpperCase().includes(q)
      })
    }

    // Otherwise, do the regular broad matching (now also includes customer_mapped_id)
    return list.filter((t: any) => {
      const name = (t?.patient_name || '').toLowerCase()
      const pid = String(t?.patient_id ?? '').toLowerCase()
      const custom_id = String(
        t?.customer_mapped_id ?? t?.customer_code ?? t?.case_code ?? ''
      ).toLowerCase()
      return (
        name.includes(normalizedQuery) ||
        pid.includes(normalizedQuery) ||
        custom_id.includes(normalizedQuery)
      )
    })
  }, [filterTaskList, normalizedQuery, rawQuery])

  // --- per-status visible limits ---
  const [visibleByStatus, setVisibleByStatus] = useState<Record<string, number>>({})
  useEffect(() => {
    const next: Record<string, number> = {}
    for (const lc of labelCounts ?? []) {
      next[lc.label_name] = Math.min(PAGE_SIZE, lc.count || 0)
    }
    setVisibleByStatus(next)
  }, [labelCounts, workflowKey])

  // --- guarded fetchNextPage ---
  const loadLockRef = useRef(false)
  const fetchNextPage = () => {
    if (!hasNext || isFetchingPage || loadLockRef.current) return
    loadLockRef.current = true
    const payloadFilter = {
      profile_id: safeParseInt(profileId),
      workflow_name: workflowName,
      organization_id: getStorageType().getItem('organizationId')
        ? Number(getStorageType().getItem('organizationId'))
        : null,
      order_type: 'ALIGNER',
      page_number: (lastRequestedPage ?? 0) + 1,
      page_size: PAGE_SIZE,
       sort:'UPDATED_ON',
       "order": "DESC"
    }
    dispatchAction(getPatientTaskTrackerFiltered(payloadFilter as any)).finally(() => {
      loadLockRef.current = false
    })
  }

  // Called by <Tasks /> when a column bottom is visible
  const handleColumnEndVisible = (statusName: string, loadedCountInColumn: number) => {
    const total = kanbanColumns.find((c: any) => c.name === statusName)?.count ?? 0
    const currentVisible = visibleByStatus[statusName] ?? 0
    if (currentVisible >= total) return

    const need = Math.min(currentVisible + PAGE_SIZE, total)

    // If we don't have enough locally, fetch a new page
    if (loadedCountInColumn < need) {
      fetchNextPage()
    }

    // reveal up to `need`
    setVisibleByStatus((v) => ({...v, [statusName]: need}))
  }

  return (
    <Page loading={loadingKanBan}>
      <Spin indicator={<Spinner loading />} spinning={loadingPatientTaskTracker}>
        <Tasks
          tasks={allFilteredTasks ?? []}
          columns={kanbanColumns}
          headers={headers}
          visibleByStatus={visibleByStatus}
          onColumnEndVisible={handleColumnEndVisible}
          cardConfiguration={cardConfiguration}
        />
      </Spin>
    </Page>
  )
}

export default Kanban
