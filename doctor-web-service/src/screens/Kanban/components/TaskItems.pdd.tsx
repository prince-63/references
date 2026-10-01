import React, {useContext, useEffect, useRef, useState} from 'react'
import type {ManufacturingBatchResponse, Task} from '../types'
import {useSelector} from 'react-redux'
import moment from 'moment'
import {getFirstLetterCapitalOfWord, safeParseInt} from 'utils/ConstFunctions'
import {truncateText} from '@utils/kanban'
import {draggable} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {dropTargetForElements} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import {
  attachClosestEdge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import {Popover, Progress, Tooltip, Input} from 'antd'
import {User} from 'lucide-react'
import useDispatchAction from '@hooks/useDispatchAction'
import {updateAssignee} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {changeMultiStatus} from 'redux/Slices/AppSlice/AlignerProduction/AlignerProduction.slice'
import PatientProfileInitials from 'components/patientDetails/PatientProfileInitials'
import {AuthContext} from 'context/AuthContext'
import {CardConfigurationField} from 'screens/settings/cardDisplay/CardDisplayPage'
import getColorPalette from 'utils/getColorPalette'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {RootState} from 'redux/store'
import getActiveProfile from '@utils/getActiveProfile'
import useAllUserPlan from '@hooks/useAllUserPlan'
import {useNavigate} from 'react-router-dom'
import ModalCard from 'components/modalCard/ModalCard'
import useProfileBasePath from '@hooks/useProfileBasePath'

const toTitleCase = (input?: string) => {
  if (!input) return ''
  return String(input)
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(' ')
}

type CommonProps = {
  // existing props parity
  id: string
  name?: string
  items?: string[]
  data?: Task[]
  isSortingContainer?: boolean
  dragOverlay?: boolean
  count?: number
  totalCount?: number
  color?: string
  // Optional sentinel ref to support per-status infinite scroll
  sentinelRef?: (el: HTMLDivElement | null) => void
  // Expose the scrollable list element so parent can use it as IntersectionObserver root
  listRootRef?: (el: HTMLDivElement | null) => void
  // PDD integration callbacks
  onCardDragStart?: (activeId: string) => void
  onCardDrop?: (payload: {activeId: string; overId: string; edge?: 'top' | 'bottom'}) => void
  // Column reordering callbacks
  onColumnDragStart?: (activeSectionId: string) => void
  onColumnDrop?: (payload: {activeId: string; overId: string; edge?: 'left' | 'right'}) => void
}

export const SectionItem: React.FC<CommonProps> = (props) => {
  const {id, items = [], name, data = [], color} = props
  const columnRef = useRef<HTMLDivElement | null>(null)
  const headerRef = useRef<HTMLDivElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [isListActive, setIsListActive] = useState(false)

  // Make column header draggable for column reordering
  useEffect(() => {
    if (!headerRef.current) return
    const cleanup = draggable({
      element: headerRef.current,
      getInitialData: () => ({type: 'SECTION', id}),
      onDragStart: () => props.onColumnDragStart && props.onColumnDragStart(id),
      onDrop: ({location}) => {
        const targets = location.current.dropTargets
        const sectionTarget = targets.find((t) => (t.data as any).type === 'SECTION')
        if (sectionTarget) {
          const data = sectionTarget.data as {id: string}
          const edge = extractClosestEdge(sectionTarget.data) as 'left' | 'right' | null
          props.onColumnDrop &&
            props.onColumnDrop({activeId: id, overId: data.id, edge: edge || undefined})
        }
      },
    })
    return cleanup
  }, [id])

  // Make whole column a drop target to calculate left/right closest edge
  useEffect(() => {
    if (!columnRef.current) return
    return dropTargetForElements({
      element: columnRef.current,
      getData: ({input, element}) =>
        attachClosestEdge({type: 'SECTION', id}, {element, input, allowedEdges: ['left', 'right']}),
    })
  }, [id])

  // Register column list as a drop target (for dropping into empty areas)
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current
    // expose list element as scroll root to parent
    props.listRootRef && props.listRootRef(el)
    return dropTargetForElements({
      element: el,
      getData: () => ({type: 'SECTION', id}),
      // Attach closest edge is not essential for section-level drops; append to end
      onDragEnter: () => setIsListActive(true),
      onDragLeave: () => setIsListActive(false),
      onDrop: () => setIsListActive(false),
    })
  }, [id])

  const getContrastColor = (hex?: string) => {
    if (!hex) return '#111'
    const c = hex.replace('#', '')
    if (c.length !== 6) return '#111'
    const r = parseInt(c.substr(0, 2), 16)
    const g = parseInt(c.substr(2, 2), 16)
    const b = parseInt(c.substr(4, 2), 16)
    const yiq = (r * 299 + g * 587 + b * 114) / 1000
    return yiq >= 150 ? '#111' : '#fff'
  }
  const lowerName = (name || '').toLowerCase()
  const whiteTextStatuses = ['records gathering', 'record gathering']
  const forceWhiteText = whiteTextStatuses.includes(lowerName)
  const headerBg = color || '#f4f4f4'
  const headerColor = forceWhiteText ? '#ffffff' : getContrastColor(headerBg)

  return (
    <div ref={columnRef} className='kanban-column' style={{border: '1px solid #dcdcdc'}}>
      <div
        ref={headerRef}
        className='kanban-column-header'
        style={{
          cursor: 'default',
          background: headerBg,
          color: headerColor,
          fontWeight: 600,
          borderBottom: '1px solid #e6e6e6',
        }}
      >
        {name}
        <span className='kanban-header-pill' style={{marginLeft: 8}}>
          {props.count ?? 0}
        </span>
      </div>
      <div
        ref={listRef}
        className='kanban-column-list'
        style={{
          background: '#f5f5f5',
          // subtle highlight when dropping to empty/append area
          boxShadow: isListActive ? 'inset 0 -3px 0 0 #2563eb' : undefined,
          transition: 'box-shadow 80ms ease',
        }}
      >
        {(items || []).map((item) => {
          return (
            <FieldItem
              key={item}
              id={item}
              item={data.find((d) => 'task-' + d.id === item)}
              // pass through callbacks for PDD
              onCardDragStart={props.onCardDragStart}
              onCardDrop={props.onCardDrop}
            />
          )
        })}
        {/* bottom sentinel for infinite scroll per status */}
        <div ref={props.sentinelRef ?? undefined} style={{height: 1}} />
      </div>
    </div>
  )
}

