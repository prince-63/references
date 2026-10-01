import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_ACTIVITY_COMMENT} from 'redux/Endpoints/apiEndpoints'

export interface ActivityItem {
  type: 'COMMENT' | 'ACTIVITY'
  title: string
  description: string
  created_by: string
  profile_image_url: string | null
  timestamp: string // ISO date string
  files: any[]
  is_custom_activity: boolean | null
}

export interface SortInfo {
  direction: 'ASC' | 'DESC'
  property: string
  ignore_case: boolean
  null_handling: 'NATIVE' | string
  ascending: boolean
  descending: boolean
}

export interface Pageable {
  sort: SortInfo[]
  offset: number
  page_number: number
  page_size: number
  paged: boolean
  unpaged: boolean
}

export interface ActivityCommentLogsResponse {
  content: ActivityItem[]
  pageable: Pageable
  total_elements: number
  total_pages: number
  last: boolean
  size: number
  number: number
  sort: SortInfo[]
  number_of_elements: number
  first: boolean
  empty: boolean
}

export interface ActivityCommentLogsRequest {
  patient_id: number | string
  profile_id?: number | string
  page_number?: number
  page_size?: number
}

export interface ActivityCommentLogsState {
  loading: boolean
  loadingMore: boolean
  page: number
  hasMore: boolean
  data: ActivityCommentLogsResponse
  error: string | null
}

const initialState: ActivityCommentLogsState = {
  loading: false,
  loadingMore: false,
  page: 0,
  hasMore: true,
  data: {
    content: [],
    pageable: {
      sort: [],
      offset: 0,
      page_number: 0,
      page_size: 10,
      paged: true,
      unpaged: false,
    },
    total_elements: 0,
    total_pages: 0,
    last: false,
    size: 10,
    number: 0,
    sort: [],
    number_of_elements: 0,
    first: true,
    empty: true,
  },
  error: null,
}

export const getActivityCommentLogs = createAsyncThunk<
  ActivityCommentLogsResponse,
  ActivityCommentLogsRequest,
  {rejectValue: string}
>('activityCommentLogs/get', async (payload, {rejectWithValue}) => {
  try {
    const response = await apiHelper(URL_ACTIVITY_COMMENT, HttpMethod.POST, payload)
    return (response?.data ?? {}) as ActivityCommentLogsResponse
  } catch (error: any) {
    const errorCode = error?.response?.data?.error_code ?? 'UNKNOWN_ERROR'
    return rejectWithValue(errorCode)
  }
})

const activityCommentLogsSlice = createSlice({
  name: 'activityCommentLogs',
  initialState,
  reducers: {
    resetActivityCommentLogs: () => ({
      ...initialState,
      data: {...initialState.data},
    }),
  },
  extraReducers: (builder) => {
    // 🟢 PENDING
    builder.addCase(getActivityCommentLogs.pending, (state, action) => {
      const pageNumber = action.meta?.arg?.page_number ?? 0
      if (pageNumber > 0) state.loadingMore = true
      else state.loading = true
      state.error = null
    })

    // 🟢 FULFILLED
    builder.addCase(getActivityCommentLogs.fulfilled, (state, action) => {
      const pageNumber = action.meta?.arg?.page_number ?? 0
      const isLoadMore = pageNumber > 0
      const payload = action.payload ?? {}

      const nextContent = Array.isArray(payload.content) ? payload.content : []

      const mergedContent = isLoadMore
        ? [...(state.data.content ?? []), ...nextContent]
        : nextContent

      state.data = {
        ...payload,
        content: mergedContent,
      }

      state.page = pageNumber
      state.hasMore = !payload.last
      state.loading = false
      state.loadingMore = false
      state.error = null
    })

    // 🟢 REJECTED
    builder.addCase(getActivityCommentLogs.rejected, (state, action) => {
      state.loading = false
      state.loadingMore = false
      state.error = action.payload ?? action.error?.message ?? 'UNKNOWN_ERROR'
    })
  },
})

// -------------------- Exports --------------------
export const {resetActivityCommentLogs} = activityCommentLogsSlice.actions
export default activityCommentLogsSlice.reducer
