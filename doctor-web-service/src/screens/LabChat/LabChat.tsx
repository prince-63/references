import {useCallback, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import useDispatchAction from '@hooks/useDispatchAction'
import {getCaseTeams} from 'redux/Slices/AppSlice/CaseTeam/caseTeam.slice'
import {RootState} from 'redux/store'
import Spinner from 'components/spinner/Spinner'
import {setIsBottomBarOpen} from 'redux/Slices/AppSlice/Dashboard/MobileSidebarSlice'
import AssignCaseTeamModal from './components/AssignCaseTeamModal'
import {ChatPanel} from './components/ChatPanel'
import GroupInfoModal from './components/GroupInfoModal'
import {ThreadSidebar} from './components/ThreadSidebar'
import type {QuickCheckInData} from './components/QuickCheckInModal'
import {ComposeMessagePayload, LabChatMessage, LabChatThread} from './types'
import {useLabChatSidebar} from './hooks/useLabChatSidebar'

const getCurrentTimeLabel = () =>
  new Date().toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })

const getLastMessagePreview = ({
  type,
  content,
  attachmentName,
}: {
  type: ComposeMessagePayload['type']
  content: string
  attachmentName?: string
}) => {
  if (type === 'pdf') return `PDF: ${attachmentName ?? content}`
  if (type === 'image') return `Image: ${attachmentName ?? content}`
  if (type === 'video') return `Video: ${attachmentName ?? content}`
  if (type === 'voice') return 'Voice note sent'
  return content
}