type FieldProps = CommonProps & {item?: Task; cardConfiguration?: CardConfigurationField[]}

export const FieldItem: React.FC<FieldProps> = (props) => {
  const {id, item} = props
  const ref = useRef<HTMLDivElement | null>(null)
  const draggingRef = useRef(false)
  const [isActive, setIsActive] = useState(false)
  const [edge, setEdge] = useState<'top' | 'bottom' | null>(null)
  const {dispatchAction} = useDispatchAction()
  const {cardConfiguration} = useSelector(
    (state: any) => state?.workFlow || {cardConfiguration: []}
  )
  const {profileId, userId} = useContext(AuthContext)
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const activeProfileUpdated = getActiveProfile(doctorData!.profiles, safeParseInt(profileId))
  const {activeUsers} = useSelector((state: RootState) => state.orders)
  const navigate = useNavigate()
  const profileBasePath = useProfileBasePath()
  const {isInternalUser, isAdmin} = useAllUserPlan()
  const [assigneeName, setAssigneeName] = useState<string>(item?.assignee || '')
  const [productionAssignModalOpen, setProductionAssignModalOpen] = useState(false)
  const {permissionChecks} = useFeatureAccess()
  const assigneePermissions = permissionChecks?.patientProfileActions?.assignee?.isViewable
  const practiceLocationPermissions =
    permissionChecks?.practiceLocation?.managePracticeLocations?.isViewable

  useEffect(() => {
    const users = Array.isArray(activeUsers) ? activeUsers : []
    const ids = (item as any)?.assignees_ids

    let resolvedName = ''

    // Case 1: find by assignee_ids[0]
    if (Array.isArray(ids) && ids.length > 0) {
      const user = users.find((u: any) => Number(u.value) === Number(ids[0]))
      if (user) {
        resolvedName = (user.label ?? '').trim()
      }
    }

    // Case 2: fallback to legacy "assignee" field
    const fallbackAssignee = ((item as any)?.assignee ?? '').toString().trim()

    const finalName = resolvedName || fallbackAssignee || ''
    setAssigneeName(finalName)
  }, [activeUsers, (item as any)?.assignees_ids, (item as any)?.assignee])
  const [assignOpen, setAssignOpen] = useState(false)
  const [userQuery, setUserQuery] = useState('')
  const workflowName = (item?.workflow_name ?? '').toString().toLowerCase()
  const isProductionTask =
    workflowName.includes('production') || workflowName.includes('ongoing product')
  const hasOngoingProduction =
    Array.isArray(item?.ongoing_label_counts) &&
    item.ongoing_label_counts.some((entry) => safeParseInt(entry?.count) > 0)
  const parentTaskId = safeParseInt(item?.id)
  const workflowId = safeParseInt(item?.workflow_id)
  const patientId = safeParseInt(item?.patient_id)
  const doctorId = safeParseInt(userId)

  const assignTask = (assigneeId: number, displayName: string) => {
    if (!item?.id) return
    setAssigneeName(displayName)
    setAssignOpen(false)
    const selectedUser = (activeUsers || []).find(
      (user: any) => Number(user?.value) === Number(assigneeId)
    )
    const selectedUserRole = (selectedUser?.sub_role ?? '').toString().trim().toLowerCase()
    const isProductionAssignee = selectedUserRole === 'production'
    const shouldAssignOngoing =
      isProductionTask &&
      hasOngoingProduction &&
      parentTaskId > 0 &&
      workflowId > 0 &&
      doctorId > 0 &&
      patientId > 0

    if (isProductionAssignee && shouldAssignOngoing) {
      dispatchAction(
        changeMultiStatus({
          task_info: [{task_id: item.id, patient_id: patientId}],
          doctor_id: doctorId,
          workflow_id: workflowId,
          assignee_id: assigneeId,
          parent_task_id: parentTaskId,
        } as any)
      )
        .unwrap()
        .then(() => {
          if (isProductionAssignee) {
            setProductionAssignModalOpen(true)
          }
        })
        .catch(() => {})
      return
    }

    dispatchAction(
      updateAssignee({
        task_id: item.id,
        assignee_id: assigneeId,
      } as any)
    )
  }

  useEffect(() => {
    if (!ref.current) return

    // Make the card draggable
    const cleanupDraggable = draggable({
      element: ref.current,
      getInitialData: () => ({type: 'FIELD', id}),
      onDragStart: () => {
        draggingRef.current = true
        props.onCardDragStart && props.onCardDragStart(id)
      },
      onDrop: ({location}) => {
        draggingRef.current = false
        const targets = location.current.dropTargets
        // prefer FIELD target for ordering; fallback to SECTION
        const fieldTarget = targets.find((t) => (t.data as any).type === 'FIELD')
        const sectionTarget = targets.find((t) => (t.data as any).type === 'SECTION')

        if (fieldTarget) {
          const data = fieldTarget.data as {id: string}
          const edge = extractClosestEdge(fieldTarget.data) as 'top' | 'bottom' | null
          props.onCardDrop &&
            props.onCardDrop({activeId: id, overId: data.id, edge: edge || undefined})
          return
        }
        if (sectionTarget) {
          const data = sectionTarget.data as {id: string}
          props.onCardDrop && props.onCardDrop({activeId: id, overId: data.id})
          return
        }
        // no valid target, ignore
      },
    })

    // Make the card a drop target (to compute before/after using closest edge)
    const cleanupDropTarget = dropTargetForElements({
      element: ref.current,
      getData: ({input, element}) =>
        attachClosestEdge({type: 'FIELD', id}, {element, input, allowedEdges: ['top', 'bottom']}),
      // Show visual indicator of where the card will be dropped relative to this card
      onDragEnter: (args: any) => {
        setIsActive(true)
        const e = extractClosestEdge(args.self.data) as 'top' | 'bottom' | null
        setEdge(e)
      },
      onDrag: (args: any) => {
        const e = extractClosestEdge(args.self.data) as 'top' | 'bottom' | null
        setEdge(e)
      },
      onDragLeave: () => {
        setIsActive(false)
        setEdge(null)
      },
      onDrop: () => {
        setIsActive(false)
        setEdge(null)
      },
    })

    return () => {
      cleanupDraggable()
      cleanupDropTarget()
    }
  }, [id])

  return (
    <div
      ref={ref}
      className='card'
      style={{
        border: '1px solid #dcdcdc',
        cursor: 'grab',
        position: 'relative',
        // Blue insertion line using inset box-shadow
        boxShadow:
          isActive && edge === 'top'
            ? 'inset 0 3px 0 0 #2563eb'
            : isActive && edge === 'bottom'
              ? 'inset 0 -3px 0 0 #2563eb'
              : undefined,
        transition: 'box-shadow 80ms ease',
      }}
    >
      <div
        onClick={() => {
          if (draggingRef.current) return
          if (item?.patient_id) {
            const queryParams = new URLSearchParams({
              kanban_name: item?.workflow_name ?? '',
            }).toString()
            navigate(`${profileBasePath}/${item.patient_id}?${queryParams}`)
          }
        }}
      >
        {(() => {
          const isMeaningful = (v: any) => {
            if (v === null || v === undefined) return false
            const s = String(v).trim()
            if (!s) return false
            const lower = s.toLowerCase()
            if (
              lower === '-' ||
              lower === '—' ||
              lower === 'null' ||
              lower === '/null' ||
              lower === 'n/a'
            )
              return false
            return true
          }

          const formatDate = (d: any) => {
            if (!d) return ''
            const m = moment(d)
            if (!m.isValid()) return String(d)
            // Keep month as title case (e.g., Oct), not all caps
            return m.format('DD-MMM-YYYY')
          }
          const orderedConfig = Array.isArray(cardConfiguration)
            ? [...cardConfiguration].sort((a, b) => a.position - b.position)
            : []
          const enabledConfig = orderedConfig.filter((f: any) => f.enabled)
          const manufacturingData: ManufacturingBatchResponse | undefined =
            item?.manufacturing_batch_response
          const pal = getColorPalette()

          // Footer renderer: shows assignee label + assign button on the right
          const RenderAssigneeFooter = () => (
            <div
              className='mt-3 pt-2'
              style={{
                borderTop: '1px solid var(--light-gray, #efefef)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13,
                color: pal.textColor,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ModalCard
                title='Ongoing productions are assigned to the production user'
                okText='OK'
                showFooter={true}
                open={productionAssignModalOpen}
                showCrossButton={false}
                drawerHeight='200px'
                onClick={() => {
                  setProductionAssignModalOpen(false)
                }}
                onClose={() => {
                  setProductionAssignModalOpen(false)
                }}
              />
              <div>
                <span>Assignee:</span> <span>{assigneeName ? assigneeName : '—'}</span>
              </div>
              <Popover
                open={assignOpen}
                onOpenChange={(v) => {
                  setAssignOpen(v)
                  if (!v) setUserQuery('')
                }}
                trigger={['click']}
                placement='topRight'
                content={
                  <div style={{width: 300}}>
                    {/* Search on top */}
                    <Input
                      placeholder='Search users'
                      autoFocus
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      prefix={<User size={14} color='#64748b' />}
                      className='mb-2'
                    />
                    {/* List below */}
                    <div style={{maxHeight: 300, overflowY: 'auto'}}>
                      {/* Assign to me */}
                      {profileId
                        ? (() => {
                            const myFullName = activeProfileUpdated?.last_name
                              ? `${activeProfileUpdated?.first_name} ${activeProfileUpdated?.last_name}`
                              : `${activeProfileUpdated?.first_name}`
                            return (
                              <div
                                className='px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 flex items-center gap-2'
                                onClick={() => {
                                  if (!item?.id) return
                                  assignTask(Number(profileId), myFullName)
                                }}
                              >
                                <PatientProfileInitials
                                  name={myFullName}
                                  className='w-6 h-6 text-xs bg-[#1A5DCC] text-white'
                                />
                                <span className='text-[13px]'>Assign to me</span>
                              </div>
                            )
                          })()
                        : null}

                      {((activeUsers || []) as any[])
                        .filter((u: any) => {
                          return Number(u.value) !== Number(profileId)
                        })
                        .filter((u: any) => {
                          // Apply search filter
                          const name = `${u.label ?? ''}`.trim().toLowerCase()
                          return name.includes(userQuery.toLowerCase())
                        })
                        .map((u: any) => {
                          const name = `${u.label ?? ''}`.trim()

                          return (
                            <div
                              key={u.value}
                              className='px-2 py-1.5 rounded cursor-pointer hover:bg-gray-50 flex items-center gap-2'
                              onClick={() => {
                                if (!item?.id) return
                                assignTask(Number(u.value), name)
                              }}
                            >
                              <PatientProfileInitials
                                name={name}
                                className='w-6 h-6 text-xs bg-[#1A5DCC] text-white'
                              />
                              <div className='flex flex-col leading-tight'>
                                <span className='text-[13px] text-gray-900 font-medium'>
                                  {name}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                }
              >
                <Tooltip title={assigneeName ? `Assignee: ${assigneeName}` : 'Unassigned'}>
                  <button
                    aria-label='Assign user'
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'transparent',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                    }}
                  >
                    {assigneeName ? (
                      <PatientProfileInitials
                        name={assigneeName}
                        className='w-7 h-7 text-[11px] bg-[#1A5DCC] text-white'
                      />
                    ) : (
                      <User size={16} color='#64748b' />
                    )}
                  </button>
                </Tooltip>
              </Popover>
            </div>
          )

          if (!orderedConfig.length) {
            const title = isMeaningful(item?.patient_name)
              ? toTitleCase(String(item?.patient_name))
              : ''
            const gender = isMeaningful(item?.gender)
              ? getFirstLetterCapitalOfWord(item?.gender as string)
              : ''
            const age = isMeaningful(item?.age) ? item?.age : ''
            const patientId = isMeaningful(item?.customer_mapped_id) ? item?.customer_mapped_id : ''
            const product = isMeaningful(item?.product) ? item?.product : ''
            const createdBy = isMeaningful(item?.created_by) ? item?.created_by : ''
            const createdOn = isMeaningful(item?.created_on) ? formatDate(item?.created_on) : ''
            const total = Number(
              (manufacturingData as any)?.current_batch_total_aligners ??
                (manufacturingData as any)?.total ??
                (manufacturingData as any)?.total_aligners?.count ??
                0
            )
            const current_status_name = ['Packaged', 'Shipped', 'Delivered']
            const isCompleted = current_status_name.includes(item?.current_status_name ?? '')

            const completed =
              (manufacturingData as any)?.ongoing_task_packaged_count == 0 && isCompleted
                ? (manufacturingData as any)?.current_batch_total_aligners
                : (manufacturingData as any)?.ongoing_task_packaged_count
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0
            const isShowCreatedByDetails =
              (!item?.is_cloned_order && serviceConfig?.PLANNING && !isInternalUser) ||
              !(serviceConfig?.PLANNING && isInternalUser && !isAdmin)
            return (
              <div>
                {/* Header */}
                {title ? (
                  <div className='font-semibold text-gray-900 text-lg truncate...'>
                    {truncateText(title as string)}
                  </div>
                ) : null}
                {/* Patient Details Section */}
                {gender ? (
                  <div
                    style={{fontSize: 13, color: pal.textColor}}
                    className='flex items-center gap-2'
                  >
                    <span>Gender:</span>
                    <span>{gender}</span>
                  </div>
                ) : null}

                {age ? (
                  <div style={{fontSize: 13, color: pal.textColor}}>Age: {age} years</div>
                ) : null}
                {patientId ? (
                  <div
                    className='flex justify-between items-center mb-2'
                    style={{fontSize: 13, color: pal.textColor}}
                  >
                    <div>
                      Patient ID: <span>{truncateText(String(patientId))}</span>
                    </div>
                  </div>
                ) : null}
                {product ? (
                  <div style={{fontSize: 13, color: pal.textColor}}>
                    Product:
                    <span
                      className='inline-block px-2 py-1 rounded-full'
                      style={{backgroundColor: pal.lighterGray, color: pal.neutralBlack}}
                    >
                      {product}
                    </span>
                  </div>
                ) : null}
                {manufacturingData && (
                  <div
                    className='my-2'
                    style={{
                      fontSize: 13,
                      color: pal.textColor,
                      borderTop: `1px solid ${pal.lighterGray}`,
                      marginTop: 8,
                      paddingTop: 8,
                    }}
                  >
                    <div style={{fontWeight: 900}}>Production</div>
                    <div className='flex gap-1 items-start'>
                      <div>Quantity : </div>
                      <span>
                        {Number(
                          (manufacturingData as any)?.current_batch_total_aligners ??
                            (manufacturingData as any)?.total ??
                            (manufacturingData as any)?.total_aligners?.count ??
                            0
                        )}
                      </span>
                    </div>

                    <div>
                      {completed} out of {total} completed
                    </div>
                    <Progress percent={percent} />
                  </div>
                )}
                {createdBy && isShowCreatedByDetails ? (
                  <div style={{fontSize: 13, color: pal.textColor}}>
                    Created By: {truncateText(String(createdBy))}
                  </div>
                ) : null}
                {createdOn ? (
                  <div style={{fontSize: 13, color: pal.textColor}}>
                    Created On: {truncateText(String(createdOn))}
                  </div>
                ) : null}
                {/* Customer Name */}
                {isMeaningful(item?.customer_name) && isShowCreatedByDetails ? (
                  <div style={{fontSize: 13, color: pal.textColor}}>
                    Customer: {truncateText(String(item?.customer_name))}
                  </div>
                ) : null}
                {/* Assignee shown only in footer; removed from patient details */}

                {/* Production Details Section */}
                {manufacturingData ? (
                  <div
                    className='my-2'
                    style={{
                      borderTop: `1px solid ${pal.lighterGray}`,
                      marginTop: 8,
                      paddingTop: 8,
                    }}
                  >
                    <div className='font-semibold text-gray-900 truncate...'>Production</div>
                    <div className='flex gap-1 items-start text-black font-medium'>
                      <div>Quantity : </div>
                      <span className='font-normal text-textColor'>
                        {manufacturingData?.total_aligners?.count}
                      </span>
                    </div>

                    <div>
                      {completed} out of {total} completed
                    </div>
                    <Progress percent={percent} />
                  </div>
                ) : null}

                {/* Footer */}
                {assigneePermissions && <RenderAssigneeFooter />}
              </div>
            )
          }

          const valueFor = (key: string) => {
            // Map patient_id display to customer_mapped_id as per requirement
            const actualKey = key === 'patient_id' ? 'customer_mapped_id' : key
            const raw = (item as any)?.[actualKey]
            if (key === 'product') {
              return isMeaningful(item?.service_products?.product_name) ? item.product_name : ''
            }
            if (key === 'created_on' || key === 'follow_up_date') return formatDate(raw)

            return isMeaningful(raw) ? raw : ''
          }

          const total = Number(
            (manufacturingData as any)?.current_batch_total_aligners ??
              (manufacturingData as any)?.total ??
              (manufacturingData as any)?.total_aligners?.count ??
              0
          )
          const current_status_name = ['Packaged', 'Shipped', 'Delivered']
          const isCompleted = current_status_name.includes(item?.current_status_name ?? '')

          const completed =
            (manufacturingData as any)?.ongoing_task_packaged_count == 0 && isCompleted
              ? (manufacturingData as any)?.current_batch_total_aligners
              : (manufacturingData as any)?.ongoing_task_packaged_count
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0

          const {isAlignerCompanyOrg, isGrowthPlanUser} = useAllUserPlan()
          const isRealGrowthUser = !isAlignerCompanyOrg && isGrowthPlanUser
          const isShowCreatedByDetails =
            (!item?.is_cloned_order && serviceConfig?.PLANNING && !isInternalUser) ||
            !(serviceConfig?.PLANNING && isInternalUser && !isAdmin)

          return (
            <div className='space-y-1'>
              {/* Always show patient name at the top, regardless of config */}
              {isMeaningful(item?.patient_name) ? (
                <div className='font-semibold text-gray-900 text-lg truncate...'>
                  {toTitleCase(String(item?.patient_name))}
                </div>
              ) : null}
              {isShowCreatedByDetails && isMeaningful(item?.patient_created_by) ? (
                <div style={{fontSize: 13, color: pal.textColor}}>
                  Created By: {truncateText(String(item?.patient_created_by))}
                </div>
              ) : null}
              {/* Render remaining fields from config except patient_name to avoid duplication */}
              {enabledConfig
                // Always show patient_name at top and never duplicate assignee in details
                .filter(
                  (cfg: any) =>
                    cfg.field_key !== 'patient_name' &&
                    cfg.field_key !== 'assignee' &&
                    cfg.field_key !== 'created_by' &&
                    cfg.field_key !== 'customer_name'
                )
                .map((cfg: any) => {
                  const rawVal = valueFor(cfg.field_key)
                  const val =
                    cfg.field_key === 'case_type' && String(rawVal) === 'NEW_CASE'
                      ? 'NEW CASE'
                      : rawVal

                  if (!val) return null
                  if (
                    (cfg.field_key === 'clinic' || cfg.label?.toLowerCase().includes('clinic')) &&
                    !practiceLocationPermissions
                  ) {
                    return null
                  }
                  const displayVal = cfg.field_key === 'age' ? `${val} years` : val
                  return (
                    <div
                      key={cfg.id}
                      className='flex items-center gap-1 flex-wrap'
                      style={{lineHeight: '1.1rem', fontSize: 13, color: pal.textColor}}
                    >
                      <span>{cfg.label}:</span>
                      {cfg.display_type === 'BADGE' && cfg.field_key !== 'gender' ? (
                        <span
                          className='inline-block px-2 py-0.5 rounded-full'
                          style={{backgroundColor: pal.lighterGray, color: pal.neutralBlack}}
                        >
                          {displayVal}
                        </span>
                      ) : (
                        <span>{displayVal}</span>
                      )}
                    </div>
                  )
                })}
              {manufacturingData ? (
                <div
                  className='my-2'
                  style={{
                    fontSize: 13,
                    color: pal.textColor,
                    borderTop: `1px solid ${pal.lighterGray}`,
                    marginTop: 8,
                    paddingTop: 8,
                  }}
                >
                  <div style={{fontWeight: 600}}>Production</div>
                  <div className='flex gap-1 items-start'>
                    <div>Quantity : </div>
                    <span>
                      {Number(
                        (manufacturingData as any)?.current_batch_total_aligners ??
                          (manufacturingData as any)?.total ??
                          (manufacturingData as any)?.total_aligners?.count ??
                          0
                      )}
                    </span>
                  </div>

                  <div>
                    {completed} out of {total} completed
                  </div>
                  <Progress percent={percent} />
                </div>
              ) : null}
              {/* Customer Name */}
              {isShowCreatedByDetails && !isRealGrowthUser && isMeaningful(item?.customer_name) ? (
                <div style={{fontSize: 13, color: pal.textColor}}>
                  Customer: {truncateText(String(item?.customer_name))}
                </div>
              ) : null}

              {/* Footer */}
              {assigneePermissions && <RenderAssigneeFooter />}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
