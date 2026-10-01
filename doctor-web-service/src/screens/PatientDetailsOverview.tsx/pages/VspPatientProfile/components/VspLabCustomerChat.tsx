import {useCallback, useEffect, useMemo, useState, useContext} from 'react'
import {FormikHelpers} from 'formik'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import useDispatchAction from '@hooks/useDispatchAction'
import {useFeatureAccess} from '@hooks/useFeatureAccess'
import {safeParseInt} from 'utils/ConstFunctions'
import {getCaseTeams} from 'redux/Slices/AppSlice/CaseTeam/caseTeam.slice'
import {addNotes, getNotes, updateNotes} from 'redux/Slices/AppSlice/Calendar/calendar.slice'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import {ChatPanel} from 'screens/LabChat/components/ChatPanel'
import GroupInfoModal from 'screens/LabChat/components/GroupInfoModal'
import AssignCaseTeamModal from 'screens/LabChat/components/AssignCaseTeamModal'
import type {QuickCheckInData} from 'screens/LabChat/components/QuickCheckInModal'
import type {ComposeMessagePayload, LabChatThread} from 'screens/LabChat/types'
import {useLabChatSidebar} from 'screens/LabChat/hooks/useLabChatSidebar'
import ModalDeleteNote from 'screens/PatientDetailsOverview.tsx/components/ModalDeleteNote'
import InternalNotesSection, {
  InternalNoteFormValues,
  InternalNoteItem,
} from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/components/InternalNotesSection'
import SectionCard from 'screens/PatientDetailsOverview.tsx/pages/CustomerPatientProfile/components/SectionCard'
import {ChevronDown, Clock, History, Info, Lock, MessageSquare} from 'lucide-react'
import useAllUserPlan from '@hooks/useAllUserPlan'
import When from 'components/when/When'
import VspCaseHistoryCard from './VspCaseHsitoryCard'

interface VspLabCustomerChatProps {
  chatId: number | null
}

