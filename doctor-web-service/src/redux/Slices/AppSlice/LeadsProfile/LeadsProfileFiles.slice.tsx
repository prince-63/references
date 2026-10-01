import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import SuccessToast from 'components/modal/Alert/SuccessToast'
import {
  URL_CREATE_FOLDER,
  URL_GET_FILES,
  URL_UPLOAD_FILES,
  URL_DELETE_FILES,
  URL_DOWNLOAD_FILES,
  URL_RENAME_FILE_OR_FOLDER,
  URL_MOVE_FILES,
} from 'redux/Endpoints/apiEndpoints'
import {Files} from 'screens/Patients/LeadsProfile/main/files/types/files.types'
import {getStorageType} from 'utils/storage'

interface Owner {
  user_id: number
  user_type: string
}
export const getFiles = createAsyncThunk(
  'api/getFiles',
  async (
    apiGetFilesParams: {
      path: string
      doctor_id: string
      patient_id: string
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
export const getFilesForMoveModal = createAsyncThunk(
  'api/getFilesForMoveModal',
  async (
    apiGetFilesParams: {
      path: string
      doctor_id: string
      patient_id: string
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
export const createFolder = createAsyncThunk(
  'api/createFolder',
  async (
    payloadForCreateFolder: {
      parent_path: string
      folder_name: string
      uploader: {
        user_id: number
        user_type: string
      }
      owners: Owner[]
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_CREATE_FOLDER, HttpMethod.POST, payloadForCreateFolder)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const renameFileOrFolder = createAsyncThunk(
  'api/renameFileOrFolder',
  async (
    payloadForRename: {
      file_id: number
      new_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_RENAME_FILE_OR_FOLDER, HttpMethod.POST, payloadForRename)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const moveFiles = createAsyncThunk(
  'api/moveFiles',
  async (
    payloadForMove: {
      requester_user_id: number
      requester_user_type: string
      file_ids: number[]
      new_parent_path: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_MOVE_FILES, HttpMethod.POST, payloadForMove)
      SuccessToast(`Your file/files has been moved to ${payloadForMove.new_parent_path}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const uploadFiles = createAsyncThunk(
  'api/uploadFiles',
  async (
    payloadForUploadFiles: {
      uploader: {
        user_id: number
        user_type: string
      }
      owners: Owner[]
      parent_path: string
      files?: File[]
    },
    {rejectWithValue}
  ) => {
    try {
      const profileId = getStorageType().getItem('profileId') ?? ''
      const formData = new FormData()
      payloadForUploadFiles?.files?.forEach((file) => {
        formData.append('files', file)
      })
      const payloadWithoutFiles = {...payloadForUploadFiles}
      delete payloadWithoutFiles.files

      formData.append('request', JSON.stringify(payloadWithoutFiles))
      formData.append('profileId', profileId)

      const response = await apiHelper(`${URL_UPLOAD_FILES}`, HttpMethod.POST, formData, true, {
        skipServerErrorRedirect: true,
      })

      return response.data
    } catch (error: any) {
      const errorData = error.response?.data
      return rejectWithValue({
        ...(typeof errorData === 'object' && errorData !== null
          ? errorData
          : {message: errorData}),
        response: {status: error.response?.status},
      })
    }
  }
)

export const deleteFiles = createAsyncThunk(
  'api/deleteFiles',
  async (
    payloadForDeleteFiles: {
      deleter: {
        user_id: number
        user_type: string
      }
      owner: {
        user_id: number
        user_type: string
      }
      delete_context?: string
      context_id?: number
      files_to_delete_by_id: number[]
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(URL_DELETE_FILES, HttpMethod.POST, payloadForDeleteFiles)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const downloadFile = createAsyncThunk(
  'api/downloadFile',
  async (
    payloadForDownloadFile: {
      requester_user_id: number
      requester_user_type: string
      file_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DOWNLOAD_FILES,
        HttpMethod.POST,
        payloadForDownloadFile,
        true,
        {responseType: 'arraybuffer'}
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const LeadsProfileFiles = createSlice({
  name: 'leadsProfileFiles',
  initialState: {
    loadingFiles: false,
    isStlPreviewVisible: false,
    stlPreviewUrl: '',
    filesFetchError: null as string | null,
    files: [] as Files[],
    moveModalFiles: [] as Files[],
    loadingMoveFiles: false,
    openCreateFolderModal: false,
    openUploadFilesModal: false,
    creatingFiles: false,
    createFilesError: null as any,
    uploadingFiles: false,
    uploadFilesError: null as string | null,
    openDeleteModal: false,
    deletingFiles: false,
    deleteFilesError: null as string | null,
    isRename: false,
    openMoveFilesModal: false,
    downloadingFile: false,
    downloadFileError: null as string | null,
    orderFileId: null,
    patientFileId: null,
  },
  reducers: {
    setOpenCreateFolderModal: (state, action) => {
      state.openCreateFolderModal = action.payload
    },
    setOpenUploadFilesModal: (state, action) => {
      state.openUploadFilesModal = action.payload
    },
    setOpenDeleteModal: (state, action) => {
      state.openDeleteModal = action.payload
    },
    setIsRename: (state, action) => {
      state.isRename = action.payload
    },
    setOpenMoveFilesModal: (state, action) => {
      state.openMoveFilesModal = action.payload
    },
    setIsStlFilePreviewVisible: (state, action) => {
      state.isStlPreviewVisible = action.payload
    },
    setStlPreviewUrl: (state, action) => {
      state.stlPreviewUrl = action.payload
    },
    setOrderId: (state, action) => {
      state.orderFileId = action.payload.orderFileId
    },
    resetOrderId: (state) => {
      state.orderFileId = null
    },
    setPatientId: (state, action) => {
      state.patientFileId = action.payload.patientFileId
    },
    resetPatientId: (state) => {
      state.patientFileId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFiles.pending, (state) => {
        state.loadingFiles = true
        state.filesFetchError = null
      })
      .addCase(getFiles.fulfilled, (state, action) => {
        state.loadingFiles = false
        state.files = action.payload
      })
      .addCase(getFiles.rejected, (state, action) => {
        state.loadingFiles = false
        state.filesFetchError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(getFilesForMoveModal.pending, (state) => {
        state.loadingMoveFiles = true
        state.filesFetchError = null
      })
      .addCase(getFilesForMoveModal.fulfilled, (state, action) => {
        state.loadingMoveFiles = false
        state.moveModalFiles = action.payload
      })
      .addCase(getFilesForMoveModal.rejected, (state, action) => {
        state.loadingMoveFiles = false
        state.filesFetchError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(createFolder.pending, (state) => {
        state.creatingFiles = true
        state.createFilesError = null
      })
      .addCase(createFolder.fulfilled, (state) => {
        state.creatingFiles = false
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.creatingFiles = false
        state.createFilesError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })

      .addCase(renameFileOrFolder.fulfilled, () => {})
      .addCase(renameFileOrFolder.rejected, () => {})
      .addCase(moveFiles.fulfilled, () => {})

      .addCase(uploadFiles.pending, (state) => {
        state.uploadingFiles = true
        state.uploadFilesError = null
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.uploadingFiles = false
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploadingFiles = false
        state.uploadFilesError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(deleteFiles.pending, (state) => {
        state.deletingFiles = true
        state.deleteFilesError = null
      })
      .addCase(deleteFiles.fulfilled, (state) => {
        state.deletingFiles = false
      })
      .addCase(deleteFiles.rejected, (state, action) => {
        state.deletingFiles = false
        state.deleteFilesError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
      .addCase(downloadFile.pending, (state) => {
        state.downloadingFile = true
        state.downloadFileError = null
      })
      .addCase(downloadFile.fulfilled, (state) => {
        state.downloadingFile = false
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.downloadingFile = false
        state.downloadFileError =
          typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {
  setOpenCreateFolderModal,
  setOpenUploadFilesModal,
  setOpenDeleteModal,
  setIsRename,
  setOpenMoveFilesModal,
  setIsStlFilePreviewVisible,
  setStlPreviewUrl,
  setOrderId,
  setPatientId,
  resetOrderId,
  resetPatientId,
} = LeadsProfileFiles.actions
export default LeadsProfileFiles.reducer
