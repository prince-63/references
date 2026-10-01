import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react'
import {useSelector} from 'react-redux'
import Page from 'components/page/Page'
import When from 'components/when/When'
import {ModalConnectWithPatient} from 'components/modal/Leads/Overview/ModalConnectWithPatient'
import PaperPlaneTiltIcon from 'assets/icons/PaperPlaneTiltIcon'
import {RootState} from 'redux/store'
import {AuthContext} from 'context/AuthContext'
import ChatNewBody from '../components/ChatNewBody'
import usePatientChatService from 'screens/Patients/Chat/hooks/usePatientChatService'
import {safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'
import InvitePatientInfoCard from 'screens/Patients/LeadsProfile/main/overview/components/InvitePatientInfoCard'

type ConnectionStatus = 'Connected' | 'Pending' | 'Not connected' | 'Unknown'

const getConnectionStatus = (connection: any): ConnectionStatus => {
  if (!connection?.is_patient_connected && !connection?.is_patient_invited) {
    return 'Not connected'
  }
  if (!connection?.is_patient_connected && connection?.is_patient_invited) {
    return 'Pending'
  }
  if (connection?.is_patient_connected) {
    return 'Connected'
  }
  return 'Unknown'
}

export const Chat: React.FC = () => {
  const {data} = useSelector((state: RootState) => state.apiGetLeadsProfileDetails)
  const {isModalConnectWithPatientOpen} = useSelector(
    (state: RootState) => state.apiAddAndSendInvite
  )
  const {userId} = useContext(AuthContext)

  const status = getConnectionStatus(data?.invitation_details)
  const isConnected = status === 'Connected'
  const patientId = data?.patient_details?.id

  const [message, setMessage] = useState('')
  const {messageList, messageListLoading, patient, refreshChat} = usePatientChatService({
    doctorId: userId,
  })

  const chatList = useMemo(() => (!!patientId ? [{patient_id: patientId}] : []), [patientId])

  const handleRefreshCurrentChat = useCallback(() => {
    if (!hasValue(patientId)) return
    const parsedPatientId = safeParseInt(patientId)
    if (!parsedPatientId) return
    void refreshChat(parsedPatientId)
  }, [patientId, refreshChat])

  useEffect(() => {
    if (!isConnected || !hasValue(userId) || !hasValue(patientId)) return
    handleRefreshCurrentChat()
  }, [handleRefreshCurrentChat, isConnected, patientId, userId])

  // Wrapper that matches ChatBody's onClick: (userId: string | number) => void
  const handleChatClick = useCallback(
    (uid: string | number) => {
      const parsedId = typeof uid === 'string' ? safeParseInt(uid) : uid
      if (!parsedId) return
      void refreshChat(parsedId)
    },
    [refreshChat]
  )

  return (
    <div className='flex flex-col min-w-0 rounded-lg' style={{height: '65dvh'}}>
      <Page containerClassName='flex flex-col flex-1 min-h-0 h-full '>
        <When isTrue={isModalConnectWithPatientOpen}>
          <ModalConnectWithPatient />
        </When>

        {/* Full-height column with scrollable center */}
        <div className='flex flex-col flex-1 min-h-0'>
          <div className='flex-1 min-h-0 overflow-hidden'>
            {isConnected && hasValue(patientId) ? (
              <ChatNewBody
                onClick={handleChatClick}
                setMessage={setMessage}
                message={message}
                messageList={messageList}
                patient={patient}
                chatList={chatList}
                getChatList={handleRefreshCurrentChat}
                chatListLoading={false}
                messageListLoading={messageListLoading}
                patientId={patientId}
              />
            ) : (
              <div className='flex h-full items-start justify-center py-2'>
                <div className='w-full'>
                  <InvitePatientInfoCard
                    icon={<PaperPlaneTiltIcon color='#be8901' />}
                    iconWrapperClassName='flex h-12 w-14 items-center justify-center rounded-xl bg-orangeSupport'
                    title='Invite patient'
                    description={
                      !data?.invitation_details?.is_patient_invited
                        ? "The patient hasn't signed up yet. Send an invitation to start communicating."
                        : "An invite has been sent, but the patient hasn't signed up yet. Resend the invite and ensure they use the same email ID."
                    }
                    optionalLabel=''
                    cardClassName='flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-mediumGray bg-white shadow-sm p-4'
                    primaryButtonLabel={
                      data?.invitation_details?.is_patient_invited ? 'Resend Invite' : 'Send Invite'
                    }
                    primaryButtonIcon={null}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </Page>
    </div>
  )
}

export default Chat
