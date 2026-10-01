import useDispatchAction from '@hooks/useDispatchAction'
import {Input, Select} from 'antd'
import {AuthContext} from 'context/AuthContext'
import {useContext, useMemo, useState} from 'react'
import {FiSearch} from 'react-icons/fi'
import {MdOutlineArrowDropDown, MdOutlineArrowDropUp} from 'react-icons/md'
import {useSelector} from 'react-redux'
import {RootState} from 'redux/store'
import {updateAssignee} from 'redux/Slices/AppSlice/accessControl/AccessControl.slice'
import {changeMultiStatus} from 'redux/Slices/AppSlice/AlignerProduction/AlignerProduction.slice'
import {safeParseInt} from 'utils/ConstFunctions'
import cn from '@utils/cn'

const ASSIGN_TO_ME_VALUE = '__assign_me__'
const ASSIGN_TO_ME_LABEL = 'Assign to me'

type AssigneeUserSelectorProps = {
  taskId?: number
  assigneeName?: string
  assigneeProfileId?: number | null
  onAssigned?: () => void
  className?: string
  bordered?: boolean
  selectionTextClassName?: string
  selectionPlaceholderClassName?: string
  workflowName?: string | null
  workflowId?: number | null
  parentTaskId?: number | null
  patientId?: number | null
  ongoingLabelCounts?: {count?: number | null}[] | null
  hasOngoingProduction?: boolean
  multiTask?: boolean
  setProductionAssignModalOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

export const AssigneeUserSelector = ({
  taskId,
  assigneeName,
  assigneeProfileId,
  onAssigned,
  className,
  bordered = true,
  selectionTextClassName,
  selectionPlaceholderClassName,
  workflowName,
  workflowId,
  patientId,
  multiTask = true,
  setProductionAssignModalOpen,
}: AssigneeUserSelectorProps) => {
  const {activeUsers: userList, loadingActiveUsers: loadingList} = useSelector(
    (state: RootState) => state.orders
  )
  const [open, setOpen] = useState()
  const [searchQuery, setSearchQuery] = useState('')
  const {dispatchAction} = useDispatchAction()
  const [assigning, setAssigning] = useState(false)

  const {profileId, userId} = useContext(AuthContext)
  const {doctorData} = useSelector((state: RootState) => state.apiDoctorProfileGet)
  const meProfileId = safeParseInt(profileId)
  const resolvedWorkflowName = (workflowName ?? '').toString().toLowerCase()
  const isProductionTask =
    resolvedWorkflowName.includes('production') || resolvedWorkflowName.includes('ongoing product')
  const resolvedWorkflowId = safeParseInt(workflowId)
  const resolvedPatientId = safeParseInt(patientId)
  const resolvedDoctorId = safeParseInt(userId)

  const formatDisplayName = (
    salutation?: string | null,
    firstName?: string | null,
    lastName?: string | null,
    fallback?: string | null
  ) => {
    const rawSalutation = (salutation ?? '').toString().trim()
    const salutationPart =
      rawSalutation.length === 0
        ? ''
        : rawSalutation.endsWith('.')
          ? rawSalutation
          : `${rawSalutation}.`
    const first = (firstName ?? '').toString().trim()
    const last = (lastName ?? '').toString().trim()
    const namePart = [first, last].filter(Boolean).join(' ').trim()
    const combined = [salutationPart, namePart].filter(Boolean).join(' ').trim()

    const fallbackTrimmed = (fallback ?? '').toString().trim()
    return combined || fallbackTrimmed || undefined
  }

  const meDisplayName = useMemo(() => {
    if (!meProfileId) return undefined
    const list = (userList as any[]) ?? []
    const userFromList = list.find((user) => {
      const userProfileId = Number(user?.profile_id ?? user?.id ?? user?.value)
      return Number.isFinite(userProfileId) && userProfileId === meProfileId
    })

    if (userFromList) {
      const firstName = (userFromList?.first_name ?? '').toString().trim()
      const lastName = (userFromList?.last_name ?? '').toString().trim()
      const baseName =
        [firstName, lastName].filter(Boolean).join(' ') ||
        (userFromList?.email ?? '').toString().trim()
      const fallback =
        baseName ||
        (userFromList?.display_name ?? '').toString().trim() ||
        (userFromList?.label ?? '').toString().trim()
      return (
        formatDisplayName(userFromList?.salutation, firstName, lastName, fallback) ||
        fallback ||
        undefined
      )
    }

    const doctorProfiles = Array.isArray((doctorData as any)?.profiles)
      ? (doctorData as any)?.profiles
      : []
    const matchedProfile = doctorProfiles.find(
      (profile: any) => safeParseInt(profile?.profile_id) === meProfileId
    )
    const defaultProfile =
      matchedProfile ?? (doctorData as any)?.default_profile ?? doctorProfiles[0] ?? null

    const rawFirstName = (defaultProfile?.first_name ?? (doctorData as any)?.first_name ?? '')
      .toString()
      .trim()
    const rawLastName = (defaultProfile?.last_name ?? (doctorData as any)?.last_name ?? '')
      .toString()
      .trim()
    const displayName = (defaultProfile?.display_name ?? '').toString().trim()
    const salutation = (defaultProfile?.salutation ?? '').toString().trim()

    return (
      formatDisplayName(salutation, rawFirstName, rawLastName, displayName) ||
      displayName ||
      undefined
    )
  }, [doctorData, meProfileId, userList])

  const options = useMemo(() => {
    const list = (userList as any[]).filter((user) => user?.value !== profileId)
    const optionMap = new Map<number, string>()

    const addOption = (value?: number | null, label?: string | null) => {
      const parsedValue = safeParseInt(value)
      const trimmedLabel = (label ?? '').toString().trim()
      if (!parsedValue || !trimmedLabel) return
      if (!optionMap.has(parsedValue)) {
        optionMap.set(parsedValue, trimmedLabel)
      }
    }

    list.forEach((user) => {
      const userProfileId = user?.profile_id ?? user?.id ?? user?.value
      const parsedProfileId = safeParseInt(userProfileId)
      if (meProfileId && parsedProfileId === meProfileId) {
        return
      }
      const firstName = (user?.first_name ?? '').toString().trim()
      const lastName = (user?.last_name ?? '').toString().trim()
      const baseName =
        [firstName, lastName].filter(Boolean).join(' ') || (user?.email ?? '').toString().trim()
      const fallback =
        baseName || (user?.display_name ?? '').toString().trim() || (user?.label ?? '').toString()
      const label = formatDisplayName(user?.salutation, firstName, lastName, fallback)
      addOption(parsedProfileId, label ?? fallback)
    })

    // Add current assignee only when it's not "me" (to avoid showing my name alongside "Assign to me")
    const isSelfAssignee =
      assigneeProfileId && meProfileId && Number(assigneeProfileId) === Number(meProfileId)
    if (!isSelfAssignee) {
      addOption(assigneeProfileId, assigneeName)
    }

    const mapped = Array.from(optionMap.entries()).map(([value, label]) => ({
      value,
      label: label.trim(),
      searchText: label.trim(),
    }))

    if (meProfileId) {
      const doctorProfiles = Array.isArray((doctorData as any)?.profiles)
        ? (doctorData as any)?.profiles
        : []
      const matchedProfile = doctorProfiles.find(
        (profile: any) => safeParseInt(profile?.profile_id) === meProfileId
      )
      const defaultProfile =
        matchedProfile ?? (doctorData as any)?.default_profile ?? doctorProfiles[0] ?? null
      const rawFirstName = (defaultProfile?.first_name ?? (doctorData as any)?.first_name ?? '')
        .toString()
        .trim()
      const rawLastName = (defaultProfile?.last_name ?? (doctorData as any)?.last_name ?? '')
        .toString()
        .trim()

      const salutation = (defaultProfile?.salutation ?? '').toString().trim()
      const formattedSelfName =
        formatDisplayName(salutation, rawFirstName, rawLastName, meDisplayName) ||
        meDisplayName ||
        ASSIGN_TO_ME_LABEL

      const assignLabel = formattedSelfName
      const assignSearchText = `${ASSIGN_TO_ME_LABEL} ${formattedSelfName}`.trim()
      return [
        {
          value: ASSIGN_TO_ME_VALUE,
          label: assignLabel,
          displayLabel: ASSIGN_TO_ME_LABEL,
          searchText: assignSearchText,
        },
        ...mapped,
      ]
    }

    return mapped
  }, [assigneeName, assigneeProfileId, doctorData, meDisplayName, meProfileId, userList])

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return options
    return options.filter((option) => {
      const label = (option?.label ?? '').toString().toLowerCase()
      const searchText = (option as any)?.searchText?.toString().toLowerCase?.() ?? ''
      return label.includes(query) || searchText.includes(query)
    })
  }, [options, searchQuery])

  const assignUser = (assigneeId?: number) => {
    if (!taskId || !assigneeId) return
    setAssigning(true)
    const selectedUser = (userList as any[]).find((user) => {
      const userProfileId = Number(user?.value ?? user?.profile_id ?? user?.id)
      return Number.isFinite(userProfileId) && userProfileId === Number(assigneeId)
    })
    const selectedUserRole = (selectedUser?.sub_role ?? '').toString().trim().toLowerCase()
    const isProductionAssignee = selectedUserRole === 'production'
    const shouldAssignOngoing =
      isProductionTask && !!workflowName && workflowName.includes('Production') && !!taskId
    resolvedWorkflowId > 0 && resolvedDoctorId > 0 && resolvedPatientId > 0

    const action =
      multiTask && isProductionAssignee && shouldAssignOngoing
        ? changeMultiStatus({
            task_info: [{task_id: taskId, patient_id: resolvedPatientId}],
            doctor_id: resolvedDoctorId,
            workflow_id: resolvedWorkflowId,
            assignee_id: assigneeId,
            parent_task_id: taskId,
          } as any)
        : updateAssignee({task_id: taskId, assignee_id: assigneeId} as any)

    dispatchAction(action as any)
      .unwrap()
      .then(() => {
        if (isProductionAssignee && shouldAssignOngoing) {
          if (!!setProductionAssignModalOpen) {
            setProductionAssignModalOpen(true)
          }
        }
        onAssigned?.()
      })
      .finally(() => {
        setAssigning(false)
      })
  }

  const handleChange = (value: number | string) => {
    if (value === ASSIGN_TO_ME_VALUE) {
      if (!meProfileId) return
      assignUser(meProfileId)
      setSearchQuery('')
      return
    }

    const parsedValue = safeParseInt(value)
    if (!parsedValue) return
    assignUser(parsedValue)
    setSearchQuery('')
  }

  if (!options.length) {
    return (
      <>
        <div className='text-sm'>{assigneeName ?? '-'}</div>
      </>
    )
  }

  const stopPropagation = (event: React.SyntheticEvent) => {
    event.stopPropagation()
  }

  const isAssignedToMe =
    meProfileId && assigneeProfileId && Number(meProfileId) === Number(assigneeProfileId)
  const selectedValue =
    isAssignedToMe && meProfileId
      ? ASSIGN_TO_ME_VALUE
      : typeof assigneeProfileId === 'number' && !Number.isNaN(assigneeProfileId)
        ? assigneeProfileId
        : undefined

  return (
    <div onClick={stopPropagation} onMouseDown={stopPropagation} onKeyDown={stopPropagation}>
      <Select
        size='middle'
        placeholder={assigneeName || 'Assign user'}
        value={selectedValue}
        options={filteredOptions}
        optionFilterProp='label'
        showSearch={false}
        filterOption={false}
        loading={loadingList || assigning}
        onChange={handleChange}
        style={{
          backgroundColor: 'transparent',
          width: '100%',
          padding: 0,
        }}
        optionRender={(option) => {
          const displayLabel = (option.data as any)?.displayLabel
          return <span>{displayLabel ?? option.label}</span>
        }}
        className={cn(
          '!min-w-[140px] !p-0 !m-0 !text-sm !font-medium',
          '[&_.ant-select-selector]:!shadow-none',
          '[&_.ant-select-selector]:!rounded-md',
          '[&_.ant-select-selector]:!px-3',
          '[&_.ant-select-selector]:!py-1',
          '[&_.ant-select-selector]:hover:!bg-primarySupport',
          selectionTextClassName
            ? `[&_.ant-select-selection-item]:${selectionTextClassName}`
            : '[&_.ant-select-selection-item]:!text-black',
          selectionPlaceholderClassName
            ? `[&_.ant-select-selection-placeholder]:${selectionPlaceholderClassName}`
            : '[&_.ant-select-selection-placeholder]:!text-gray-500',
          bordered
            ? [
                '[&_.ant-select-selector]:!border',
                '[&_.ant-select-selector]:!border-mediumGray',
                'hover:[&_.ant-select-selector]:!border-primaryColor',
              ]
            : ['[&_.ant-select-selector]:!border-0', '[&_.ant-select-selector]:!bg-transparent'],
          className
        )}
        styles={{
          popup: {
            root: {padding: 1, width: 300},
          },
        }}
        popupRender={(menu) => (
          <div className='w-100'>
            <Input
              allowClear
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search'
              suffix={<FiSearch className='text-gray-500' />}
              className='!h-8 !rounded-xl !border !border-mediumGray !text-base'
            />
            <div className='max-h-64 overflow-y-auto px-1'>{menu}</div>
          </div>
        )}
        onOpenChange={(isOpen) => {
          setOpen(isOpen)
          if (!isOpen) setSearchQuery('')
        }}
        suffixIcon={
          open ? (
            <MdOutlineArrowDropUp className='w-5 h-5 text-black' />
          ) : (
            <MdOutlineArrowDropDown className='w-5 h-5 text-black' />
          )
        }
      />
    </div>
  )
}
