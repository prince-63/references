import {useContext, useEffect, useState} from 'react'
import {ApiGetData, checkValueOrEmptyString, safeParseInt} from '../../../utils/ConstFunctions'
import {useDispatch, useSelector} from 'react-redux'
import {AuthContext} from '../../../context/AuthContext'
import {useNavigate, useParams} from 'react-router-dom'

import {ChatHeader} from './components/ChatHeader'
import {ChatSidebar} from './components/ChatSidebar'
import {postApiDataChatEventSlice} from '../../../redux/Slices/AppSlice/Chat/ChatEventSlice'
import {postApiDataChatSeen} from '../../../redux/Slices/AppSlice/Chat/ChatSeenSlice'
import {postApiDataMessageList} from '../../../redux/Slices/AppSlice/Chat/MessageListSlice'
import {ChatBody} from './components/ChatBody'
import {fieldErrorMessages} from '../../../utils/MessageConstant'
import ErrorToast from '../../../components/modal/Alert/ErrorToast'
import {postApiDataChatList} from '../../../redux/Slices/AppSlice/Chat/ChatListSlice'
import {RootState} from '../../../redux/store'
import hasValue from 'utils/hasValue'
import When from 'components/when/When'
import BackGroundSVG from 'components/atom/SVG/BackGroundSVG'
import {SVG_CHAT_EMPTY_STATE, SVG_PLUS_WHITE} from 'utils/SvgConstants'
import ModelNewChat from 'components/modal/PatientProfile/Tabs/Chat/ModelNewChat'
import CommonSVG from 'components/atom/SVG/CommonSVG'
import PlusIcon from 'assets/icons/PlusIcon'

