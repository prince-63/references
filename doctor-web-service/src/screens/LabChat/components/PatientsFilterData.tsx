import {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {Popover} from 'antd'
import {Filter} from 'lucide-react'
import useDispatchAction from '@hooks/useDispatchAction'
import {AuthContext} from 'context/AuthContext'
import Spinner from 'components/spinner/Spinner'
import {getActivePractices} from 'redux/Slices/AppSlice/Practices/practices.slice'
import type {RootState} from 'redux/store'
import {useSelector} from 'react-redux'
import {safeParseInt} from 'utils/ConstFunctions'

interface PatientsFilterDataProps {
  selectedCustomerId: number | null
  onCustomerChange: (customerId: number | null) => void
}

const PatientsFilterData = ({selectedCustomerId, onCustomerChange}: PatientsFilterDataProps) => {
  const {dispatchAction} = useDispatchAction()
  const {userId, organizationId, profileId} = useContext(AuthContext)
  const {activePractices, loadingActivePractices} = useSelector(
    (state: RootState) => state.practices
  )
  const [isOpen, setIsOpen] = useState(false)

  const getActivePracticeList = useCallback(async () => {
    if (userId && organizationId && profileId) {
      await dispatchAction(
        getActivePractices({
          data: {
            sort_order: 'PRACTICE_NAME_ASC',
            page_number: 0,
            page_size: 0,
            search: '',
            doctor_id: safeParseInt(userId),
            organization_id: safeParseInt(organizationId),
            invitation_status: 'ACCEPTED',
            invitation_roles: ['CONSULTING_ORTHODONTIST'],
          },
        })
      )
    }
  }, [dispatchAction, organizationId, profileId, userId])

  useEffect(() => {
    void getActivePracticeList()
  }, [getActivePracticeList])

  const selectedCustomerLabel = useMemo(() => {
    if (!selectedCustomerId) return 'All Customers'
    const matched = (activePractices ?? []).find(
      (item) => safeParseInt(item.value) === selectedCustomerId
    )
    return matched?.label ?? 'All Customers'
  }, [activePractices, selectedCustomerId])

  const filterContent = (
    <div className='w-[260px] p-3'>
      <div className='max-h-64 overflow-y-auto'>
        <button
          type='button'
          onClick={() => {
            onCustomerChange(null)
            setIsOpen(false)
          }}
          className={`mb-1 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm ${
            selectedCustomerId === null
              ? 'bg-primarySupport font-semibold text-primaryColor'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Customers
        </button>

        {loadingActivePractices ? (
          <div className='px-2 py-2'>
            <Spinner loading size={14} />
          </div>
        ) : null}

        {!loadingActivePractices && (activePractices?.length ?? 0) === 0 ? (
          <div className='px-2 py-2 text-xs text-gray-500'>No practices found.</div>
        ) : null}

        {!loadingActivePractices &&
          (activePractices ?? []).map((practice) => {
            const customerId = safeParseInt(practice.value)
            const isSelected = customerId > 0 && customerId === selectedCustomerId

            return (
              <button
                key={String(practice.value)}
                type='button'
                onClick={() => {
                  onCustomerChange(customerId > 0 ? customerId : null)
                  setIsOpen(false)
                }}
                className={`mb-1 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm ${
                  isSelected
                    ? 'bg-primarySupport font-semibold text-primaryColor'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {practice.label}
              </button>
            )
          })}
      </div>
    </div>
  )

  return (
    <Popover
      content={filterContent}
      trigger='click'
      placement='bottomRight'
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <button
        type='button'
        className='inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 transition-colors hover:border-primaryColor hover:text-primaryColor'
        aria-label='Filter by practice'
        title='Filter by practice'
      >
        <Filter className='h-4 w-4' />
        <span className='max-w-[130px] truncate'>{selectedCustomerLabel}</span>
      </button>
    </Popover>
  )
}

export default PatientsFilterData
