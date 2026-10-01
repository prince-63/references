import {useEffect, useMemo, useRef, useState} from 'react'
import type {UIEvent} from 'react'
import {Search} from 'lucide-react'
import VirtualList from 'rc-virtual-list'
import {safeParseInt} from 'utils/ConstFunctions'
import {LabChatThread} from '../types'
import PatientsFilterData from './PatientsFilterData'
import useAllUserPlan from '@hooks/useAllUserPlan'
import When from 'components/when/When'
import Spinner from 'components/spinner/Spinner'

interface ThreadSidebarProps {
  threads: LabChatThread[]
  latestAlignerNumberByPatientId: Record<number, number>
  selectedThreadId: string
  onSelectThread: (threadId: string) => void
  selectedCustomerId: number | null
  onCustomerFilterChange: (customerId: number | null) => void
  searchQuery: string
  onSearchQueryChange: (search: string) => void
  onLoadMore: () => void
  hasMoreChats: boolean
  isLoadingMoreChats?: boolean
  isLoading?: boolean
  errorMessage?: string | null
}

export const ThreadSidebar = ({
  threads,
  latestAlignerNumberByPatientId,
  selectedThreadId,
  onSelectThread,
  selectedCustomerId,
  onCustomerFilterChange,
  searchQuery,
  onSearchQueryChange,
  onLoadMore,
  hasMoreChats,
  isLoadingMoreChats = false,
  isLoading = false,
  errorMessage = null,
}: ThreadSidebarProps) => {
  const {isEnterprisePlanUser} = useAllUserPlan()
  const listViewportRef = useRef<HTMLDivElement | null>(null)
  const [listHeight, setListHeight] = useState(0)

  const getThreadLatestMessageTime = (thread: LabChatThread) => {
    const lastMessage = thread.messages[thread.messages.length - 1]
    if (lastMessage?.createdAt) {
      const parsed = new Date(lastMessage.createdAt).getTime()
      if (!Number.isNaN(parsed)) return parsed
    }

    if (lastMessage?.timestamp) {
      const parsed = new Date(lastMessage.timestamp).getTime()
      if (!Number.isNaN(parsed)) return parsed
    }

    return 0
  }

  const filteredThreads = useMemo(() => {
    return [...threads].sort(
      (left, right) => getThreadLatestMessageTime(right) - getThreadLatestMessageTime(left)
    )
  }, [threads])

  useEffect(() => {
    const container = listViewportRef.current
    if (!container) return

    const updateHeight = () => {
      setListHeight(container.clientHeight)
    }

    updateHeight()

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => {
      updateHeight()
    })
    observer.observe(container)

    return () => {
      observer.disconnect()
    }
  }, [])

  const handleListScroll = (event: UIEvent<HTMLElement>) => {
    const target = event.currentTarget
    const remainingDistance = target.scrollHeight - target.scrollTop - target.clientHeight
    const loadMoreThreshold = 220

    if (remainingDistance > loadMoreThreshold) return
    if (isLoading || isLoadingMoreChats) return
    if (!hasMoreChats) return
    onLoadMore()
  }

  useEffect(() => {
    if (!hasMoreChats) return
    if (isLoading || isLoadingMoreChats) return
    if (listHeight <= 0) return
    if (filteredThreads.length === 0) return

    const estimatedContentHeight = filteredThreads.length * 96
    if (estimatedContentHeight > listHeight + 48) return

    onLoadMore()
  }, [filteredThreads.length, hasMoreChats, isLoading, isLoadingMoreChats, listHeight, onLoadMore])

  return (
    <aside className='flex h-full min-h-0 w-full flex-col border-r border-gray-200 bg-white md:w-[340px]'>
      <div className='border-b border-gray-200 px-4 py-4'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Chat</h1>
            <p className='mt-1 text-sm text-gray-500'>
              Group chat between lab and practice for each patient.
            </p>
          </div>
        </div>
        <div className='mt-3 flex flex-col gap-2 sm:flex-row'>
          <div className='relative flex-1'>
            <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder='Search by patient name or ID'
              className='w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-700 outline-none transition-colors focus:border-primaryColor'
            />
          </div>
          <When isTrue={isEnterprisePlanUser}>
            <PatientsFilterData
              selectedCustomerId={selectedCustomerId}
              onCustomerChange={onCustomerFilterChange}
            />
          </When>
        </div>
      </div>

      {isLoading ? (
        <div className='border-b border-gray-100 px-4 py-3'>
          <Spinner loading size={16} />
        </div>
      ) : null}
      {errorMessage ? (
        <div className='border-b border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600'>
          Unable to load latest chat updates.
        </div>
      ) : null}

      <div ref={listViewportRef} className='flex-1 min-h-0'>
        {!isLoading && threads.length === 0 ? (
          <div className='px-4 py-6 text-sm text-gray-500'>
            {searchQuery.trim()
              ? `No chats found for "${searchQuery}".`
              : 'No lab chats available.'}
          </div>
        ) : null}
        {filteredThreads.length > 0 && listHeight > 0 ? (
          <VirtualList
            data={filteredThreads}
            height={listHeight}
            itemHeight={96}
            itemKey='id'
            onScroll={handleListScroll}
            className='scroll-smooth'
          >
            {(thread: LabChatThread) => {
              const isSelected = thread.id === selectedThreadId
              const numericPatientId = safeParseInt(String(thread.patientId).replace(/\D/g, ''))
              const latestAlignerNumber =
                numericPatientId > 0 ? latestAlignerNumberByPatientId[numericPatientId] : undefined
              const customerMappedId = String(thread.customer_mapped_id ?? '').trim()
              const metadataLine = [
                customerMappedId ? customerMappedId : null,
                latestAlignerNumber ? `Aligner ${latestAlignerNumber}` : null,
              ]
                .filter(Boolean)
                .join(' • ')

              return (
                <button
                  key={thread.id}
                  type='button'
                  onClick={() => onSelectThread(thread.id)}
                  className={`flex w-full items-start gap-3 border-b border-gray-100 px-4 py-4 text-left transition-colors ${
                    isSelected ? 'bg-primarySupport' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primarySupport text-sm font-semibold text-primaryColor'>
                    {thread.patientInitials}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='truncate text-sm font-semibold text-gray-900'>
                        {thread.patientName}
                      </p>
                      <span className='shrink-0 text-xs text-gray-500'>{thread.lastUpdated}</span>
                    </div>
                    {metadataLine ? (
                      <p className='mt-0.5 text-xs text-gray-500'>{metadataLine}</p>
                    ) : null}
                    <p className='mt-1 truncate text-xs text-gray-700'>
                      {thread.lastMessagePreview}
                    </p>
                    <div className='mt-2 flex items-center justify-between'>
                      {thread.unreadCount > 0 ? (
                        <span className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primaryColor px-1.5 text-xs font-semibold text-white'>
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              )
            }}
          </VirtualList>
        ) : null}
        {isLoadingMoreChats ? (
          <div className='border-t border-gray-100 px-4 py-3'>
            <Spinner loading size={16} />
          </div>
        ) : null}
      </div>
    </aside>
  )
}
