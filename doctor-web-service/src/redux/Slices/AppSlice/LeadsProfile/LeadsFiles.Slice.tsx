import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {URL_GET_FILES} from 'redux/Endpoints/apiEndpoints'
import {AllFiles} from 'screens/Patients/LeadsProfile/main/files/types/files.types'

export const allFile = createAsyncThunk(
  'api/allFiles',
  async (
    apiGetFilesParams: {
      doctor_id: string
      patient_id: string
      path: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_FILES}?path=${apiGetFilesParams.path}&requester_user_id=${apiGetFilesParams.doctor_id}&requester_user_type=DOCTOR&owner_user_id=${apiGetFilesParams.patient_id}&owner_user_type=PATIENT`,
        HttpMethod.GET
      )
      return response.data.files
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const LeadsFiles = createSlice({
  name: 'leadsFiles',
  initialState: {
    filesFetchError: null as string | null,
    Files: [] as AllFiles[],
    loadingAllFiles: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(allFile.pending, (state) => {
        state.loadingAllFiles = true
        state.filesFetchError = null
      })
      .addCase(allFile.fulfilled, (state, action) => {
        state.loadingAllFiles = false
        state.Files = action.payload
      })
      .addCase(allFile.rejected, (state, action) => {
        state.loadingAllFiles = false
        state.filesFetchError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {} = LeadsFiles.actions
export default LeadsFiles.reducer
