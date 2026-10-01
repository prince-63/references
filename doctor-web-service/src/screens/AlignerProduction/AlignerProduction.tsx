import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import PracticeSearchInput from 'screens/Practices/PracticeList/components/PracticeSearchInput'
import TableContainerForAlignerProduction from './components/TableContainerForAlignerProduction'
import AlignerProductionCounts from './components/AlignerProductionCounts'
import useDispatchAction from '@hooks/useDispatchAction'
import {AlignerProductionPayload, PayloadStatusChange} from './types/alignerProduction.types'
import {safeParseInt} from 'utils/ConstFunctions'
import {AuthContext} from 'context/AuthContext'
import {
  changeMultiStatus,
  getAlignerProductionData,
  getAllProductOptionList,
  getStatusList,
} from 'redux/Slices/AppSlice/AlignerProduction/AlignerProduction.slice'
import {getVendorsList} from 'redux/Slices/AppSlice/orders/orders.slice'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {Button, Divider, Popover, Radio, Select} from 'antd'
import StatusIcon from 'assets/icons/StatusIcon'
import BulkDueDate from './components/BulkDueDate'
import FilterIcon from 'assets/icons/FilterIcon'
import AntdButton from 'components/atom/Buttons/AntdButton'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {getAccessControlUserList} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'

type optionType = {value: number; label: string}
export type SortKey = 'PATIENT_NAME' | 'UPDATED_ON' | 'NEXT_FOLLOW_UP'

const resolveAssigneeIdsFromQuery = (search: string, users: any[]): number[] => {
  const params = new URLSearchParams(search)
  const byId = params.get('assigneeId')
  const byName = params.get('assignee')

  if (byId && !Number.isNaN(Number(byId))) return [Number(byId)]

  if (byName) {
    const target = byName.trim().toLowerCase()
    const matches = users.filter((u: any) => {
      const full = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim().toLowerCase()
      return full === target || full.includes(target)
    })
    const ids = matches
      .map((m: any) => Number(m.profile_id))
      .filter((n) => Number.isFinite(n) && n > 0)
    if (ids.length) return ids
  }

  return []
}

