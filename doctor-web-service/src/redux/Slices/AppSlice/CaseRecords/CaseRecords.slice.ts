import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_CREATE_CASE_RECORD,
  URL_GET_CASE_RECORD,
  URL_GET_ALL_CASE_RECORD,
  URL_GET_SINGLE_CASE_RECORD,
  URL_DELETE_CASE_RECORD,
} from 'redux/Endpoints/apiEndpoints'
import {CaseRecordState, APIPostData, APIGetDATA} from './CaseRecord.type'

const initialState: CaseRecordState = {
  loadingCreate: false,
  loadingGet: false,
  loadingGetAll: false,
  loadingGetSingle: false, // new
  errorCreate: null,
  errorGet: null,
  errorGetAll: null,
  errorGetSingle: null, // new
  successCreate: false,
  successGet: false,
  successGetAll: false,
  successGetSingle: false, // new
  caseRecordData: null,
  allCaseRecords: null,
  areAllFilesUploaded: false,

  loadingDelete: false,
  errorDelete: null,
  successDelete: false,
}

// Create Case Record Thunk
export const createCaseRecord = createAsyncThunk(
  'api/create-case-record',
  async (postDataCaseRecordSlice: APIPostData, {rejectWithValue}) => {
    try {
      const formData = new FormData()
      formData.append('details', JSON.stringify(postDataCaseRecordSlice))
      const response = await apiHelper(URL_CREATE_CASE_RECORD, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

// Get Case Record Thunk
export const getCaseRecord = createAsyncThunk(
  'api/get-case-record',
  async (getDataCaseRecordSlice: APIGetDATA, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_CASE_RECORD, HttpMethod.POST, getDataCaseRecordSlice)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

// Delete Case Record Thunk
export const deleteCaseRecord = createAsyncThunk(
  'api/delete-case-record',
  async (caseRecordId: string | number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_DELETE_CASE_RECORD}/${caseRecordId}`,
        HttpMethod.DELETE,
        {}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

// Get All Case Records Thunk
export const getAllCaseRecord = createAsyncThunk(
  'api/get-all-case-record',
  async (getDataCaseRecordSlice: APIGetDATA, {rejectWithValue}) => {
    try {
      let url = `${URL_GET_ALL_CASE_RECORD}/${getDataCaseRecordSlice.patient_id}`
      if (
        typeof getDataCaseRecordSlice !== 'number' &&
        'orderId' in getDataCaseRecordSlice &&
        getDataCaseRecordSlice.orderId !== undefined &&
        getDataCaseRecordSlice.orderId !== null
      ) {
        url += `?orderId=${getDataCaseRecordSlice.orderId}`
      }
      const response = await apiHelper(url, HttpMethod.GET)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

// Get Single Case Record Thunk
export const getSingleCaseRecord = createAsyncThunk(
  'api/get-single-case-record',
  async (caseRecordId: number, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_GET_SINGLE_CASE_RECORD}/${caseRecordId}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.status?.message || 'Something went wrong')
    }
  }
)

const caseRecordSlice = createSlice({
  name: 'caseRecord',
  initialState,
  reducers: {
    resetCaseRecordState: (state) => {
      state.loadingCreate = false
      state.loadingGet = false
      state.loadingGetAll = false
      state.errorCreate = null
      state.errorGet = null
      state.errorGetAll = null
      state.successCreate = false
      state.successGet = false
      state.successGetAll = false
      state.caseRecordData = null
      state.allCaseRecords = null
    },
    markFilesUploadComplete(state) {
      state.areAllFilesUploaded = true
    },
    resetFilesUploadStatus(state) {
      state.areAllFilesUploaded = false
    },
  },
  extraReducers: (builder) => {
    // Create Case Record
    builder
      .addCase(createCaseRecord.pending, (state) => {
        state.loadingCreate = true
        state.errorCreate = null
        state.successCreate = false
      })
      .addCase(createCaseRecord.fulfilled, (state) => {
        state.loadingCreate = false
        state.successCreate = true
      })
      .addCase(createCaseRecord.rejected, (state, action) => {
        state.loadingCreate = false
        state.errorCreate = action.payload as string
        state.successCreate = false
      })

    // Get Case Record
    builder
      .addCase(getCaseRecord.pending, (state) => {
        state.loadingGet = true
        state.errorGet = null
        state.successGet = false
      })
      .addCase(getCaseRecord.fulfilled, (state, action) => {
        state.loadingGet = false
        state.successGet = true
        state.caseRecordData = action.payload
      })
      .addCase(getCaseRecord.rejected, (state, action) => {
        state.loadingGet = false
        state.errorGet = action.payload as string
        state.successGet = false
      })

    // Get All Case Records
    builder
      .addCase(getAllCaseRecord.pending, (state) => {
        state.loadingGetAll = true
        state.errorGetAll = null
        state.successGetAll = false
      })
      .addCase(getAllCaseRecord.fulfilled, (state, action) => {
        state.loadingGetAll = false
        state.successGetAll = true
        const records = Array.isArray(action.payload) ? action.payload : []
        state.allCaseRecords = records
        if (records.length === 0) {
          state.caseRecordData = null
        } else {
          const latestRecord = records.reduce((latest, record) => {
            if (!latest) return record
            const latestTime = new Date(latest.created_at ?? '').getTime()
            const recordTime = new Date(record.created_at ?? '').getTime()
            if (isNaN(recordTime) && isNaN(latestTime)) {
              return record
            }
            if (isNaN(recordTime)) {
              return latest
            }
            if (isNaN(latestTime)) {
              return record
            }
            return recordTime >= latestTime ? record : latest
          }, records[0])
          state.caseRecordData = latestRecord ?? records[records.length - 1]
        }
      })
      .addCase(getAllCaseRecord.rejected, (state, action) => {
        state.loadingGetAll = false
        state.errorGetAll = action.payload as string
        state.successGetAll = false
      })

    builder
      // Get Single Case Record
      .addCase(getSingleCaseRecord.pending, (state) => {
        state.loadingGetSingle = true
        state.errorGetSingle = null
        state.successGetSingle = false
      })
      .addCase(getSingleCaseRecord.fulfilled, (state, action) => {
        state.loadingGetSingle = false
        state.successGetSingle = true
        state.caseRecordData = action.payload
      })
      .addCase(getSingleCaseRecord.rejected, (state, action) => {
        state.loadingGetSingle = false
        state.errorGetSingle = action.payload as string
        state.successGetSingle = false
      })
      .addCase(deleteCaseRecord.pending, (state) => {
        state.loadingDelete = true
        state.errorDelete = null
        state.successDelete = false
      })
      .addCase(deleteCaseRecord.fulfilled, (state) => {
        state.loadingDelete = false
        state.successDelete = true
      })
      .addCase(deleteCaseRecord.rejected, (state, action) => {
        state.loadingDelete = false
        state.errorDelete = action.payload as string
        state.successDelete = false
      })
  },
})

const {resetCaseRecordState, markFilesUploadComplete, resetFilesUploadStatus} =
  caseRecordSlice.actions

export {resetCaseRecordState, markFilesUploadComplete, resetFilesUploadStatus}

export default caseRecordSlice.reducer