const Chat = () => {
  const {id: patientUserId}: any = useParams()
  const dispatch = useDispatch()
  const [message, setMessage] = useState('')
  const navigation = useNavigate()
  const [data, setData] = useState([])
  const [patient, setPatient] = useState({})
  const [messageList, setMessageList] = useState([])
  const {countsData} = useSelector((state: RootState) => state.DoctorDashboard)
  const [chatListLoading, setChatListLoading] = useState<boolean>(false)
  const [messageListLoading, setMessageListLoading] = useState<boolean>(false)
  const {demoModeStatus} = useContext(AuthContext)
  const [newPatientChatModel, setNewPatientChatModel] = useState(false)

  const [listEvent, setListEvent] = useState([])
  const {userId} = useContext(AuthContext)
  const [showAddMessageDrawer, toggleAddMessageDrawer] = useState(false)
  const [showSelectPatientDrawer, toggleSelectPatientDrawer] = useState(false)
  useEffect(() => {
    if (!showAddMessageDrawer && !showSelectPatientDrawer) {
      getChatList()
    }
  }, [showAddMessageDrawer, showSelectPatientDrawer])

  const getChatList = () => {
    if (checkValueOrEmptyString(userId) === null) {
      ErrorToast(fieldErrorMessages.TEXT_DOCTOR_ID)
    } else {
      const postData: ApiGetData = {
        data: {
          doctor_id: safeParseInt(userId),
        },
      }
      setChatListLoading(true)
      dispatch(postApiDataChatList(postData) as any)
        .unwrap()
        .then((res: any) => {
          const response = res.data.results[0]
          const chatList: any = []
          if (response !== undefined) {
            response.forEach((element: any) => {
              if (element.user_id !== null) {
                chatList.push(element)
              }
            })

            setData(chatList)
          }
          setChatListLoading(false)
        })
        .catch((error: any) => {
          setChatListLoading(false)
          console.error('Error : ', error)
        })
    }
  }

  // Chat List  Get
  useEffect(() => {
    if (hasValue(patientUserId)) {
      getChatEventData(patientUserId)
      getMessageList(patientUserId)
    }
  }, [patientUserId])

  // Message List  Get
  const getMessageList = (patient_id: any) => {
    setMessageListLoading(true)
    if (patientUserId != patient_id) {
      navigation(`/chat-list/${patient_id}`)
    }
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
        patient_id: patient_id,
      },
    }
    dispatch(postApiDataMessageList(postData) as any)
      .unwrap()
      .then((res: any) => {
        const response = res?.data?.results[0]
        setPatient({
          patientName: response.full_name,
          patientProfile: response.patient_profile,
          aligner_journey_id: response.aligner_journey_id,
        })
        if (response.chat_response_list != null) {
          setMessageList(response.chat_response_list)
          if (response.unread_message_ids.length > 0) {
            callChatSeen(listEvent, response.unread_message_ids)
          }
        } else {
          setMessageList([])
        }
        setMessageListLoading(false)
      })
      .catch((error: any) => {
        setMessageListLoading(false)
        console.error('Error : ', error)
      })
  }

  // Doctor Updates data
  const getChatEventData = (patient_id: number) => {
    const postData: ApiGetData = {
      data: {
        doctor_id: safeParseInt(userId),
        patient_id: patient_id,
      },
    }
    dispatch(postApiDataChatEventSlice(postData) as any)
      .unwrap()
      .then((res: any) => {
        setListEvent(res)
      })
      .catch((error: any) => {
        console.error('Error : ', error)
      })
  }

  // Chat Seen API
  const callChatSeen = (listEvent: any, unreadMessageList: any) => {
    const postData: ApiGetData = {
      data: {
        chat_id_list: unreadMessageList,
        role_name: 'Patient',
        event_id_list: listEvent,
      },
    }
    dispatch(postApiDataChatSeen(postData) as any)
      .unwrap()
      .then(() => {
        getChatList()
      })
      .catch((error: any) => {
        console.error('Error : ', error)
      })
  }

  const onPatientChatClick = (patient_id: any) => {
    getChatEventData(patient_id)

    getMessageList(patient_id)
  }

  return (
    <div className=' flex flex-col md:h-full h-[calc(100vh)]'>
      {newPatientChatModel && (
        <ModelNewChat
          setNewPatientChatModel={setNewPatientChatModel}
          onPatientChatClick={() => getChatList()}
          data={data}
        />
      )}
      <div>
        <ChatHeader
          onPatientChatClick={() => getChatList()}
          data={data}
          {...{
            toggleAddMessageDrawer,
            toggleSelectPatientDrawer,
            showSelectPatientDrawer,
            showAddMessageDrawer,
          }}
        />
      </div>
      {/* Web View */}
      <div className='w-full md:flex h-full hidden'>
        <ChatSidebar
          onPatientChatClick={(userId) => getMessageList(userId)}
          data={data}
          chatListLoading={chatListLoading}
          totalUnreadMessagesCount={countsData.unread_chat_count}
        />
        <ChatBody
          onClick={(userId) => onPatientChatClick(userId)}
          setMessage={setMessage}
          message={message}
          messageList={messageList}
          patient={patient}
          chatList={data}
          getChatList={getChatList}
          chatListLoading={chatListLoading}
          messageListLoading={messageListLoading}
        />
      </div>
      {/* Mobile View */}
      <div className='md:hidden h-full flex flex-col justify-between'>
        {hasValue(patientUserId) ? (
          <ChatBody
            onClick={(userId) => onPatientChatClick(userId)}
            setMessage={setMessage}
            message={message}
            messageList={messageList}
            patient={patient}
            chatList={data}
            getChatList={getChatList}
            chatListLoading={chatListLoading}
            messageListLoading={messageListLoading}
          />
        ) : (
          <ChatSidebar
            onPatientChatClick={(userId) => getMessageList(userId)}
            data={data}
            chatListLoading={chatListLoading}
            totalUnreadMessagesCount={countsData.unread_chat_count}
          />
        )}

        <When isTrue={!chatListLoading && !hasValue(data)}>
          <div className='flex flex-col justify-center items-center gap-6 w-full mt-20'>
            <BackGroundSVG svg={SVG_CHAT_EMPTY_STATE} width='' height='' className='w-[160px]' />
            <p className='text-textColor break-words text-center'>
              No chats yet! Click on '+ New Chat' to initiate a conversation with your patients
            </p>
          </div>
        </When>

        <When isTrue={!hasValue(patientUserId)}>
          <div className='fixed bottom-0 left-0 mb-[62px] bg-white  py-2 border-t border-mediumGray  w-full px-2'>
            <div className='flex gap-3 w-full'>
              <button
                className='py-2.5 border border-primaryColor rounded-lg justify-center items-center gap-2 flex w-full'
                disabled={demoModeStatus ? true : false}
                onClick={() => toggleSelectPatientDrawer(true)}
              >
                <PlusIcon />
                <div className='text-primaryColor text-sm font-semibold'>New Broadcast</div>
              </button>
              <button
                className='px-2 py-2.5 bg-primaryColor rounded-lg flex justify-center items-center gap-2 w-full '
                disabled={demoModeStatus ? true : false}
                onClick={() => setNewPatientChatModel(true)}
              >
                <CommonSVG svg={SVG_PLUS_WHITE} width='16' height='16' />
                <div className='text-white text-sm font-semibold'>New Chat</div>
              </button>
            </div>
          </div>
        </When>
      </div>
    </div>
  )
}

export default Chat
