import {useCallback, useRef, useState} from 'react'
import {useDispatch} from 'react-redux'

import {postApiDataChatEventSlice} from 'redux/Slices/AppSlice/Chat/ChatEventSlice'
import {postApiDataChatSeen} from 'redux/Slices/AppSlice/Chat/ChatSeenSlice'
import {postApiDataMessageList} from 'redux/Slices/AppSlice/Chat/MessageListSlice'
import {ApiGetData, safeParseInt} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

type PatientDetails = {
  patientName: string
  patientProfile: string
  aligner_journey_id: number
}

interface UsePatientChatServiceOptions {
  doctorId?: number | string | null
}

export const usePatientChatService = ({doctorId}: UsePatientChatServiceOptions) => {
  const dispatch = useDispatch()
  const [messageList, setMessageList] = useState<any[]>([])
  const [messageListLoading, setMessageListLoading] = useState(false)
  const [patient, setPatient] = useState<PatientDetails | Record<string, never>>({})
  const chatEventsRef = useRef<any[]>([])

  const parsedDoctorId = safeParseInt(doctorId)

  const markChatAsSeen = useCallback(
    (unreadIds: any[]) => {
      if (!unreadIds?.length || !chatEventsRef.current?.length) return
      const postData: ApiGetData = {
        data: {
          chat_id_list: unreadIds,
          role_name: 'Patient',
          event_id_list: chatEventsRef.current,
        },
      }
      dispatch(postApiDataChatSeen(postData) as any).catch((error: any) => {
        console.error('Error : ', error)
      })
    },
    [dispatch]
  )

  const fetchChatEvents = useCallback(
    async (patientId: number) => {
      if (!parsedDoctorId || !hasValue(patientId)) return []
      const postData: ApiGetData = {
        data: {
          doctor_id: parsedDoctorId,
          patient_id: patientId,
        },
      }
      try {
        const response = await dispatch(postApiDataChatEventSlice(postData) as any).unwrap()
        chatEventsRef.current = response ?? []
        return chatEventsRef.current
      } catch (error: any) {
        console.error('Error : ', error)
        chatEventsRef.current = []
        return []
      }
    },
    [dispatch, parsedDoctorId]
  )

  const fetchMessageList = useCallback(
    async (patientId: number) => {
      if (!parsedDoctorId || !hasValue(patientId)) return
      setMessageListLoading(true)
      const postData: ApiGetData = {
        data: {
          doctor_id: parsedDoctorId,
          patient_id: patientId,
        },
      }
      try {
        const res = await dispatch(postApiDataMessageList(postData) as any).unwrap()
        const response = res?.data?.results?.[0]
        if (!response) {
          setMessageList([])
          setPatient({})
          return
        }

        setPatient({
          patientName: response.full_name,
          patientProfile: response.patient_profile,
          aligner_journey_id: response.aligner_journey_id,
        })

        if (Array.isArray(response.chat_response_list)) {
          setMessageList(response.chat_response_list)
          if (response.unread_message_ids?.length) {
            markChatAsSeen(response.unread_message_ids)
          }
        } else {
          setMessageList([])
        }
      } catch (error: any) {
        console.error('Error : ', error)
        setMessageList([])
      } finally {
        setMessageListLoading(false)
      }
    },
    [dispatch, markChatAsSeen, parsedDoctorId]
  )

  const refreshChat = useCallback(
    async (patientId: number) => {
      if (!hasValue(patientId)) return
      await fetchChatEvents(patientId)
      await fetchMessageList(patientId)
    },
    [fetchChatEvents, fetchMessageList]
  )

  return {
    messageList,
    messageListLoading,
    patient,
    refreshChat,
    fetchMessageList,
    fetchChatEvents,
  }
}

export default usePatientChatService
