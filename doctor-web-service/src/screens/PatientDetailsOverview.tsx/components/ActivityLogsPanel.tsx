import React, {useEffect, useMemo, useRef, useCallback} from 'react'
import {useSelector} from 'react-redux'
import type {RootState} from 'redux/store'
import {
  getActivityCommentLogs,
  resetActivityCommentLogs,
} from 'redux/Slices/AppSlice/ActivityCommentLogs/ActivityCommentLogs.slice'

import {Timeline, Typography, Empty, Spin} from 'antd'

import CalenderIcon from 'assets/icons/CalenderIcon'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import {SVG_PERSON_GRAY} from 'utils/SvgConstants'
import getColorPalette from 'utils/getColorPalette'
import {useNavigate, useParams} from 'react-router-dom'
import AntdButton from 'components/atom/Buttons/AntdButton'
import useDispatchAction from '@hooks/useDispatchAction'
import useProfileBasePath from '@hooks/useProfileBasePath'
import When from 'components/when/When'

const {Text, Title} = Typography

type ActivityLogsPanelProps = {
  hideHeader?: boolean
  setIsActivitySheetOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

// ---------------- Utilities ----------------
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  const d = new Date(dateString)
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} at ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })}`
}

// ---------------- Sub components ----------------
const ActivityMeta: React.FC<{by?: string; at?: string; isShowCreatedByDetails: boolean}> = ({
  by,
  at,
  isShowCreatedByDetails,
}) => {
  const textColor = getColorPalette().textColor
  return (
    <div className='mt-2 flex flex-col gap-4 text-xs text-gray-500'>
      {isShowCreatedByDetails && (
        <span className='inline-flex items-center gap-1'>
          <CommonSVG svg={SVG_PERSON_GRAY} width='14' height='14' />
          <span>{by || '-'}</span>
        </span>
      )}
      <span className='inline-flex items-center gap-1'>
        <CalenderIcon color={textColor} />
        <span>{formatDate(at)}</span>
      </span>
    </div>
  )
}

const ActivityBody: React.FC<{description?: string}> = ({description}) => (
  <div className='flex items-start gap-2'>
    <p className='text-gray-900 text-[15px] leading-snug'>
      <span className='italic font-medium'>{description}</span>
    </p>
  </div>
)

const ActivityItem: React.FC<{node: any; isShowCreatedByDetails: boolean}> = ({
  node,
  isShowCreatedByDetails,
}) => (
  <div className='py-1'>
    <ActivityBody description={node?.description} />
    <ActivityMeta
      by={node?.created_by}
      at={node?.timestamp}
      isShowCreatedByDetails={isShowCreatedByDetails}
    />
  </div>
)

// ---------------- Main Component ----------------
const ActivityLogsPanel: React.FC<ActivityLogsPanelProps> = ({
  hideHeader = false,
  setIsActivitySheetOpen,
}) => {
  const {dispatchAction} = useDispatchAction()
  const navigate = useNavigate()
  const {patientId} = useParams<{patientId: string}>()
  const profileBasePath = useProfileBasePath()
  const loaderRef = useRef<HTMLDivElement | null>(null)

  const {data, loading, loadingMore, hasMore, page, error} = useSelector(
    (state: RootState) => state.activityCommentLogs
  )
  const {serviceConfig} = useSelector((state: RootState) => state.serviceConfiguration)
  const getIndividualTaskList = useSelector(
    (state: RootState) => state.workFlow.getIndividualTaskList
  )
  const isShowCreatedByDetails = !getIndividualTaskList?.is_cloned_order && serviceConfig?.PLANNING

  // Fetch first page
  useEffect(() => {
    if (!patientId) return
    dispatchAction(resetActivityCommentLogs())
    dispatchAction(
      getActivityCommentLogs({
        patient_id: patientId,
        page_number: 0,
        page_size: 10,
      })
    )
  }, [dispatchAction, patientId])

  // ✅ Your API returns `data.content` (array of ActivityItems)
  const allItems = useMemo(() => {
    const content = Array.isArray((data as any)?.content) ? (data as any).content : []
    return [...content].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [data])

  // Prepare AntD timeline items
  const timelineItems = useMemo(
    () =>
      allItems.map((item: any, idx: number) => ({
        key: `${item?.timestamp}-${idx}`,
        dot: (
          <span className='relative z-10 mt-[2px] h-2.5 w-2.5 rounded-full bg-blue-600 shadow-[0_0_0_3px_rgba(59,130,246,0.25)] inline-block' />
        ),
        children: <ActivityItem node={item} isShowCreatedByDetails={isShowCreatedByDetails} />,
      })),
    [allItems]
  )

  // ---------------- Infinite Scroll Observer ----------------
  const loadMore = useCallback(() => {
    if (!patientId || loadingMore || !hasMore) return
    dispatchAction(
      getActivityCommentLogs({
        patient_id: patientId,
        page_number: page + 1,
        page_size: 10,
      })
    )
  }, [dispatchAction, patientId, page, hasMore, loadingMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting) loadMore()
      },
      {threshold: 1}
    )

    const current = loaderRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [loadMore])

  // ---------------- Render ----------------
  return (
    <aside className='w-full h-full'>
      <div className='flex h-full flex-col bg-white border border-mediumGray rounded-xl overflow-hidden mt-4'>
        <When isTrue={!hideHeader}>
          <div className='px-5 py-4 border-b border-mediumGray'>
            <Title level={5} className='!mb-0'>
              Recent Activity
            </Title>
          </div>
        </When>

        <div className='flex-1 min-h-[20rem] p-3 overflow-y-auto'>
          {loading && allItems.length === 0 ? (
            <div className='flex justify-center items-center h-full'>
              <Spin />
            </div>
          ) : error ? (
            <div className='text-center py-8 text-red-500 text-sm'>Failed to load activities.</div>
          ) : allItems.length > 0 ? (
            <>
              <Timeline items={timelineItems} className='px-2' />
              <div ref={loaderRef} className='flex justify-center py-4'>
                {loadingMore && <Spin />}
              </div>
            </>
          ) : (
            <div className='px-2 py-12'>
              <Empty description={<Text type='secondary'>No activity yet</Text>} />
            </div>
          )}
        </div>

        {allItems.length > 0 && (
          <div className='px-5 py-3 border-t border-gray-100 text-center'>
            <AntdButton
              type='text'
              className='!text-gray-600 hover:!text-gray-600 focus:!text-gray-600 active:!text-gray-600 hover:!bg-transparent focus:!bg-transparent active:!bg-transparent'
              onClick={() => {
                setIsActivitySheetOpen?.(false)
                navigate(`${profileBasePath}/${patientId}/activity-logs/audit-logs`)
              }}
              text='View All'
            />
          </div>
        )}
      </div>
    </aside>
  )
}

export default ActivityLogsPanel
