import HeaderTitle from 'components/header/HeaderTitle'
import KanbanLayout from 'components/layout/KanbanLayout'
import {AuthContext} from 'context/AuthContext'
import {useContext, useEffect, useRef, useState, useMemo} from 'react'
import useDispatchAction from '@hooks/useDispatchAction'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import PlusIcon from 'assets/icons/PlusIcon'
import {useNavigate, useSearchParams} from 'react-router-dom'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import {RootState} from 'redux/store'
import {useDispatch, useSelector} from 'react-redux'
import TableContainerForAlignerOrders from './components/TableContainerForAlignerOrders'
import {OrderContextProvider} from 'contexts/OrderContext'
import {WorkflowConfigProvider, OrderType} from 'contexts/WorkflowConfigContext'
import {setAlignerWorkflow} from 'redux/Slices/AppSlice/workflow/workflow.slice'
import useActiveProfile from '@hooks/useActiveProfile'
import Kanban from 'screens/Kanban/Kanban'
import TableContainerForKanban from 'screens/Kanban/components/TableContainerForKanBan'
import TableContainerForCancelled from 'screens/Kanban/components/TableContainerForCancelled'
import {Select, Tooltip} from 'antd'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getAccessControlUserList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {AxiosError} from 'axios'
import {postApiDataListActivePracticeLocation} from 'redux/Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import {getStorageType} from 'utils/storage'
import {
  getPatientTaskTrackerFiltered,
  resetFilterPagination,
} from 'redux/Slices/AppSlice/Kanban/Kanban.slice'
import {getActiveUsers} from 'redux/Slices/AppSlice/orders/orders.slice'