const getInitials = (name: string) => {
  const words = name
    .split(' ')
    .map((item) => item.trim())
    .filter(Boolean)

  if (words.length === 0) return 'LC'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

const VspLabCustomerChat = ({chatId}: VspLabCustomerChatProps) => {
  const {patientId} = useParams<{patientId: string}>()
  const parsedPatientId = safeParseInt(patientId)
  const {dispatchAction} = useDispatchAction()
  const {profileId} = useContext(AuthContext)
  const {permissionChecks} = useFeatureAccess()
  const rawChatMessagesError = useSelector((state: RootState) => state.labChat.messagesError)
  const {caseTeamsData, getCaseTeamsLoading, getCaseTeamsError} = useSelector(
    (state: RootState) => state.caseTeam
  )
  const {patientData} = useSelector((state: RootState) => state.customerPatientProfile)
  const notes = useSelector((state: RootState) =>
    state.calendar.notes.map((n: any) => ({
      id: n.note_id,
      text: n.notes,
      addedBy: n.added_by_user_name,
      patientId: n.patient_id,
      updatedAt:
        n.updated_at ||
        n.updatedAt ||
        n.last_updated_at ||
        n.last_updated_on ||
        n.updated_on ||
        null,
      createdAt: n.created_at || n.createdAt || n.created_on || null,
    }))
  )
  const notesLoading = useSelector((state: RootState) => state.calendar.addNotesLoading)
  const labChatSidebar = useLabChatSidebar({disableChatListFetch: true, initialChatId: chatId})
  const {isPractice} = useAllUserPlan()
  const {
    threads,
    selectedThreadId,
    selectedThread,
    selectThread,
    upsertSelectedThread,
    sendMessageForSelectedChat,
    createAlignerCheckInForSelectedChat,
    selectedThreadProgress,
    loadSelectedThreadGroupInfo,
    retrySelectedThreadGroupInfo,
    assignCaseTeamToSelectedChat,
    selectedThreadGroupInfo,
    selectedThreadGroupInfoLoading,
    selectedThreadGroupInfoError,
    assignCaseTeamLoading,
    assignCaseTeamError,
    loadOlderMessagesForSelectedChat,
    hasMoreMessagesForSelectedChat,
    isLoadingMoreMessagesForSelectedChat,
    hasFetchedMessagesForSelectedChat,
    isLoadingMessagesForSelectedChat,
    isLoadingMessages,
    messagesError,
    typingUsers,
    sendTypingStatus,
    markMessagesRead,
    isSendingMessage,
  } = labChatSidebar
  const isCheckInInProgress =
    'isCheckInInProgress' in labChatSidebar
      ? Boolean((labChatSidebar as {isCheckInInProgress?: boolean}).isCheckInInProgress)
      : false

  const profileIdNumber =
    profileId !== null && profileId !== undefined && !Number.isNaN(Number(profileId))
      ? Number(profileId)
      : null
  const patientIdForNotes = useMemo(() => {
    if (patientData?.patient_id) return safeParseInt(patientData.patient_id)
    if (parsedPatientId) return parsedPatientId
    return null
  }, [parsedPatientId, patientData?.patient_id])
  const notesAccess = permissionChecks?.patientProfileActions?.internalNotesTab
  const canAddNote = notesAccess?.isAddable ?? false
  const canEditNote = notesAccess?.isEditable ?? false
  const canDeleteNote = notesAccess?.isDeletable ?? false
  const showInternalNotes = !isPractice
  const isCaseChatAccessDenied = useMemo(() => {
    if (!rawChatMessagesError) return false

    if (typeof rawChatMessagesError === 'string') {
      const normalized = rawChatMessagesError.toLowerCase()
      return normalized.includes('ge0001') || normalized.includes('access denied to this chat')
    }

    if (typeof rawChatMessagesError === 'object') {
      const errorCode = String((rawChatMessagesError as any)?.error_code ?? '').toUpperCase()
      const message = String((rawChatMessagesError as any)?.message ?? '').toLowerCase()
      return errorCode === 'GE0001' || message.includes('access denied to this chat')
    }

    return false
  }, [rawChatMessagesError])
  const shouldShowCaseChat = !isCaseChatAccessDenied

  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false)
  const [isAssignCaseTeamModalOpen, setIsAssignCaseTeamModalOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState<'chat' | 'history' | 'internal'>('chat')
  const [desktopSection, setDesktopSection] = useState<'chat' | 'internal'>('chat')
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false)
  const [editingNote, setEditingNote] = useState<InternalNoteItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<{id: number; patientId: number} | null>(null)

  useEffect(() => {
    if (shouldShowCaseChat) return

    setMobileSection((prev) => {
      if (prev !== 'chat') return prev
      return showInternalNotes ? 'internal' : 'history'
    })
    setDesktopSection((prev) => {
      if (prev !== 'chat') return prev
      return showInternalNotes ? 'internal' : prev
    })
  }, [shouldShowCaseChat, showInternalNotes])

  const resolvedMobileSection = useMemo(() => {
    if (shouldShowCaseChat) return mobileSection
    if (mobileSection !== 'chat') return mobileSection
    return showInternalNotes ? 'internal' : 'history'
  }, [mobileSection, shouldShowCaseChat, showInternalNotes])

  const resolvedDesktopSection = useMemo(() => {
    if (shouldShowCaseChat) return desktopSection
    if (!showInternalNotes) return desktopSection
    if (desktopSection !== 'chat') return desktopSection
    return 'internal'
  }, [desktopSection, shouldShowCaseChat, showInternalNotes])

  const caseTeams = useMemo(() => caseTeamsData?.teams ?? [], [caseTeamsData?.teams])
  const internalNoteInitialValues = useMemo(
    () => ({
      internalNote: editingNote?.text ?? '',
    }),
    [editingNote?.text]
  )
  const expectedThreadId = useMemo(() => `chat-${chatId}`, [chatId])

  const chatIdThread = useMemo(
    () => threads.find((thread) => thread.id === expectedThreadId),
    [expectedThreadId, threads]
  )

  const patientThread = useMemo(() => {
    if (!parsedPatientId) return undefined

    return threads.find(
      (thread) => safeParseInt(String(thread.patientId).replace(/\D/g, '')) === parsedPatientId
    )
  }, [parsedPatientId, threads])
  const targetThread = chatIdThread ?? patientThread

  useEffect(() => {
    if (!chatId) return
    if (chatIdThread) return

    const resolvedPatientId = parsedPatientId || safeParseInt(patientData?.patient_id)
    const fallbackPatientName = String(
      patientData?.full_name ?? patientThread?.patientName ?? 'Patient'
    )
    const placeholderThread: LabChatThread = {
      id: expectedThreadId,
      patientName: fallbackPatientName,
      patient_added_by_name: String(patientThread?.patient_added_by_name ?? ''),
      customer_name: String(patientThread?.customer_name ?? ''),
      patientId: String(resolvedPatientId || 0),
      patientInitials: getInitials(fallbackPatientName),
      treatmentProgress: String(patientThread?.treatmentProgress ?? '--'),
      practiceName: String(patientThread?.practiceName ?? '--'),
      labName: String(patientThread?.labName ?? '--'),
      lastUpdated: 'Just now',
      unreadCount: 0,
      lastMessagePreview: 'No messages yet',
      messages: [],
      customer_mapped_id: String(
        patientData?.customer_mapped_id ?? patientThread?.customer_mapped_id ?? ''
      ),
    }
    upsertSelectedThread(placeholderThread)
  }, [
    chatId,
    chatIdThread,
    expectedThreadId,
    parsedPatientId,
    patientData?.customer_mapped_id,
    patientData?.full_name,
    patientData?.patient_id,
    patientThread?.customer_mapped_id,
    patientThread?.customer_name,
    patientThread?.labName,
    patientThread?.patientName,
    patientThread?.patient_added_by_name,
    patientThread?.practiceName,
    patientThread?.treatmentProgress,
    upsertSelectedThread,
  ])

  useEffect(() => {
    if (!targetThread) return
    if (selectedThreadId === targetThread.id) return
    selectThread(targetThread.id)
  }, [targetThread, selectedThreadId, selectThread])

  const activeThread =
    targetThread && selectedThread?.id === targetThread.id ? selectedThread : targetThread
  const isThreadSelectionInFlight = !!activeThread?.id && selectedThreadId !== activeThread.id
  const shouldShowInitialThreadLoader =
    !!activeThread?.id &&
    (isThreadSelectionInFlight ||
      isLoadingMessagesForSelectedChat ||
      !hasFetchedMessagesForSelectedChat)

  const fetchCaseTeams = useCallback(() => {
    void dispatchAction(
      getCaseTeams({
        page: 0,
        size: 100,
      })
    )
  }, [dispatchAction])

  const fetchNotes = useCallback(() => {
    if (!patientIdForNotes || !profileIdNumber || !showInternalNotes) return
    void dispatchAction(
      getNotes({
        patient_id: patientIdForNotes,
        profile_id: profileIdNumber,
      })
    )
  }, [dispatchAction, patientIdForNotes, profileIdNumber, showInternalNotes])

  useEffect(() => {
    if (!isAssignCaseTeamModalOpen) return
    fetchCaseTeams()
  }, [fetchCaseTeams, isAssignCaseTeamModalOpen])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const handleSendMessage = useCallback(
    async (payload: ComposeMessagePayload) => {
      if (!activeThread) return
      await sendMessageForSelectedChat(payload)
    },
    [activeThread, sendMessageForSelectedChat]
  )

  const handleQuickCheckInSave = useCallback(
    async (data: QuickCheckInData) => {
      if (!activeThread) return
      await createAlignerCheckInForSelectedChat(data)
    },
    [activeThread, createAlignerCheckInForSelectedChat]
  )

  const handleOpenGroupInfo = useCallback(() => {
    if (!activeThread) return
    setIsGroupInfoModalOpen(true)
    void loadSelectedThreadGroupInfo()
  }, [activeThread, loadSelectedThreadGroupInfo])

  const handleCloseGroupInfo = useCallback(() => {
    setIsGroupInfoModalOpen(false)
  }, [])

  const handleRetryGroupInfo = useCallback(() => {
    void retrySelectedThreadGroupInfo()
  }, [retrySelectedThreadGroupInfo])

  const handleOpenAssignCaseTeam = useCallback(() => {
    if (!activeThread) return
    setIsAssignCaseTeamModalOpen(true)
  }, [activeThread])

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

  const handleInternalNoteSubmit = useCallback(
    async (
      values: InternalNoteFormValues,
      formikHelpers: FormikHelpers<InternalNoteFormValues>
    ) => {
      const trimmedNote = values.internalNote.trim()
      if (!trimmedNote) return
      if (!patientIdForNotes || !profileIdNumber) return

      try {
        if (editingNote) {
          if (!canEditNote) return
          await dispatchAction(
            updateNotes({
              note_id: editingNote.id,
              user_profile_id: profileIdNumber,
              patient_id: editingNote.patientId ?? patientIdForNotes,
              notes: trimmedNote,
            })
          ).unwrap()
        } else {
          if (!canAddNote) return
          await dispatchAction(
            addNotes({
              patient_id: patientIdForNotes,
              user_profile_id: profileIdNumber,
              notes: trimmedNote,
            })
          ).unwrap()
        }
        formikHelpers.resetForm()
        setEditingNote(null)
        fetchNotes()
      } catch (error) {
        console.error('Failed to save internal note:', error)
      }
    },
    [
      canAddNote,
      canEditNote,
      dispatchAction,
      editingNote,
      fetchNotes,
      patientIdForNotes,
      profileIdNumber,
    ]
  )

  const handleEditInternalNote = useCallback(
    (note: InternalNoteItem) => {
      if (!canEditNote) return
      setEditingNote(note)
    },
    [canEditNote]
  )

  const handleDeleteInternalNote = useCallback(
    (note: {id: number; patientId?: number}) => {
      if (!canDeleteNote) return
      const resolvedPatientId = note.patientId ?? patientIdForNotes
      if (!resolvedPatientId) return
      setNoteToDelete({id: note.id, patientId: resolvedPatientId})
      setIsDeleteModalOpen(true)
    },
    [canDeleteNote, patientIdForNotes]
  )

  const handleDeleteNoteSuccess = useCallback(() => {
    setIsDeleteModalOpen(false)
    setNoteToDelete(null)
    fetchNotes()
  }, [fetchNotes])

  const chatSection = (className: string) => (
    <SectionCard className={className}>
      {activeThread ? (
        <div className='h-full min-h-0'>
          <ChatPanel
            selectedThread={activeThread}
            selectedThreadProgress={selectedThreadProgress}
            onSendMessage={handleSendMessage}
            onQuickCheckInSave={handleQuickCheckInSave}
            onLoadOlderMessages={loadOlderMessagesForSelectedChat}
            hasMoreMessages={hasMoreMessagesForSelectedChat}
            isLoadingMoreMessages={isLoadingMoreMessagesForSelectedChat}
            onBackToList={() => {}}
            onGroupInfoClick={handleOpenGroupInfo}
            onAssignCaseTeamClick={handleOpenAssignCaseTeam}
            typingUsers={typingUsers}
            onSendTypingStatus={sendTypingStatus}
            onMarkMessagesRead={markMessagesRead}
            compact
            isMessagesLoading={shouldShowInitialThreadLoader}
            isCheckInInProgress={isCheckInInProgress}
            isSendingMessage={isSendingMessage}
          />
        </div>
      ) : (
        <>
          <div className='flex items-center justify-between border-b border-gray-200 px-3 py-3'>
            <div className='flex items-center gap-2'>
              <MessageSquare className='h-4 w-4 text-primaryColor' />
              <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wide'>Case Chat</h3>
            </div>
          </div>
          <div className='flex h-full flex-col items-center justify-center gap-4 px-5 py-6 text-center'>
            {isLoadingMessages ? (
              <p className='text-sm text-gray-500'>Loading patient chat...</p>
            ) : (
              <>
                <div className='flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50'>
                  <Lock className='h-6 w-6 text-slate-500' />
                </div>
                <div className='space-y-2'>
                  <p className='text-base font-bold text-[#111827] uppercase'>Chat Locked</p>
                  <p className='max-w-[260px] text-sm text-slate-500'>
                    The chat remains locked until the case is submitted to the lab.
                  </p>
                </div>
                <div className='w-full max-w-[240px] rounded-2xl border border-indigo-200 bg-indigo-50 px-3.5 py-4'>
                  <div className='mb-2 flex justify-center'>
                    <Info className='h-3.5 w-3.5 text-indigo-500' />
                  </div>
                  <p className='text-[11px] font-semibold text-indigo-600 uppercase tracking-[0.14em]'>
                    Draft cases do not support communication features.
                  </p>
                </div>
              </>
            )}
            {messagesError ? <p className='text-xs text-red'>{messagesError}</p> : null}
          </div>
        </>
      )}
    </SectionCard>
  )

  const historySection = (className: string) => (
    <SectionCard className={className}>
      <button
        type='button'
        onClick={() => setIsHistoryCollapsed((prev) => !prev)}
        className={`flex items-center justify-between shrink-0 text-left ${
          isHistoryCollapsed ? 'pb-0' : 'pb-3'
        }`}
        aria-expanded={!isHistoryCollapsed}
      >
        <div className='flex items-center gap-2'>
          <History size={18} className='text-primaryColor' />
          <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wide'>Case History</h3>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform ${isHistoryCollapsed ? '-rotate-90' : ''}`}
        />
      </button>
      {!isHistoryCollapsed ? (
        <div className='flex-1 min-h-0 overflow-y-auto scrollbar-hide'>
          <VspCaseHistoryCard />
        </div>
      ) : null}
    </SectionCard>
  )

  return (
    <>
      <div className='flex h-full min-h-0 flex-col gap-3 overflow-hidden'>
        {shouldShowCaseChat || showInternalNotes ? (
          <div className='md:hidden shrink-0 rounded-2xl border border-gray-200 bg-gray-50 p-1'>
            <div
              className={`grid gap-1 ${
                shouldShowCaseChat && showInternalNotes ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              {shouldShowCaseChat ? (
                <button
                  type='button'
                  onClick={() => setMobileSection('chat')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${
                    resolvedMobileSection === 'chat'
                      ? 'bg-white text-primaryColor shadow-sm'
                      : 'text-gray-500 hover:text-primaryColor'
                  }`}
                >
                  <MessageSquare className='h-4 w-4' />
                  Case Chat
                </button>
              ) : null}
              {showInternalNotes ? (
                <button
                  type='button'
                  onClick={() => setMobileSection('internal')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${
                    resolvedMobileSection === 'internal'
                      ? 'bg-white text-primaryColor shadow-sm'
                      : 'text-gray-500 hover:text-primaryColor'
                  }`}
                >
                  <Lock className='h-4 w-4' />
                  Internal
                </button>
              ) : null}
              <button
                type='button'
                onClick={() => setMobileSection('history')}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${
                  resolvedMobileSection === 'history'
                    ? 'bg-white text-primaryColor shadow-sm'
                    : 'text-gray-500 hover:text-primaryColor'
                }`}
              >
                <History className='h-4 w-4' />
                Case History
              </button>
            </div>
          </div>
        ) : null}

        <div
          className={`md:hidden overflow-hidden ${
            resolvedMobileSection === 'history' && isHistoryCollapsed ? '' : 'flex-1 min-h-0'
          }`}
        >
          {shouldShowCaseChat && resolvedMobileSection === 'chat'
            ? chatSection('h-full min-h-0 !p-0 !gap-0 overflow-hidden')
            : null}
          {resolvedMobileSection === 'history' &&
            historySection(
              isHistoryCollapsed
                ? 'shrink-0 !gap-0'
                : 'h-full min-h-0 flex flex-col !gap-0 overflow-hidden'
            )}
          {showInternalNotes && resolvedMobileSection === 'internal' && (
            <InternalNotesSection
              className='h-full min-h-0 flex flex-col !gap-0 overflow-hidden'
              notes={notes}
              notesLoading={notesLoading}
              canAddNote={canAddNote}
              canEditNote={canEditNote}
              canDeleteNote={canDeleteNote}
              editingNote={editingNote}
              initialValues={internalNoteInitialValues}
              onSubmit={handleInternalNoteSubmit}
              onEditNote={handleEditInternalNote}
              onDeleteNote={handleDeleteInternalNote}
              onCancelEdit={() => setEditingNote(null)}
              disableSubmit={!patientIdForNotes || !profileIdNumber}
            />
          )}
        </div>

        <div className='hidden md:flex h-full min-h-0 flex-col gap-3'>
          <When isTrue={showInternalNotes && shouldShowCaseChat}>
            <div className='shrink-0 rounded-2xl border border-gray-200 bg-gray-50 p-1'>
              <div className='grid gap-1 grid-cols-2'>
                <button
                  type='button'
                  onClick={() => setDesktopSection('chat')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] transition-colors ${
                    resolvedDesktopSection === 'chat'
                      ? 'bg-white text-primaryColor shadow-sm'
                      : 'text-gray-500 hover:text-primaryColor'
                  }`}
                >
                  <MessageSquare className='h-4 w-4' />
                  Case Chat
                </button>

                <button
                  type='button'
                  onClick={() => setDesktopSection('internal')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] ${
                    resolvedDesktopSection === 'internal'
                      ? 'bg-amber-50/70 text-orange shadow-sm'
                      : 'text-gray-500 hover:text-primaryColor transition-colors'
                  }`}
                >
                  <Lock className='h-4 w-4' />
                  Internal
                </button>
              </div>
            </div>
          </When>
          {shouldShowCaseChat &&
            resolvedDesktopSection === 'chat' &&
            chatSection(
              `${isHistoryCollapsed ? 'flex-1' : 'basis-3/5'} min-h-0 !p-0 !gap-0 overflow-hidden`
            )}
          {showInternalNotes && resolvedDesktopSection === 'internal' && (
            <InternalNotesSection
              className={`${
                isHistoryCollapsed ? 'flex-1' : 'basis-3/5'
              } min-h-0 flex flex-col !gap-0 overflow-hidden`}
              notes={notes}
              notesLoading={notesLoading}
              canAddNote={canAddNote}
              canEditNote={canEditNote}
              canDeleteNote={canDeleteNote}
              editingNote={editingNote}
              initialValues={internalNoteInitialValues}
              onSubmit={handleInternalNoteSubmit}
              onEditNote={handleEditInternalNote}
              onDeleteNote={handleDeleteInternalNote}
              onCancelEdit={() => setEditingNote(null)}
              disableSubmit={!patientIdForNotes || !profileIdNumber}
            />
          )}
          {historySection(
            isHistoryCollapsed
              ? 'shrink-0 !gap-0'
              : `${!shouldShowCaseChat && !showInternalNotes ? 'flex-1' : 'basis-2/5'} min-h-0 flex flex-col !gap-0 overflow-hidden`
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
      {isDeleteModalOpen && noteToDelete ? (
        <ModalDeleteNote
          noteId={noteToDelete.id}
          patientId={noteToDelete.patientId}
          setIsModalOpen={setIsDeleteModalOpen}
          onDeleteSuccess={handleDeleteNoteSuccess}
        />
      ) : null}
    </>
  )
}

export default VspLabCustomerChat

const CaseHistoryComingSoon = () => {
  return (
    <div className='flex flex-col items-center justify-center p-4 border border-gray-100 rounded-lg shadow-sm text-center'>
      <div className='w-16 h-16 mb-2 flex items-center justify-center bg-primarySupport rounded-full'>
        <Clock className='w-8 h-8 text-primaryColor animate-pulse' />
      </div>

      <div className='text-gray-900 font-semibold mb-2 text-sm'>Activity Tracking Coming Soon</div>
      <p className='text-gray-500 text-xs leading-relaxed'>
        Soon you’ll be able to track every milestone, status update, and change in your case history
        right here.
      </p>
    </div>
  )
}
