import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_LAB_ALIGNER_CHECK_INS,
  URL_LAB_CHAT_BY_ID,
  URL_LAB_CHAT_MESSAGES,
  URL_LAB_CHAT_PARTICIPANTS,
  URL_LAB_CHATS,
  URL_LAB_SEND_MESSAGE,
} from 'redux/Endpoints/apiEndpoints'
import {getDashboardNewDetails} from 'redux/Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import {getStorageType} from 'utils/storage'

type LabChatError = string | Record<string, unknown> | null

export interface LabChatParticipant {
  id: number
  user_profile_id: number
  user_name: string
  user_email: string
  organization_name: string
  profile_picture_url: string | null
  is_online: boolean
  is_typing: boolean
  last_seen_at: string | null
  joined_at: string
  unread_count: number
  added_via_case_team_id: number | null
  added_via_case_team_name: string | null
}

export interface LabChatCaseTeam {
  id: number
  team_name: string
  description: string
  is_active: boolean
  member_count: number
  created_at: string
  created_by: number | null
  members: unknown[] | null
}

export interface LabChatMessageSender {
  id: number
  user_id: number
  name: string
  email: string
  organization_name: string
  profile_picture_url: string | null
  profile_image_id: number | null
  role_name: string | null
}

export interface LabChatLastMessage {
  id: number
  chat_id: number
  message_type: 'TEXT' | 'VOICE_NOTE' | string
  text_content: string
  is_deleted: boolean
  created_at: string
  edited_at: string | null
  is_edited: boolean | null
  sender: LabChatMessageSender
  reply_to_message: Record<string, unknown> | null
  attachments: unknown[] | null
  read_receipts: unknown[] | null
  aligner_check_in: Record<string, unknown> | null
}

export interface LabChatByIdResponse {
  id: number
  patient_id: number
  patient_name: string
  patient_profile_picture: string | null
  chat_name: string
  description: string
  is_active: boolean
  created_at: string
  last_message_at: string | null
  unread_count: number
  total_participants: number
  customer_mapped_id: string
  participants: LabChatParticipant[]
  case_teams: LabChatCaseTeam[]
  last_message: LabChatLastMessage | null
  latest_aligner_check_in: Record<string, unknown> | null
}

interface LabChatState {
  chats: any
  chatById: LabChatByIdResponse | null
  chatMessages: any
  sentMessage: any
  createdChat: any
  createdAlignerCheckIn: any
  latestAlignerCheckIn: any
  loading: boolean
  chatByIdLoading: boolean
  messagesLoading: boolean
  sendLoading: boolean
  createLoading: boolean
  createAlignerCheckInLoading: boolean
  latestAlignerCheckInLoading: boolean
  error: any
  chatByIdError: LabChatError
  messagesError: any
  sendError: any
  createError: any
  createAlignerCheckInError: any
  latestAlignerCheckInError: any
}

interface GetLabChatsParams {
  page?: number
  size?: number
  profileId?: number
  search?: string | null
  customerIds?: number[]
  doctorId?: number
  organizationId?: number
}

interface GetLabChatMessagesParams {
  chatId: number
  page?: number
  size?: number
  profileId?: number
}

interface GetLabChatByIdParams {
  chatId: number
  profileId?: number
  doctorId?: number
  organizationId?: number
}

interface AddLabChatParticipantsParams {
  chatId: number
  caseTeamIds: Array<number | string>
  profileId?: number
  doctorId?: number
  organizationId?: number
}

interface SendLabChatMessageParams {
  chatId: number
  patientId: number
  textContent: string
  messageType?: 'TEXT' | 'VOICE_NOTE' | 'TEXT_WITH_ATTACHMENTS'
  replyToMessageId?: number | null
  profileId?: number
  files?: File[]
}

interface CreateLabChatParams {
  patientId: number
  chatName: string
  description?: string
  profileId?: number
  doctorId?: number
  organizationId?: number
}

interface CreateLabAlignerCheckInParams {
  chat_id: number
  patient_id: number
  aligner_number: number
  start_aligner_number: number
  end_aligner_number: number
  total_aligners: number
  notes?: string
  profile_id?: number
  doctor_id?: number
  files?: File[]
}