const AlignerProduction = () => {
  const {dispatchAction} = useDispatchAction()
  const {userId, profileId} = useContext(AuthContext)

  const [filterByStatus, setFilterByStatus] = useState<string | null>(null)
  const [pageNumber, setCurrentPageNumber] = useState(1)
  const [searchTerm, setSearchTerm] = useState<string>('') // Add this state

  // multi-filters + sort
  const [assigneeIds, setAssigneeIds] = useState<number[]>([])
  const [productIds, setProductIds] = useState<number[]>([])
  const [sortBy, setSortBy] = useState<SortKey>('UPDATED_ON')

  // 🔔 tick used to clear child selections after bulk ops
  const [clearSelectionTick, setClearSelectionTick] = useState(0)

  const [selectedTaskInfo, setSelectedTaskInfo] = useState<{task_id: number; patient_id: number}[]>(
    []
  )

  const {statusList, workflowId} = useSelector((state: RootState) => state.alignerProduction)
  const {userList} = useSelector((state: RootState) => state.accessControl)

  // Derive assignee options from userList (fetched by loadAssignees via getAccessControlUserList)
  // This avoids a duplicate active-or-pending call from getActiveUsers
  const activeUsers = useMemo(
    () =>
      (userList?.users ?? []).map((u: any) => ({
        value: u.profile_id,
        label: `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim(),
        sub_role: u.sub_role_name,
      })),
    [userList?.users]
  )

  const statusOptions = useMemo(
    () =>
      (statusList || [])
        .filter((opt) => opt.label?.toUpperCase() !== 'COMPLETED')
        .map((opt) => ({label: opt.label, value: Number(opt.value)})),
    [statusList]
  )

  const statusLoading = statusOptions.length === 0

  // ---------- products for filter ----------
  const [productOptions, setProductOptions] = useState<optionType[]>([])
  const {permissionChecks} = useFeatureAccess()
  const ongoingProductionAccess = permissionChecks?.ongoingProduction


  const loadAssignees = useCallback(() => {
    const parsedDoctorId = safeParseInt(userId)
    if (!parsedDoctorId) return
    dispatchAction(
      getAccessControlUserList({
        doctor_id: parsedDoctorId,
        search: null,
        status: 'ACCEPTED',
        sub_role_id: null,
        page_number: 0,
        page_size: 0,
      }) as any
    )
  }, [dispatchAction, userId])

  useEffect(() => {
    if (!ongoingProductionAccess?.assignee?.isViewable) return
    loadAssignees()
  }, [loadAssignees, ongoingProductionAccess?.assignee?.isViewable])

  // Initial boot
  useEffect(() => {
    dispatchAction(
      getStatusList({kanban_header_name: 'ALIGNER', kanban_name: 'ONGOING PRODUCT LIST'} as any)
    )

    getVendorAndProductList()

    const params = new URLSearchParams(window.location.search)
    const statusParam = params.get('status')
    if (statusParam) setFilterByStatus(statusParam)
  }, []) // eslint-disable-line

  // After user list is ready, resolve initial filters from URL and do the first fetch.
  useEffect(() => {
    if (!userList?.users) return

    const params = new URLSearchParams(window.location.search)
    const patientName = params.get('patientName')?.trim()

    if (patientName) {
      setSearchTerm(patientName) // Store the search term from URL
      setFilterByStatus(null)
      setAssigneeIds([])
      setProductIds([])
      setCurrentPageNumber(1)

      getAlignerListData({
        page: 1,
        search: patientName,
        filter_by_label: null,
        assignee_id_list: [],
        product_id_list: [],
      })

      params.delete('status')
      params.delete('assignee')
      params.delete('assigneeId')
      const qs = params.toString()
      window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
      return
    }

    const statusParam = params.get('status')
    const assigneeIdsFromQuery = resolveAssigneeIdsFromQuery(window.location.search, userList.users)

    if (assigneeIdsFromQuery.length) {
      setAssigneeIds(assigneeIdsFromQuery)
      params.set('assigneeId', String(assigneeIdsFromQuery[0]))
      params.delete('assignee')
      const qs = params.toString()
      window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
    }

    getAlignerListData({
      filter_by_label: statusParam,
      assignee_id_list: assigneeIdsFromQuery,
    })
  }, [userList?.users]) // eslint-disable-line

  const getVendorAndProductList = async () => {
    dispatchAction(getVendorsList({doctor_id: safeParseInt(userId)}))
      .unwrap()
      .then((vendors: optionType[]) => {
        dispatchAction(
          getAllProductOptionList({
            owner_profile_id: safeParseInt(profileId),
            vendor_profile_ids: vendors?.map((v) => safeParseInt(v.value)) ?? [],
            product_type: 'ALIGNER',
            search: '',
          })
        )
          .unwrap()
          .then((res: any[]) => {
            const opts = Array.isArray(res)
              ? res.map((p: any) => ({
                  label: String(p.label ?? p.name),
                  value: Number(p.value ?? p.id),
                }))
              : []
            setProductOptions(opts)
          })
          .catch(() => setProductOptions([]))
      })
      .catch(() => setProductOptions([]))
  }


  const getAlignerListData = async ({
    page = 1,
    search = searchTerm, // Use the state value as default
    filter_by_label = filterByStatus,
    sort = sortBy,
    assignee_id_list = assigneeIds,
    product_id_list = productIds,
  }: {
    page?: number
    search?: string | null
    filter_by_label?: string | null
    sort?: SortKey
    assignee_id_list?: number[]
    product_id_list?: number[]
  } = {}) => {
    setCurrentPageNumber(page)

    // Update searchTerm state if search is provided
    if (search !== undefined && search !== null) {
      setSearchTerm(search)
    }

    const payload: AlignerProductionPayload = {
      order_type: 'ALIGNER',
      doctor_id: safeParseInt(userId),
      workflow_name: 'ONGOING PRODUCT LIST',
      assignee_ids: assignee_id_list ?? [],
      product_ids: product_id_list ?? [],
      search: search ?? searchTerm ?? '', // Use the passed search or the state
      page_number: page - 1,
      page_size: 100,
      filter_by_label_name: filter_by_label,
      sort,
    }
    dispatchAction(getAlignerProductionData(payload))
  }

  const handleGlobalStatus = (next: string | null) => {
    const isSame = !!next && (filterByStatus ?? '').toLowerCase() === next.toLowerCase()
    const newFilter = isSame ? null : next
    setFilterByStatus(newFilter)
    setSelectedTaskInfo([])

    // Preserve the current search term when changing status
    getAlignerListData({
      filter_by_label: newFilter,
      search: searchTerm,
    })

    const params = new URLSearchParams(window.location.search)
    if (newFilter) params.set('status', newFilter)
    else params.delete('status')

    // Keep patientName in URL if it exists
    if (searchTerm) params.set('patientName', searchTerm)
    else params.delete('patientName')

    const qs = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }

  const handleSearch = (searchInput: string | null) => {
    const newSearchTerm = searchInput || ''
    setSearchTerm(newSearchTerm)
    getAlignerListData({search: newSearchTerm, page: 1})

    // Update URL with search term
    const params = new URLSearchParams(window.location.search)
    if (newSearchTerm) params.set('patientName', newSearchTerm)
    else params.delete('patientName')
    const qs = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)
  }

  const handlePageChange = ({page}: {page: number}) =>
    getAlignerListData({page, search: searchTerm}) // Preserve search on page change

  const handleSortChange = (key: SortKey) => {
    setSortBy(key)
    getAlignerListData({page: 1, sort: key, search: searchTerm}) // Preserve search on sort
  }

  const isCompletedMode = (filterByStatus ?? '').toUpperCase() === 'COMPLETED'

  const hardClearSelection = () => {
    setSelectedTaskInfo([])
    setClearSelectionTick((t) => t + 1)
  }

  const handleBulkStatusChange = (workflowStatusId: number) => {
    if (!workflowId) return
    const payload: PayloadStatusChange = {
      task_info: selectedTaskInfo,
      doctor_id: safeParseInt(userId),
      workflow_status_id: workflowStatusId,
      workflow_id: workflowId,
    }
    dispatchAction(changeMultiStatus(payload))
      .unwrap()
      .then(() => {
        SuccessToast('Production status updated successfully!')
        hardClearSelection()
        getAlignerListData({})
      })
  }

  const handleBulkAssign = (assignee_id: number) => {
    if (!workflowId) return
    const payload: any = {
      task_info: selectedTaskInfo,
      doctor_id: safeParseInt(userId),
      workflow_id: workflowId,
      assignee_id,
    }
    dispatchAction(changeMultiStatus(payload))
      .unwrap()
      .then(() => {
        SuccessToast('assignee added successfully!')
        hardClearSelection()
        getAlignerListData({})
      })
  }

  const handleBulkDueDate = (isoDate: string | '') => {
    if (!workflowId) return
    const payload: any = {
      task_info: selectedTaskInfo,
      doctor_id: safeParseInt(userId),
      workflow_id: workflowId,
      estimated_completion_date: isoDate,
    }
    dispatchAction(changeMultiStatus(payload))
      .unwrap()
      .then(() => {
        SuccessToast('due date added successfully!')
        hardClearSelection()
        getAlignerListData({})
      })
  }

  // ---------- Filter popover ----------
  const [filterOpen, setFilterOpen] = useState(false)

  const filterContent = (
    <div className='w-[320px]'>
      <div className='mb-2 font-semibold text-textColor'>Filter</div>

      <div className='text-xs font-medium text-black mb-1'>Filter by assignee</div>
      <Select
        mode='multiple'
        allowClear
        placeholder='Select assignees'
        className='w-full mb-3'
        value={assigneeIds}
        options={activeUsers}
        showSearch
        optionLabelProp='label'
        optionFilterProp='label'
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        getPopupContainer={(node) => node.parentElement!}
        onMouseDown={(e) => e.stopPropagation()}
        maxTagCount='responsive'
        onChange={(value: number[]) => setAssigneeIds(value)}
      />

      <div className='text-xs font-medium text-black mb-1'>Filter by product</div>
      <Select
        mode='multiple'
        allowClear
        placeholder='Select products'
        className='w-full mb-3'
        value={productIds}
        options={productOptions}
        showSearch
        optionLabelProp='label'
        optionFilterProp='label'
        filterOption={(input, option) =>
          (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
        }
        getPopupContainer={(node) => node.parentElement!}
        onMouseDown={(e) => e.stopPropagation()}
        maxTagCount='responsive'
        onChange={(value: number[]) => setProductIds(value)}
      />

      <Divider className='my-2' />

      <div className='text-xs font-medium text-black mb-1'>Sort by</div>
      <Radio.Group
        onChange={(e) => setSortBy(e.target.value)}
        value={sortBy}
        className='flex flex-col gap-1'
      >
        <Radio value='PATIENT_NAME'>Patient name</Radio>
        <Radio value='NEXT_FOLLOW_UP'>Due date</Radio>
        <Radio value='UPDATED_ON'>Updated on</Radio>
      </Radio.Group>

      <div className='flex justify-end gap-2 mt-3'>
        <Button
          onClick={() => {
            setAssigneeIds([])
            setProductIds([])
            setSortBy('UPDATED_ON')
          }}
        >
          Clear
        </Button>

        <AntdButton
          className='bg-primaryColor text-white h-[32px] font-semibold text-base w-[60px]'
          text='Apply'
          htmlType='submit'
          onClick={() => {
            setFilterOpen(false)
            getAlignerListData({
              page: 1,
              sort: sortBy,
              assignee_id_list: assigneeIds,
              product_id_list: productIds,
              search: searchTerm, // Preserve search when applying filters
            })
          }}
        />
      </div>
    </div>
  )

  return (
    <>
      {ongoingProductionAccess?.ongoingProductionPage?.isViewable ? (
        <div className='flex flex-col gap-4 p-4 md:p-6  pb-[70px] md:pb-0'>
          <h1 className='text-xl md:text-2xl font-semibold'>Ongoing Production</h1>
          <div className='-mt-4 mb-2'>View and manage all batches currently under production.</div>

          <AlignerProductionCounts
            filter={filterByStatus}
            handleGlobalStatus={handleGlobalStatus}
          />

          <div className='flex flex-col md:flex-row md:items-center gap-3 md:gap-4 md:justify-start'>
            <PracticeSearchInput handleSearch={handleSearch} placeholder={'search'} />

            <div className='flex flex-col sm:flex-row gap-2 sm:items-center'>
              <Popover
                title={null}
                placement='bottomRight'
                trigger='click'
                content={filterContent}
                open={filterOpen}
                onOpenChange={setFilterOpen}
              >
                <Button className='flex flex-row items-center gap-1'>
                  <FilterIcon color={'#666666'} />
                  Filter
                </Button>
              </Popover>
            </div>
          </div>

          {/* Bulk actions */}
          {!isCompletedMode && selectedTaskInfo?.length > 0 && (
            <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-lightGray/40 rounded-md p-3'>
              <div className='flex items-center gap-2'>
                <StatusIcon />
                <div className='text-textColor text-sm md:text-base'>
                  {`Change the status of the selected ${selectedTaskInfo?.length} ${
                    selectedTaskInfo?.length === 1 ? 'aligner' : 'aligners'
                  }:`}
                </div>
              </div>

              <Select
                className='w-full sm:w-48 h-10'
                placeholder='Select Status'
                onSelect={handleBulkStatusChange}
                disabled={!selectedTaskInfo.length}
                options={statusOptions}
              />

              {/* Bulk Assignee */}
              {ongoingProductionAccess?.assignee?.isViewable && (
                <Select
                  className='w-full sm:w-48 h-10'
                  placeholder='Select assignee'
                  onSelect={handleBulkAssign}
                  disabled={!selectedTaskInfo.length}
                  options={activeUsers}
                  optionLabelProp='label'
                />
              )}

              {ongoingProductionAccess?.dueDate?.isViewable && (
                <BulkDueDate
                  className='w-full sm:w-48'
                  label='Set due date'
                  disabled={!selectedTaskInfo.length}
                  onApply={handleBulkDueDate}
                />
              )}
            </div>
          )}

          <div className='-mx-4 md:mx-0'>
            <div className='overflow-x-auto overflow-y-auto max-h-[70vh] rounded-lg border border-mediumGray'>
              <TableContainerForAlignerProduction
                pageNumber={pageNumber}
                handleOnSearch={handlePageChange}
                onSelectionChange={(taskInfo) => setSelectedTaskInfo(taskInfo)}
                selectedFilter={filterByStatus}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                clearSelectionTick={clearSelectionTick}
                /** ✅ pass ready lists so row dropdowns never see empty options */
                statusOptions={statusOptions}
                statusLoading={statusLoading}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <span className='text-4xl'>🔒</span>
          </div>
          <div className='text-lg font-semibold text-textColor mb-2'>No access</div>
          <div className='text-sm text-gray-500 text-center max-w-md'>
            You don’t have permission to view Ongoing Production.
          </div>
        </div>
      )}
    </>
  )
}

export default AlignerProduction
