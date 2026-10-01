import Spinner from 'components/spinner/Spinner'
import {ComposeMessagePayload, LabChatProgress, LabChatThread} from '../types'
import {ChatInput} from './ChatInput'
import {QuickCheckInData} from './QuickCheckInModal'
import {ChatHeader} from './ChatHeader'
import {MessageContainer} from './MessageContainer'

interface ChatPanelProps {
  selectedThread: LabChatThread | undefined
  selectedThreadProgress: LabChatProgress | null
  onSendMessage: (payload: ComposeMessagePayload) => void
  onQuickCheckInSave: (data: QuickCheckInData) => void
  onLoadOlderMessages?: () => void
  hasMoreMessages?: boolean
  isLoadingMoreMessages?: boolean
  onBackToList: () => void
  onGroupInfoClick: () => void
  onAssignCaseTeamClick: () => void
  typingUsers?: string[]
  onSendTypingStatus?: (isTyping: boolean) => void
  onMarkMessagesRead?: (messageIds: string[]) => void
  /** Compact sidebar mode – simplified header, smaller input area */
  compact?: boolean
  isMessagesLoading?: boolean
  isCheckInInProgress?: boolean
  isSendingMessage?: boolean
}

export const ChatPanel = ({
  selectedThread,
  selectedThreadProgress,
  onSendMessage,
  onQuickCheckInSave,
  onLoadOlderMessages,
  hasMoreMessages = false,
  isLoadingMoreMessages = false,
  onBackToList,
  onGroupInfoClick,
  onAssignCaseTeamClick,
  typingUsers = [],
  onSendTypingStatus,
  onMarkMessagesRead,
  compact = false,
  isMessagesLoading = false,
  isCheckInInProgress = false,
  isSendingMessage = false,
}: ChatPanelProps) => {
  const selectedPatientId = selectedThread
    ? Number(String(selectedThread.patientId).replace(/\D/g, '')) || undefined
    : undefined

  if (!selectedThread) {
    return (
      <div className='flex h-full min-h-0 flex-1 items-center justify-center bg-gray-50'>
        <p className='text-sm text-gray-500'>Select a patient group chat to start.</p>
      </div>
    )
  }

  return (
    <div className='flex h-full min-h-0 flex-1 flex-col overflow-x-hidden bg-white'>
      <ChatHeader
        selectedThread={selectedThread}
        selectedThreadProgress={selectedThreadProgress}
        onBackToList={onBackToList}
        onGroupInfoClick={onGroupInfoClick}
        onAssignCaseTeamClick={onAssignCaseTeamClick}
        compact={compact}
        isCheckInInProgress={isCheckInInProgress}
      />
      <MessageContainer
        selectedThread={selectedThread}
        onLoadOlderMessages={onLoadOlderMessages}
        hasMoreMessages={hasMoreMessages}
        isLoadingMoreMessages={isLoadingMoreMessages}
        typingUsers={typingUsers}
        onMarkMessagesRead={onMarkMessagesRead}
        compact={compact}
        isMessagesLoading={isMessagesLoading}
      />

      <ChatInput
        key={selectedThread.id}
        patientId={selectedPatientId}
        onSendMessage={onSendMessage}
        onQuickCheckInSave={onQuickCheckInSave}
        onSendTypingStatus={onSendTypingStatus}
        compact={compact}
        disabled={isCheckInInProgress}
        isSendingMessage={isSendingMessage}
      />
      {isCheckInInProgress ? (
        <div className='absolute inset-0 z-20 flex items-center justify-center bg-white/65 backdrop-blur-[1px]'>
          <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm'>
            <Spinner loading size={16} />
            <p className='text-sm font-medium text-gray-700'>Check-in in progress...</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