const LabChat = () => {
  const labChatSidebar = useLabChatSidebar()
  const {
    threads,
    selectedThreadId,
    selectedThread,
    selectedCustomerId,
    selectThread,
    setSelectedCustomerFilter,
    sendMessageForSelectedChat,
    createAlignerCheckInForSelectedChat,
    selectedThreadProgress,
    latestAlignerNumberByPatientId,
    loadOlderMessagesForSelectedChat,
    hasMoreMessagesForSelectedChat,
    isLoadingMoreMessagesForSelectedChat,
    hasFetchedMessagesForSelectedChat,
    isLoadingMessagesForSelectedChat,
    loadSelectedThreadGroupInfo,
    retrySelectedThreadGroupInfo,
    assignCaseTeamToSelectedChat,
    selectedThreadGroupInfo,
    selectedThreadGroupInfoLoading,
    selectedThreadGroupInfoError,
    assignCaseTeamLoading,
    assignCaseTeamError,
    upsertSelectedThread,
    messagesError,
    typingUsers,
    sendTypingStatus,
    markMessagesRead,
    isSendingMessage,
  } = labChatSidebar

  const searchQuery =
    'searchQuery' in labChatSidebar
      ? String((labChatSidebar as {searchQuery?: string}).searchQuery ?? '')
      : ''
  const setSearchQuery =
    'setSearchQuery' in labChatSidebar
      ? ((labChatSidebar as {setSearchQuery?: (search: string) => void}).setSearchQuery ??
        (() => {}))
      : () => {}
  const loadMoreChats =
    'loadMoreChats' in labChatSidebar
      ? ((labChatSidebar as {loadMoreChats?: () => void}).loadMoreChats ?? (() => {}))
      : () => {}
  const hasMoreChats =
    'hasMoreChats' in labChatSidebar
      ? Boolean((labChatSidebar as {hasMoreChats?: boolean}).hasMoreChats)
      : false
  const isLoadingMoreChats =
    'isLoadingMoreChats' in labChatSidebar
      ? Boolean((labChatSidebar as {isLoadingMoreChats?: boolean}).isLoadingMoreChats)
      : false

  const isCheckInInProgress =
    'isCheckInInProgress' in labChatSidebar
      ? Boolean((labChatSidebar as {isCheckInInProgress?: boolean}).isCheckInInProgress)
      : false
  const {dispatchAction} = useDispatchAction()
  const {caseTeamsData, getCaseTeamsLoading, getCaseTeamsError} = useSelector(
    (state: RootState) => state.caseTeam
  )
  const isChatsLoading = useSelector((state: RootState) => state.labChat.loading)
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false)
  const [isAssignCaseTeamModalOpen, setIsAssignCaseTeamModalOpen] = useState(false)
  const caseTeams = useMemo(() => caseTeamsData?.teams ?? [], [caseTeamsData?.teams])
  const shouldShowInitialThreadLoader =
    !!selectedThreadId && (isLoadingMessagesForSelectedChat || !hasFetchedMessagesForSelectedChat)

  const updateSelectedThread = useCallback(
    (message: LabChatMessage) => {
      if (!selectedThread) return
      const preview = getLastMessagePreview({
        type: message.type,
        content: message.content,
        attachmentName: message.attachmentName,
      })
      const updatedThread: LabChatThread = {
        ...selectedThread,
        messages: [...selectedThread.messages, message],
        lastMessagePreview: preview,
        lastUpdated: 'Just now',
      }
      upsertSelectedThread(updatedThread)
    },
    [selectedThread, upsertSelectedThread]
  )

  const handleSendMessage = useCallback(
    async (payload: ComposeMessagePayload) => {
      if (!selectedThreadId) return
      await sendMessageForSelectedChat(payload)
    },
    [selectedThreadId, sendMessageForSelectedChat]
  )

  const handleQuickCheckInSave = useCallback(
    async (data: QuickCheckInData) => {
      if (!selectedThreadId) return

      const saved = await createAlignerCheckInForSelectedChat(data)
      if (saved) return

      const checkInSummary = [
        `Treatment plan: ${data.treatmentPlanName}.`,
        `Quick check-in submitted for aligner ${data.alignerNumber}.`,
        data.notes ? `Notes: ${data.notes}` : undefined,
        data.files.length > 0
          ? `Attached files: ${data.files.map((file) => file.name).join(', ')}`
          : undefined,
      ]
        .filter(Boolean)
        .join('\n')

      const checkInMessage: LabChatMessage = {
        id: `message-${Date.now()}`,
        senderRole: 'practice',
        isOwnMessage: true,
        senderName: selectedThread?.practiceName ?? 'Practice',
        content: checkInSummary,
        timestamp: getCurrentTimeLabel(),
        createdAt: new Date().toISOString(),
        type: 'text',
      }

      updateSelectedThread(checkInMessage)
    },
    [
      createAlignerCheckInForSelectedChat,
      selectedThreadId,
      selectedThread?.practiceName,
      updateSelectedThread,
    ]
  )

  const handleOpenGroupInfo = useCallback(() => {
    setIsGroupInfoModalOpen(true)
    void loadSelectedThreadGroupInfo()
  }, [loadSelectedThreadGroupInfo])

  const handleCloseGroupInfo = useCallback(() => {
    setIsGroupInfoModalOpen(false)
  }, [])

  const handleRetryGroupInfo = useCallback(() => {
    void retrySelectedThreadGroupInfo()
  }, [retrySelectedThreadGroupInfo])

  const fetchCaseTeams = useCallback(() => {
    void dispatchAction(
      getCaseTeams({
        page: 0,
        size: 100,
      })
    )
  }, [dispatchAction])

  useEffect(() => {
    if (!isAssignCaseTeamModalOpen) return
    fetchCaseTeams()
  }, [fetchCaseTeams, isAssignCaseTeamModalOpen])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches
    if (!isMobileViewport) return
    dispatchAction(setIsBottomBarOpen(!selectedThreadId))
  }, [dispatchAction, selectedThreadId])

  useEffect(() => {
    return () => {
      dispatchAction(setIsBottomBarOpen(true))
    }
  }, [dispatchAction])

  const handleOpenAssignCaseTeam = useCallback(() => {
    setIsAssignCaseTeamModalOpen(true)
  }, [])

  const handleCloseAssignCaseTeam = useCallback(() => {
    setIsAssignCaseTeamModalOpen(false)
  }, [])

  const handleAssignCaseTeam = useCallback(
    async (caseTeamId: number) => {
      const isAssigned = await assignCaseTeamToSelectedChat(caseTeamId)
      if (!isAssigned) return
      setIsAssignCaseTeamModalOpen(false)
    },
    [assignCaseTeamToSelectedChat]
  )

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex h-full min-h-0 w-full flex-col bg-gray-50 md:flex-row'>
        <div className={`${selectedThread ? 'hidden md:block' : 'block'} h-full min-h-0`}>
          <ThreadSidebar
            threads={threads}
            latestAlignerNumberByPatientId={latestAlignerNumberByPatientId}
            selectedThreadId={selectedThreadId}
            onSelectThread={selectThread}
            selectedCustomerId={selectedCustomerId}
            onCustomerFilterChange={setSelectedCustomerFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onLoadMore={loadMoreChats}
            hasMoreChats={hasMoreChats}
            isLoadingMoreChats={isLoadingMoreChats}
            isLoading={isChatsLoading}
            errorMessage={messagesError}
          />
        </div>

        <div className={`h-full min-h-0 flex-1 ${selectedThread ? 'flex' : 'hidden md:flex'}`}>
          {isChatsLoading && threads.length === 0 ? (
            <div className='flex h-full w-full items-center justify-center'>
              <Spinner loading />
            </div>
          ) : (
            <ChatPanel
              selectedThread={selectedThread}
              selectedThreadProgress={selectedThreadProgress}
              onSendMessage={handleSendMessage}
              onQuickCheckInSave={handleQuickCheckInSave}
              onLoadOlderMessages={loadOlderMessagesForSelectedChat}
              hasMoreMessages={hasMoreMessagesForSelectedChat}
              isLoadingMoreMessages={isLoadingMoreMessagesForSelectedChat}
              onBackToList={() => selectThread('')}
              onGroupInfoClick={handleOpenGroupInfo}
              onAssignCaseTeamClick={handleOpenAssignCaseTeam}
              typingUsers={typingUsers}
              onSendTypingStatus={sendTypingStatus}
              onMarkMessagesRead={markMessagesRead}
              isMessagesLoading={shouldShowInitialThreadLoader}
              isCheckInInProgress={isCheckInInProgress}
              isSendingMessage={isSendingMessage}
            />
          )}
        </div>
      </div>
      <GroupInfoModal
        isOpen={isGroupInfoModalOpen}
        onClose={handleCloseGroupInfo}
        chatInfo={selectedThreadGroupInfo}
        loading={selectedThreadGroupInfoLoading}
        errorMessage={selectedThreadGroupInfoError}
        onRetry={handleRetryGroupInfo}
      />
      <AssignCaseTeamModal
        isOpen={isAssignCaseTeamModalOpen}
        onClose={handleCloseAssignCaseTeam}
        caseTeams={caseTeams}
        loading={getCaseTeamsLoading}
        assignLoading={assignCaseTeamLoading}
        errorMessage={assignCaseTeamError ?? getCaseTeamsError}
        onRetry={fetchCaseTeams}
        onSelectCaseTeam={handleAssignCaseTeam}
      />
    </div>
  )
}

export default LabChat