const AlignerOrdersPage = () => {
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const {orderFilters} = useSelector((state: RootState) => state.orders)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const [searchQuery, setSearchQuery] = useState('')
  const {userId} = useContext(AuthContext)
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {activeProfile} = useActiveProfile()
  const selectedSubWorkflow = searchParams.get('workFlow') || undefined
  const {getIndividualTaskList} = useSelector((state: RootState) => state.workFlow)
  const [kanbanSearch, setKanbanSearch] = useState('')
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null)
  const [selectedPracticeLocationId, setSelectedPracticeLocationId] = useState<number | null>(null)
  const [selectedStageLabel, setSelectedStageLabel] = useState<string | null>(null)
  const [searchResetKey, setSearchResetKey] = useState(0)
  const {permissionChecks} = useFeatureAccess()
  const patientManagementAccess = permissionChecks?.patientManagement?.patientManagement?.isAddable
  const isVspPlanning = serviceConfig?.VSP_PLANNING ?? false

  const getWorkflowDisplayName = (wf?: string) => {
    switch (wf) {
      case 'new-case':
        return 'New Case'
      case 'planning-in-house':
        return 'Planning In House'
      case 'planning-outsource':
        return 'Plan Outsourced'
      case 'production-in-house':
        return 'Production In House'
      case 'production-outsource':
        return 'Production Outsource'
      default:
        return 'Aligner Orders'
    }
  }

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'cancelled'>(() => {
    const qView = (searchParams.get('view') || '').toLowerCase()
    if (selectedSubWorkflow) return qView === 'list' ? 'list' : 'kanban'
    return 'list'
  })
  const reduxDispatch = useDispatch()
  const existingWorkflow = useSelector((state: any) => state.workflow?.aligner || [])

  useEffect(() => {
    const qView = (searchParams.get('view') || '').toLowerCase()
    setViewMode(selectedSubWorkflow ? (qView === 'list' ? 'list' : 'kanban') : 'list')
  }, [selectedSubWorkflow, searchParams])

  useEffect(() => {
    try {
      if (Array.isArray(existingWorkflow) && existingWorkflow.length) return
      let wf: any[] | undefined
      const profileWf = (activeProfile as any)?.workflow?.aligner
      if (Array.isArray(profileWf) && profileWf.length) wf = profileWf
      if (!wf) {
        // @ts-ignore
        const winWf = (window as any).__WORKFLOW__?.aligner
        if (Array.isArray(winWf) && winWf.length) wf = winWf
      }
      if (!wf) {
        const raw = getStorageType().getItem('userDetail')
        if (raw) {
          const ud = JSON.parse(raw)
          if (
            ud?.workflow?.aligner &&
            Array.isArray(ud.workflow.aligner) &&
            ud.workflow.aligner.length
          ) {
            wf = ud.workflow.aligner
          }
        }
      }
      if (wf && wf.length) reduxDispatch(setAlignerWorkflow(wf))
    } catch {}
  }, [existingWorkflow, activeProfile, reduxDispatch])

  const filter = {PRACTICE: true, CUSTOMER: false, LABS: false, RECEIVED: false, SENT: false}

  const getWorkflowDescription = (wf?: string) => {
    switch (wf) {
      case 'new-case':
        return 'Manage all newly created cases before they enter planning or production.'
      case 'planning-in-house':
        return 'Track case progress through treatment planning, review, and approval stages.'
      case 'planning-outsource':
        return 'Monitor cases whose treatment plans are being handled by partner labs.'
      case 'production-in-house':
        return 'Oversee in-house manufacturing, packaging, and shipping of aligner batches.'
      case 'production-outsource':
        return 'Track production progress for cases sent to external labs for manufacturing.'
      default:
        return undefined
    }
  }

  useEffect(() => {
    if (selectedSubWorkflow) return
    handleOnSearch({})
  }, [
    orderFilters.filterByOrderStatus,
    orderFilters.filterByAssignedUser,
    orderFilters.filterByDueBy,
    selectedSubWorkflow,
  ])

  const handleOnSearch = async ({page = pageNumber}: {page?: number}) => {
    if (!userId) throw new Error('User ID not found')
    setCurrentPageNumber(page)
  }

  useEffect(() => {
    if (!selectedSubWorkflow) return
    if (viewMode !== 'list') return
    const status = searchParams.get('status')
    if (!status) return
    // Use the status directly as it comes from the URL (already matches label_name)
    setSelectedStageLabel(status)
    fireKanbanFilter({workflow_status_name: status, page_number: 0})
  }, [selectedSubWorkflow, viewMode, searchParams])

  useEffect(() => {
    setKanbanSearch('')
    setSearchQuery('')
    setSelectedAssigneeId(null)
    setSelectedPracticeLocationId(null)
    const status = searchParams.get('status')
    if (status) setSelectedStageLabel(status)
    else setSelectedStageLabel(null)

    const initialSearch = searchParams.get('search') || ''
    if (initialSearch) {
      setKanbanSearch(initialSearch)
      setSearchQuery(initialSearch)
      if (selectedSubWorkflow) fireKanbanFilter({search: initialSearch, page_number: 0})
    }
    setSearchResetKey((k) => k + 1)
  }, [selectedSubWorkflow])

  const profileId = useMemo(() => {
    return safeParseInt((activeProfile as any)?.id ?? (activeProfile as any)?.profile_id ?? userId)
  }, [activeProfile, userId])

  const workflowName: string = useMemo(
    () => getWorkflowDisplayName(selectedSubWorkflow),
    [selectedSubWorkflow]
  )

  const {newWorkFlowData} = useSelector((state: RootState) => state.workFlow)
  const stageOptions = useMemo(() => {
    const wf = Array.isArray(newWorkFlowData) ? newWorkFlowData[0] : newWorkFlowData
    const statuses = (wf?.statuses || []) as any[]
    return statuses
      .slice()
      .sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0))
      .map((s) => {
        const label = s?.label_name?.toUpperCase?.() || s?.label_name || s?.name
        const value = s?.label_name || s?.name
        return {label: label, value: value}
      })
  }, [newWorkFlowData])

  const fireKanbanFilter = (overrides?: Partial<Record<string, any>>) => {
    const payloadFilter: any = {
      profile_id: profileId,
      workflow_name: workflowName,
      organization_id: getStorageType().getItem('organizationId')
        ? Number(getStorageType().getItem('organizationId'))
        : null,
      order_type: 'ALIGNER' as OrderType,
      doctor_id: safeParseInt(userId),
      page_number: 0,
      page_size: 10,
       sort:'UPDATED_ON',
       "order": "DESC"
    }
    if (kanbanSearch?.trim()) payloadFilter.search = kanbanSearch.trim()
    if (selectedAssigneeId) payloadFilter.assignee_id = selectedAssigneeId
    if (selectedPracticeLocationId) payloadFilter.practice_location_id = selectedPracticeLocationId
    if (selectedStageLabel) payloadFilter.workflow_status_name = selectedStageLabel
    if (overrides) Object.assign(payloadFilter, overrides)

    const wfKey = `ALIGNER|${workflowName}`
    dispatchAction(resetFilterPagination({workflowKey: wfKey}))
    dispatchAction(getPatientTaskTrackerFiltered(payloadFilter as any))
  }

  useEffect(() => {
    if (!selectedSubWorkflow) return
    const status = searchParams.get('status')
    if (!status) return
    if (stageOptions?.length >= 0) fireKanbanFilter({workflow_status_name: status, page_number: 0})
  }, [selectedSubWorkflow, stageOptions])

  const handleKanbanSearch = (value: string) => {
    const v = (value ?? '').trim()
    setKanbanSearch(v)
    setSearchQuery(v)
    if (selectedSubWorkflow) {
      fireKanbanFilter({search: v || undefined, page_number: 0})
    } else {
      handleOnSearch({page: 1})
    }
  }

  const {loadingActiveUsers, activeUsers} = useSelector((state: RootState) => state.orders)
  const {userList} = useSelector((state: RootState) => state.accessControl)
  const {sidebarAccess} = useFeatureAccess()
  const accessControlPermission = (sidebarAccess as any)?.rolesPermissions ?? true
  const [practiceLocationList, setPracticeLocationList] = useState<any>([])

  useEffect(() => {
    dispatchAction(
      getAccessControlUserList({
        doctor_id: safeParseInt(userId),
        search: null,
        status: 'ACCEPTED',
        sub_role_id: null,
        page_number: 0,
        page_size: 0,
      })
    )
    getClinics()
  }, [])

  useEffect(() => {
    dispatchAction(
      getActiveUsers({
        data: {
          sort_order: 'PRACTICE_NAME_ASC',
          page_number: 0,
          page_size: 0,
          search: '',
          doctor_id: safeParseInt(userId),
          invitation_status: 'ACCEPTED',
          invitation_roles: ['LAB_STAFF', 'INTERNAL_USER'],
        },
      })
    )
  }, [])

  const getClinics = () => {
    const postData: ApiGetData = {data: {doctor_id: safeParseInt(userId)}}
    dispatchAction(postApiDataListActivePracticeLocation(postData) as any)
      .unwrap()
      .then((res: any) => {
        const clinicList: any = []
        res?.practice_location_list?.forEach((element: any) => {
          clinicList.push({
            value: element.practice_location_id.toString(),
            label: element.practice_location_name,
            country: element.country,
            state: element.state,
            city: element.city,
          })
        })
        setPracticeLocationList(clinicList)
      })
      .catch((error: AxiosError) => {
        console.error(error)
      })
  }

  const assigneeList = (userList?.users || []).map((u: any) => ({
    label: `${u.first_name} ${u.last_name ? u.last_name : ''}`.trim(),
    value: u.profile_id,
  }))

  const kanbanViewportRef = useRef<HTMLDivElement | null>(null)
  const bottomScrollbarRef = useRef<HTMLDivElement | null>(null)
  const [showScrollbar, setShowScrollbar] = useState(false)

  useEffect(() => {
    if (viewMode !== 'kanban' || !selectedSubWorkflow) {
      setShowScrollbar(false)
      return
    }
    const el = kanbanViewportRef.current
    if (!el) return
    const compute = () => setShowScrollbar(el.scrollWidth > el.clientWidth + 1)
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [viewMode, selectedSubWorkflow])

  useEffect(() => {
    if (!showScrollbar) return
    const viewEl = kanbanViewportRef.current
    const barEl = bottomScrollbarRef.current
    if (!viewEl || !barEl) return
    const inner = barEl.firstElementChild as HTMLElement | null
    if (inner) inner.style.width = viewEl.scrollWidth + 'px'
    const syncFromView = () => {
      if (barEl) barEl.scrollLeft = viewEl.scrollLeft
    }
    const syncFromBar = () => {
      if (viewEl) viewEl.scrollLeft = barEl.scrollLeft
    }
    viewEl.addEventListener('scroll', syncFromView, {passive: true})
    barEl.addEventListener('scroll', syncFromBar, {passive: true})
    const ro = new ResizeObserver(() => {
      if (inner) inner.style.width = viewEl.scrollWidth + 'px'
    })
    ro.observe(viewEl)
    return () => {
      viewEl.removeEventListener('scroll', syncFromView)
      barEl.removeEventListener('scroll', syncFromBar)
      ro.disconnect()
    }
  }, [showScrollbar, viewMode, selectedSubWorkflow])

  const isProdInHouse = selectedSubWorkflow === 'production-in-house'

  return (
    <KanbanLayout
      header={
        <div className='flex flex-wrap gap-3 justify-between items-center'>
          <div className='flex w-full justify-between items-start  md:items-center gap-4 md:flex-nowrap flex-wrap'>
            <div className='min-w-0'>
              <HeaderTitle
                title={
                  selectedSubWorkflow
                    ? getWorkflowDisplayName(selectedSubWorkflow)
                    : 'Aligner Orders'
                }
                subTitle={
                  selectedSubWorkflow
                    ? getWorkflowDescription(selectedSubWorkflow)
                    : 'Keep track of your orders here.'
                }
              />
            </div>

            {viewMode === 'kanban' && isProdInHouse && !isVspPlanning && (
              <div className='flex flex-col md:flex-row gap-2 shrink-0 md:mt-0 w-full md:w-auto order-last md:order-none mt-3 md:pr-60'>
                <Tooltip title='View Ongoing Production: Manage active batches currently under production.'>
                  <button
                    type='button'
                    className='whitespace-nowrap px-3 py-2 border bg-primarySupport border-primaryColor text-primaryColor rounded-md text-sm font-medium hover:bg-primaryColor hover:text-white transition-colors'
                    onClick={() => {
                      const params = new URLSearchParams()
                      params.set('tab', 'ongoing')
                      if (getIndividualTaskList?.patient_name)
                        params.set('patientName', String(getIndividualTaskList?.patient_name))
                      navigate(`/aligner-production?${params.toString()}`)
                    }}
                  >
                    View Ongoing Production
                  </button>
                </Tooltip>

                <Tooltip title='View Unprocessed Aligners: Start production for pending or new batches.'>
                  <button
                    type='button'
                    className='whitespace-nowrap px-3 py-2 border bg-primarySupport border-primaryColor text-primaryColor rounded-md text-sm font-medium hover:bg-primaryColor hover:text-white transition-colors'
                    onClick={() => navigate('/unprocessed-orders')}
                  >
                    View Unprocessed Batches
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      }
      controls={
        <div className='w-full'>
          <div></div>
          <div
            className={[
              'hidden md:flex items-center gap-3 w-full overflow-x-auto',
              isProdInHouse ? 'md:flex-wrap' : 'md:flex-nowrap',
            ].join(' ')}
          >
            <PracticeSearchInput
              key={searchResetKey}
              placeholder='Search'
              defaultValue={searchQuery}
              handleSearch={(value) => handleKanbanSearch(value ?? '')}
              className='w-[320px] flex-none'
            />

            <div className='min-w-[180px] shrink-0'>
              <Select
                size='large'
                options={activeUsers}
                disabled={!accessControlPermission}
                loading={loadingActiveUsers}
                showSearch
                allowClear
                className='w-full'
                value={selectedAssigneeId ?? undefined}
                placeholder='Assignee'
                onChange={(val) => {
                  const value = val == null ? null : Number(val)
                  setSelectedAssigneeId(value)
                  if (selectedSubWorkflow) {
                    fireKanbanFilter({assignee_id: value ?? undefined, page_number: 0})
                  }
                }}
              />
            </div>

            {!isVspPlanning && (
              <div className='min-w-[180px] shrink-0'>
                <Select
                  size='large'
                  options={practiceLocationList}
                  disabled={!accessControlPermission}
                  loading={loadingActiveUsers}
                  showSearch
                  allowClear
                  labelInValue
                  className='w-full'
                  value={
                    selectedPracticeLocationId
                      ? practiceLocationList.find(
                          (opt: any) => Number(opt.value) === selectedPracticeLocationId
                        )
                      : undefined
                  }
                  placeholder='Clinic'
                  onChange={(option) => {
                    const value = option?.value ? Number(option.value) : null
                    setSelectedPracticeLocationId(value)
                    if (selectedSubWorkflow) {
                      fireKanbanFilter({practice_location_id: value ?? undefined, page_number: 0})
                    }
                  }}
                />
              </div>
            )}

            {selectedSubWorkflow && (
              <div className='min-w-[180px] shrink-0'>
                <Select
                  size='large'
                  options={stageOptions}
                  showSearch
                  allowClear
                  className='w-full'
                  placeholder='Stage/Status'
                  value={selectedStageLabel ?? undefined}
                  loading={selectedSubWorkflow ? stageOptions.length === 0 : false}
                  disabled={stageOptions.length === 0}
                  onChange={(val) => {
                    const value = val == null ? null : String(val)
                    setSelectedStageLabel(value)
                    if (selectedSubWorkflow) {
                      fireKanbanFilter({workflow_status_name: value ?? undefined, page_number: 0})
                    }
                  }}
                />
              </div>
            )}

            {patientManagementAccess && selectedSubWorkflow === 'new-case' && (
              <button
                type='button'
                className='whitespace-nowrap bg-primaryColor px-4 py-2 text-white rounded-lg text-sm font-medium shrink-0'
                onClick={() => navigate('/add-patient')}
              >
                <span className='inline-flex items-center gap-2'>
                  <PlusIcon color='#fff' />
                  Add a case
                </span>
              </button>
            )}
          </div>

          {selectedSubWorkflow && (
            <div className='hidden md:block mt-4 -mb-8'>
              <div className='inline-flex gap-1 p-1 mb:hidden rounded-2xl bg-neutral-100 shadow-inner'>
                <button
                  type='button'
                  aria-pressed={viewMode === 'kanban'}
                  onClick={() => setViewMode('kanban')}
                  className={[
                    'px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap',
                    viewMode === 'kanban'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800',
                  ].join(' ')}
                >
                  Kanban view
                </button>
                <button
                  type='button'
                  aria-pressed={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  className={[
                    'px-4 py-2 rounded-xl text-sm font-semibold transition whitespace-nowrap',
                    viewMode === 'list'
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800',
                  ].join(' ')}
                >
                  Table view
                </button>
              </div>
            </div>
          )}
          <div className='md:hidden'>
            <div className='w-full'>
              <PracticeSearchInput
                key={searchResetKey}
                placeholder='Search'
                defaultValue={searchQuery}
                handleSearch={(value) => handleKanbanSearch(value ?? '')}
              />
            </div>

            <div className='mt-3 flex flex-col gap-3'>
              <div className='flex flex-row gap-2'>
                <div className='w-auto'>
                  <Select
                    size='large'
                    options={assigneeList}
                    disabled={!accessControlPermission}
                    loading={loadingActiveUsers}
                    showSearch
                    allowClear
                    className='w-full'
                    value={selectedAssigneeId ?? undefined}
                    placeholder='Assignee'
                    onChange={(val) => {
                      const value = val == null ? null : Number(val)
                      setSelectedAssigneeId(value)
                      if (selectedSubWorkflow) {
                        fireKanbanFilter({assignee_id: value ?? undefined, page_number: 0})
                      }
                    }}
                  />
                </div>

                {!isVspPlanning && (
                  <div className='w-auto'>
                    <Select
                      size='large'
                      options={practiceLocationList}
                      disabled={!accessControlPermission}
                      loading={loadingActiveUsers}
                      showSearch
                      allowClear
                      labelInValue
                      className='w-full'
                      value={
                        selectedPracticeLocationId
                          ? practiceLocationList.find(
                              (opt: any) => Number(opt.value) === selectedPracticeLocationId
                            )
                          : undefined
                      }
                      placeholder='Clinic'
                      onChange={(option) => {
                        const value = option?.value ? Number(option.value) : null
                        setSelectedPracticeLocationId(value)
                        if (selectedSubWorkflow) {
                          fireKanbanFilter({
                            practice_location_id: value ?? undefined,
                            page_number: 0,
                          })
                        }
                      }}
                    />
                  </div>
                )}

                {selectedSubWorkflow && (
                  <div className='w-auto'>
                    <Select
                      size='large'
                      options={stageOptions}
                      showSearch
                      allowClear
                      className='w-full'
                      placeholder='Stage/Status'
                      value={selectedStageLabel ?? undefined}
                      loading={selectedSubWorkflow ? stageOptions.length === 0 : false}
                      disabled={stageOptions.length === 0}
                      onChange={(val) => {
                        const value = val == null ? null : String(val)
                        setSelectedStageLabel(value)
                        if (selectedSubWorkflow) {
                          fireKanbanFilter({
                            workflow_status_name: value ?? undefined,
                            page_number: 0,
                          })
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {patientManagementAccess && selectedSubWorkflow === 'new-case' && (
                <button
                  type='button'
                  className='bg-primaryColor px-4 py-2 text-white rounded-lg flex gap-2 items-center justify-center text-sm font-medium w-full'
                  onClick={() => navigate('/add-patient')}
                >
                  <PlusIcon color='#fff' />
                  <span>Add a case</span>
                </button>
              )}
            </div>

            {selectedSubWorkflow && (
              <div className='mt-3 '>
                <div className='inline-flex w-full p-1 rounded-2xl bg-neutral-100 shadow-inner'>
                  <button
                    type='button'
                    aria-pressed={viewMode === 'kanban'}
                    onClick={() => setViewMode('kanban')}
                    className={[
                      'flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-center transition',
                      viewMode === 'kanban'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800',
                    ].join(' ')}
                  >
                    Kanban view
                  </button>
                  <button
                    type='button'
                    aria-pressed={viewMode === 'list'}
                    onClick={() => setViewMode('list')}
                    className={[
                      'flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-center transition',
                      viewMode === 'list'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-800',
                    ].join(' ')}
                  >
                    Table view
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      content={
        <div className='flex flex-col gap-3 overflow-x-hidden'>
          <div
            ref={kanbanViewportRef}
            className={`${
              viewMode === 'kanban'
                ? 'overflow-x-auto scroll-smooth px-2 kanban-native-hidden pb-6'
                : ''
            }`}
            style={
              viewMode === 'kanban'
                ? {WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain'}
                : undefined
            }
          >
            <OrderContextProvider>
              {selectedSubWorkflow ? (
                <WorkflowConfigProvider>
                  {viewMode === 'kanban' ? (
                    <Kanban searchQuery={kanbanSearch} />
                  ) : viewMode === 'list' ? (
                    <TableContainerForKanban
                      searchQuery={kanbanSearch}
                      selectedStageLabel={selectedStageLabel ?? undefined}
                      selectedAssigneeId={selectedAssigneeId}
                      selectedPracticeLocationId={selectedPracticeLocationId}
                    />
                  ) : (
                    <TableContainerForCancelled />
                  )}
                </WorkflowConfigProvider>
              ) : (
                <TableContainerForAlignerOrders
                  pageNumber={pageNumber}
                  handleOnSearch={handleOnSearch}
                  filter={filter}
                  selectedSubWorkflow={selectedSubWorkflow}
                />
              )}
            </OrderContextProvider>
          </div>

          {viewMode === 'kanban' && selectedSubWorkflow && showScrollbar && (
            <div className='kanban-scrollbar-wrapper-fixed'>
              <div ref={bottomScrollbarRef} className='kanban-scrollbar'>
                <div className='kanban-scrollbar-inner' />
              </div>
            </div>
          )}
        </div>
      }
    />
  )
}

export default AlignerOrdersPage
