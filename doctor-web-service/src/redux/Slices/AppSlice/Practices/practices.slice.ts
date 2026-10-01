import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_OR_EDIT_PRACTICES,
  URL_GET_ACTIVE_PRACTICES,
  URL_LIST_PRACTICES,
} from 'redux/Endpoints/apiEndpoints'
import {Invitation} from 'screens/Labs/LabList/types/labs.types'
import {
  RequestInvitation,
  RequestInvitationList,
  ResponsePracticeList,
} from 'screens/Practices/PracticeList/types/practices.types'
import {getSalutations} from 'utils/ConstFunctions'
import hasValue from 'utils/hasValue'

export const addOrEditPractices = createAsyncThunk(
  'api/getAddOrEditPractices',
  async (params: RequestInvitation, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_ADD_OR_EDIT_PRACTICES, HttpMethod.POST, params)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  }
)
export const getActivePractices = createAsyncThunk(
  'api/getActivePractices',
  async (
    {
      data,
    }: {
      data: {
        doctor_id: number
        invitation_status: 'ACCEPTED' | 'PENDING' | 'ALL'
        search: string
        page_number: number
        page_size: number
        sort_order: 'PRACTICE_NAME_ASC' | 'PRACTICE_NAME_DESC'
        organization_id?: number
        invitation_roles: string[]
      }
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_GET_ACTIVE_PRACTICES, HttpMethod.POST, data)
      const activePractices = response.data?.doctor_invitation_details_list
      return activePractices
        .filter((practice: any) => !practice.admin)
        .sort((a: any, b: any) => (b.admin ? 1 : 0) - (a.admin ? 1 : 0))
        .map((practice: any, index: number) => {
          const invitationCode =
            practice?.invitation_code ?? practice?.invitationCode ?? practice?.invite_code ?? null
          const rawValue = hasValue(practice.profile_id)
            ? practice.profile_id
            : (invitationCode ?? practice.doctor_id ?? practice.organization_id ?? index)

          return {
            value: String(rawValue),
            label: `${getSalutations(
              practice?.salutation ?? ''
            )} ${practice?.first_name} ${practice?.last_name}`,
            doctor_id: practice.doctor_id ?? null,
            profile_id: practice.profile_id ?? null,
            organization_id: practice.organization_id ?? null,
            status: practice.status,
            invitation_code: invitationCode,
          }
        })
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.practices?.loadingActivePractices) {
        return false
      }
      const lastFetched = state.practices?.lastFetchedActivePractices
      if (lastFetched && Date.now() - lastFetched < 5000) {
        return false
      }
    },
  }
)

export const getPracticesList = createAsyncThunk(
  'api/getPracticesList',
  async (params: RequestInvitationList, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_LIST_PRACTICES, HttpMethod.POST, params)
      const adminPractice = response.data.doctor_invitation_details_list.filter(
        (practice: Invitation) => practice.admin
      )
      const otherPractice = response.data.doctor_invitation_details_list.filter(
        (practice: Invitation) => !practice.admin
      )
      const sortedPracticeList = [...adminPractice, ...otherPractice]
      const PracticeList: ResponsePracticeList = {
        doctor_invitation_details_list: sortedPracticeList,
        pagination: response.data.pagination,
      }
      return PracticeList
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error_code)
    }
  },
  {
    condition: (arg, {getState}) => {
      const state = getState() as any
      if (state.practices?.loadingPracticeList) {
        return false
      }
    },
  }
)
export interface IActivePracticeList {
  label: string
  value: string
  doctor_id: number | null
  profile_id: number | string | null
  organization_id: number | null
  status?: string
  invitation_code: string | null
}
const practicesSlice = createSlice({
  name: 'practices',
  initialState: {
    loadingAddingEditPractice: false,
    dataAddingEditPractice: {} as Invitation,
    dataEditPractice: {} as Invitation,
    openModalAddingEditSuccessPractice: false,
    openModalInvitePractice: false,
    activePractices: [] as IActivePracticeList[],
    loadingActivePractices: false,
    lastFetchedActivePractices: null as number | null,
    loadingPracticeList: false,
    dataPracticeList: {
      doctor_invitation_details_list: [],
      pagination: {
        page_number: 1,
        page_size: 10,
        total_patients: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false,
        active_invitation_count: 0,
        pending_invitation_count: 0,
      },
    } as ResponsePracticeList,
  },
  reducers: {
    setPracticeListEmpty: (state, action) => {
      state.dataPracticeList = action.payload
    },
    setDataEditPractice: (state, action) => {
      state.dataEditPractice = action.payload
    },
    setDataAddingEditPractice: (state, action) => {
      state.dataAddingEditPractice = action.payload
    },
    setOpenModalAddingEditSuccessPractice: (state, action) => {
      state.openModalAddingEditSuccessPractice = action.payload
    },
    setOpenModalInvitePractice: (state, action) => {
      state.openModalInvitePractice = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addOrEditPractices.pending, (state) => {
      state.loadingAddingEditPractice = true
    })
    builder.addCase(addOrEditPractices.fulfilled, (state, action) => {
      state.loadingAddingEditPractice = false
      state.dataAddingEditPractice = action.payload
    })
    builder.addCase(addOrEditPractices.rejected, (state) => {
      state.loadingAddingEditPractice = false
    })
    builder.addCase(getActivePractices.pending, (state) => {
      state.loadingActivePractices = true
    })
    builder.addCase(getActivePractices.fulfilled, (state, action) => {
      state.activePractices = action.payload
      state.loadingActivePractices = false
      state.lastFetchedActivePractices = Date.now()
    })
    builder.addCase(getActivePractices.rejected, (state) => {
      state.loadingActivePractices = false
    })

    builder.addCase(getPracticesList.pending, (state) => {
      state.loadingPracticeList = true
    })
    builder.addCase(getPracticesList.fulfilled, (state, action) => {
      state.loadingPracticeList = false
      state.dataPracticeList = action.payload
    })
    builder.addCase(getPracticesList.rejected, (state) => {
      state.loadingPracticeList = false
    })
  },
})
export const {
  setDataEditPractice,
  setDataAddingEditPractice,
  setOpenModalAddingEditSuccessPractice,
  setOpenModalInvitePractice,
  setPracticeListEmpty,
} = practicesSlice.actions

export default practicesSlice.reducer