interface GetLatestLabAlignerCheckInParams {
  patient_id: number
  profile_id?: number
}

const URL_LAB_CREATE_CHAT = URL_LAB_CHATS.replace('/my-chats', '')

const initialState: LabChatState = {
  chats: null,
  chatById: null,
  chatMessages: null,
  sentMessage: null,
  createdChat: null,
  createdAlignerCheckIn: null,
  latestAlignerCheckIn: null,
  loading: false,
  chatByIdLoading: false,
  messagesLoading: false,
  sendLoading: false,
  createLoading: false,
  createAlignerCheckInLoading: false,
  latestAlignerCheckInLoading: false,
  error: null,
  chatByIdError: null,
  messagesError: null,
  sendError: null,
  createError: null,
  createAlignerCheckInError: null,
  latestAlignerCheckInError: null,
}

export const getLabChats = createAsyncThunk(
  'labChat/getChats',
  async (
    {
      page = 0,
      size = 10,
      profileId,
      search = '',
      customerIds,
      doctorId,
      organizationId,
    }: GetLabChatsParams,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedOrganizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const resolvedProfileId = profileId ?? storedProfileId
      const resolvedDoctorId = doctorId ?? storedDoctorId
      const resolvedOrganizationId = organizationId ?? storedOrganizationId
      const normalizedCustomerIds = Array.isArray(customerIds)
        ? customerIds.filter((id) => Number.isFinite(id) && id > 0)
        : []

      if (!resolvedProfileId) return rejectWithValue('profile_id is required')

      const response = await apiHelper(
        URL_LAB_CHATS,
        HttpMethod.POST,
        {
          profile_id: resolvedProfileId,
          page,
          size,
          search: search ?? '',
          ...(normalizedCustomerIds.length > 0 ? {customer_ids: normalizedCustomerIds} : {}),
          ...(resolvedDoctorId ? {doctor_id: resolvedDoctorId} : {}),
          ...(resolvedOrganizationId ? {organization_id: resolvedOrganizationId} : {}),
        },
        true
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

export const getLabChatMessages = createAsyncThunk(
  'labChat/getChatMessages',
  async (
    {chatId, page = 0, size = 10, profileId}: GetLabChatMessagesParams,
    {rejectWithValue, dispatch, getState}
  ) => {
    try {
      const storage = getStorageType()
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedOrganizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null
      const resolvedProfileId = profileId ?? storedProfileId

      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!storedDoctorId) return rejectWithValue('doctor_id is required')
      if (!storedOrganizationId) return rejectWithValue('organization_id is required')

      const response = await apiHelper(
        URL_LAB_CHAT_MESSAGES,
        HttpMethod.POST,
        {
          chat_id: chatId,
          profile_id: resolvedProfileId,
          page,
          size,
        },
        true
      )

      const state = getState() as any
      const subscriptionPlanName = state?.subscription?.subscriptionData?.plan_metadata?.plan_name
      const storedUserDetail = storage.getItem('userDetail')
      let roles: string[] = []

      if (storedUserDetail) {
        try {
          const parsedUserDetail = JSON.parse(storedUserDetail)
          const activeProfile = Array.isArray(parsedUserDetail?.profiles)
            ? parsedUserDetail.profiles.find(
                (profile: {profile_id?: number}) =>
                  Number(profile?.profile_id) === resolvedProfileId
              )
            : null

          roles = Array.isArray(activeProfile?.roles)
            ? activeProfile.roles
                .map((role: {name?: string}) => role?.name)
                .filter((roleName: string | undefined): roleName is string => Boolean(roleName))
            : []
        } catch {
          roles = []
        }
      }

      if (storedDoctorId && roles.length > 0 && subscriptionPlanName) {
        dispatch(
          getDashboardNewDetails({
            doctor_id: storedDoctorId,
            roles,
            plan_name: subscriptionPlanName,
          })
        )
      }

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

export const getLabChatById = createAsyncThunk<
  LabChatByIdResponse,
  GetLabChatByIdParams,
  {rejectValue: Exclude<LabChatError, null>}
>(
  'labChat/getChatById',
  async (
    {chatId, profileId, doctorId, organizationId}: GetLabChatByIdParams,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedOrganizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null

      const resolvedProfileId = profileId ?? storedProfileId
      const resolvedDoctorId = doctorId ?? storedDoctorId
      const resolvedOrganizationId = organizationId ?? storedOrganizationId

      if (!chatId) return rejectWithValue('chat_id is required')
      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!resolvedDoctorId) return rejectWithValue('doctor_id is required')
      if (!resolvedOrganizationId) return rejectWithValue('organization_id is required')

      const response = await apiHelper(
        URL_LAB_CHAT_BY_ID,
        HttpMethod.POST,
        {
          profile_id: resolvedProfileId,
          chat_id: chatId,
          doctor_id: resolvedDoctorId,
          organization_id: resolvedOrganizationId,
        },
        false
      )

      return response.data
    } catch (error: any) {
      const errorResponse = error?.response?.data
      const fallbackMessage = error?.message ?? 'An error occurred'
      if (errorResponse && typeof errorResponse === 'object') {
        return rejectWithValue(errorResponse as Record<string, unknown>)
      }
      return rejectWithValue(errorResponse ?? fallbackMessage)
    }
  }
)

export const addLabChatParticipants = createAsyncThunk<
  LabChatByIdResponse,
  AddLabChatParticipantsParams,
  {rejectValue: Exclude<LabChatError, null>}
>(
  'labChat/addChatParticipants',
  async (
    {chatId, caseTeamIds, profileId, doctorId, organizationId}: AddLabChatParticipantsParams,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedOrganizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null

      const resolvedProfileId = profileId ?? storedProfileId
      const resolvedDoctorId = doctorId ?? storedDoctorId
      const resolvedOrganizationId = organizationId ?? storedOrganizationId
      const normalizedCaseTeamIds = Array.isArray(caseTeamIds)
        ? caseTeamIds.map((id) => String(id).trim()).filter((id) => id.length > 0)
        : []

      if (!chatId) return rejectWithValue('chat_id is required')
      if (normalizedCaseTeamIds.length === 0) return rejectWithValue('case_team_ids is required')
      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!resolvedDoctorId) return rejectWithValue('doctor_id is required')
      if (!resolvedOrganizationId) return rejectWithValue('organization_id is required')

      const response = await apiHelper(
        URL_LAB_CHAT_PARTICIPANTS,
        HttpMethod.POST,
        {
          chat_id: chatId,
          case_team_ids: normalizedCaseTeamIds,
          profile_id: resolvedProfileId,
          doctor_id: resolvedDoctorId,
          organization_id: resolvedOrganizationId,
        },
        false
      )

      return response.data
    } catch (error: any) {
      const errorResponse = error?.response?.data
      const fallbackMessage = error?.message ?? 'An error occurred'
      if (errorResponse && typeof errorResponse === 'object') {
        return rejectWithValue(errorResponse as Record<string, unknown>)
      }
      return rejectWithValue(errorResponse ?? fallbackMessage)
    }
  }
)

export const sendLabChatMessage = createAsyncThunk(
  'labChat/sendMessage',
  async (
    {
      chatId,
      patientId,
      textContent,
      messageType = 'TEXT',
      replyToMessageId = null,
      profileId,
      files = [],
    }: SendLabChatMessageParams,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null
      const resolvedProfileId = profileId ?? storedProfileId

      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!storedDoctorId) return rejectWithValue('doctor_id is required')
      if (!patientId) return rejectWithValue('patient_id is required')
      if (!chatId) return rejectWithValue('chat_id is required')

      const sendMessageRequest = encodeURIComponent(
        JSON.stringify({
          chat_id: chatId,
          profile_id: resolvedProfileId,
          doctor_id: storedDoctorId,
          patient_id: patientId,
          message_type: messageType,
          text_content: textContent,
          reply_to_message_id: replyToMessageId,
        })
      )

      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await apiHelper(
        `${URL_LAB_SEND_MESSAGE}?sendMessageRequest=${sendMessageRequest}`,
        HttpMethod.POST,
        formData,
        false
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

export const createLabChat = createAsyncThunk(
  'labChat/createChat',
  async (
    {
      patientId,
      chatName,
      description = '',
      profileId,
      doctorId,
      organizationId,
    }: CreateLabChatParams,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedOrganizationId = storage.getItem('organizationId')
        ? Number(storage.getItem('organizationId'))
        : null
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null

      const resolvedProfileId = profileId ?? storedProfileId
      const resolvedDoctorId = doctorId ?? storedDoctorId
      const resolvedOrganizationId = organizationId ?? storedOrganizationId

      if (!patientId) return rejectWithValue('patient_id is required')
      if (!chatName?.trim()) return rejectWithValue('chat_name is required')
      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!resolvedDoctorId) return rejectWithValue('doctor_id is required')
      if (!resolvedOrganizationId) return rejectWithValue('organization_id is required')

      const response = await apiHelper(
        URL_LAB_CREATE_CHAT,
        HttpMethod.POST,
        {
          patient_id: patientId,
          chat_name: chatName,
          description,
          profile_id: resolvedProfileId,
          doctor_id: resolvedDoctorId,
          organization_id: resolvedOrganizationId,
        },
        false
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

export const createLabAlignerCheckIn = createAsyncThunk(
  'labChat/createAlignerCheckIn',
  async (
    {
      chat_id,
      patient_id,
      aligner_number,
      start_aligner_number,
      end_aligner_number,
      total_aligners,
      notes = '',
      profile_id,
      doctor_id,
      files = [],
    }: CreateLabAlignerCheckInParams,
    {rejectWithValue}
  ) => {
    try {
      const storage = getStorageType()
      const storedDoctorId = storage.getItem('userId') ? Number(storage.getItem('userId')) : null
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null
      const resolvedProfileId = profile_id ?? storedProfileId
      const resolvedDoctorId = doctor_id ?? storedDoctorId

      if (!chat_id) return rejectWithValue('chat_id is required')
      if (!patient_id) return rejectWithValue('patient_id is required')
      if (!resolvedProfileId) return rejectWithValue('profile_id is required')
      if (!resolvedDoctorId) return rejectWithValue('doctor_id is required')
      if (!aligner_number) return rejectWithValue('aligner_number is required')
      if (!start_aligner_number) return rejectWithValue('start_aligner_number is required')
      if (!end_aligner_number) return rejectWithValue('end_aligner_number is required')
      if (!total_aligners) return rejectWithValue('total_aligners is required')

      const createAlignerCheckInRequest = encodeURIComponent(
        JSON.stringify({
          chat_id,
          patient_id,
          profile_id: resolvedProfileId,
          doctor_id: resolvedDoctorId,
          aligner_number,
          start_aligner_number,
          end_aligner_number,
          total_aligners,
          notes,
        })
      )

      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await apiHelper(
        `${URL_LAB_ALIGNER_CHECK_INS}?createAlignerCheckInRequest=${createAlignerCheckInRequest}`,
        HttpMethod.POST,
        formData,
        false
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

export const getLatestAlignerCheckIn = createAsyncThunk(
  'labChat/getLatestAlignerCheckIn',
  async ({patient_id, profile_id}: GetLatestLabAlignerCheckInParams, {rejectWithValue}) => {
    try {
      const storage = getStorageType()
      const storedProfileId = storage.getItem('profileId')
        ? Number(storage.getItem('profileId'))
        : null
      const resolvedProfileId = profile_id ?? storedProfileId

      if (!patient_id) return rejectWithValue('patient_id is required')
      if (!resolvedProfileId) return rejectWithValue('profile_id is required')

      const response = await apiHelper(
        `${URL_LAB_ALIGNER_CHECK_INS}/patient/${patient_id}/latest?profile_id=${resolvedProfileId}`,
        HttpMethod.GET
      )

      return response.data
    } catch (error: any) {
      return rejectWithValue(error?.response?.data ?? error?.message ?? 'An error occurred')
    }
  }
)

const labChatSlice = createSlice({
  name: 'labChat',
  initialState,
  reducers: {
    clearLabChats: (state) => {
      state.chats = null
      state.chatById = null
      state.chatMessages = null
      state.sentMessage = null
      state.createdChat = null
      state.createdAlignerCheckIn = null
      state.latestAlignerCheckIn = null
      state.loading = false
      state.chatByIdLoading = false
      state.messagesLoading = false
      state.sendLoading = false
      state.createLoading = false
      state.createAlignerCheckInLoading = false
      state.latestAlignerCheckInLoading = false
      state.error = null
      state.chatByIdError = null
      state.messagesError = null
      state.sendError = null
      state.createError = null
      state.createAlignerCheckInError = null
      state.latestAlignerCheckInError = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLabChats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getLabChats.fulfilled, (state, action) => {
        state.loading = false
        state.chats = action.payload
      })
      .addCase(getLabChats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(getLabChatById.pending, (state) => {
        state.chatByIdLoading = true
        state.chatByIdError = null
      })
      .addCase(getLabChatById.fulfilled, (state, action) => {
        state.chatByIdLoading = false
        state.chatById = action.payload
      })
      .addCase(getLabChatById.rejected, (state, action) => {
        state.chatByIdLoading = false
        state.chatByIdError = action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(addLabChatParticipants.pending, (state) => {
        state.chatByIdLoading = true
        state.chatByIdError = null
      })
      .addCase(addLabChatParticipants.fulfilled, (state, action) => {
        state.chatByIdLoading = false
        state.chatById = action.payload
      })
      .addCase(addLabChatParticipants.rejected, (state, action) => {
        state.chatByIdLoading = false
        state.chatByIdError = action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(getLabChatMessages.pending, (state) => {
        state.messagesLoading = true
        state.messagesError = null
      })
      .addCase(getLabChatMessages.fulfilled, (state, action) => {
        state.messagesLoading = false
        state.chatMessages = action.payload
      })
      .addCase(getLabChatMessages.rejected, (state, action) => {
        state.messagesLoading = false
        state.messagesError = action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(sendLabChatMessage.pending, (state) => {
        state.sendLoading = true
        state.sendError = null
      })
      .addCase(sendLabChatMessage.fulfilled, (state, action) => {
        state.sendLoading = false
        state.sentMessage = action.payload
      })
      .addCase(sendLabChatMessage.rejected, (state, action) => {
        state.sendLoading = false
        state.sendError = action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(createLabChat.pending, (state) => {
        state.createLoading = true
        state.createError = null
      })
      .addCase(createLabChat.fulfilled, (state, action) => {
        state.createLoading = false
        state.createdChat = action.payload
      })
      .addCase(createLabChat.rejected, (state, action) => {
        state.createLoading = false
        state.createError = action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(createLabAlignerCheckIn.pending, (state) => {
        state.createAlignerCheckInLoading = true
        state.createAlignerCheckInError = null
      })
      .addCase(createLabAlignerCheckIn.fulfilled, (state, action) => {
        state.createAlignerCheckInLoading = false
        state.createdAlignerCheckIn = action.payload
      })
      .addCase(createLabAlignerCheckIn.rejected, (state, action) => {
        state.createAlignerCheckInLoading = false
        state.createAlignerCheckInError =
          action.payload ?? action.error?.message ?? 'An error occurred'
      })
      .addCase(getLatestAlignerCheckIn.pending, (state) => {
        state.latestAlignerCheckInLoading = true
        state.latestAlignerCheckInError = null
      })
      .addCase(getLatestAlignerCheckIn.fulfilled, (state, action) => {
        state.latestAlignerCheckInLoading = false
        state.latestAlignerCheckIn = action.payload
      })
      .addCase(getLatestAlignerCheckIn.rejected, (state, action) => {
        state.latestAlignerCheckInLoading = false
        state.latestAlignerCheckInError =
          action.payload ?? action.error?.message ?? 'An error occurred'
      })
  },
})

export const {clearLabChats} = labChatSlice.actions
export default labChatSlice.reducer
