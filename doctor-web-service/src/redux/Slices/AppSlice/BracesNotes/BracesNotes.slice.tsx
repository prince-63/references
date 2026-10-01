import bracesReminderStatus from '@constants/bracesReminderStatus'
import bracesTreatmentStageConstants from '@constants/bracesTreatmentStage.constants.ts'
import HttpMethod from '@constants/httpMethods.constants'
import jawType from '@constants/jawType'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_ACCESSORIES,
  URL_ADD_APPOINTMENT,
  URL_ADD_MATERIAL_NAME,
  URL_ADD_MATERIAL_SIZE,
  URL_ADD_PHOTOS_FOR_APPOINTMENT,
  URL_ADD_SPACE_AND_CLOSURE,
  URL_BRACES_NOTES_LIST,
  URL_BRACES_TREATMENT_MATERIAL_NAME_LIST,
  URL_BRACES_TREATMENT_MATERIAL_SHAPE_LIST,
  URL_BRACES_TREATMENT_MATERIAL_SIZE_LIST,
  URL_BRACES_TREATMENT_STAGE_LIST,
  URL_DELETE_BRACES_APPOINTMENT,
  URL_DELETE_BRACES_REMINDER,
  URL_GET_APPOINTMENT_BY_APPOINTMENT_ID,
  URL_REMINDER_LIST,
  URL_SPACE_CLOSURE_TOOL_LIST,
  URL_UPDATE_APPOINTMENT,
} from 'redux/Endpoints/apiEndpoints'
import {
  AppointmentReminderListData,
  AppointmentListData,
  AddAppointmentData,
  AppointmentPostData,
} from 'screens/Patients/LeadsProfile/main/appointments/types/appointments.types'
import {capitalizeFirstLetter} from 'screens/Patients/LeadsProfile/main/appointments/utils/DateConversion'

type FilterOption = {
  value: string
  label: string
}
type BracesTreatmentStageKey = keyof typeof bracesTreatmentStageConstants

const getLabelName = (value: BracesTreatmentStageKey) => {
  const labelMap: Record<BracesTreatmentStageKey, string> = {
    [bracesTreatmentStageConstants.LEVELLING_AND_ALIGNMENT]: 'Levelling & Alignment',
    [bracesTreatmentStageConstants.SPACE_CLOSURE_RETRACTION]: 'Space Closure/Retraction',
    [bracesTreatmentStageConstants.FINISHING_AND_DETAILING]: 'Finishing & Detailing',
  }

  return labelMap[value] || ''
}

export const getAppointmentReminderList = createAsyncThunk(
  'api/getAppointmentReminderList',
  async (
    getAppointmentReminderListParams: {
      doctor_id: number
      patient_id: number
    },
    {}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_REMINDER_LIST}?doctor_id=${getAppointmentReminderListParams.doctor_id}&patient_id=${getAppointmentReminderListParams.patient_id}`,
        HttpMethod.GET
      )
      const filteredData = response.data.filter(
        (item: {status: string}) => item.status === bracesReminderStatus.UPCOMING
      )
      return filteredData
    } catch (error: any) {
      return []
    }
  }
)

export const getBracesNotesList = createAsyncThunk(
  'api/getBracesNotesList',
  async (
    getAppointmentListParams: {
      doctor_id: number
      patient_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_BRACES_NOTES_LIST}?doctor_id=${getAppointmentListParams.doctor_id}&patient_id=${getAppointmentListParams.patient_id}`,
        HttpMethod.GET
      )
      return response.data.appointments
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postDeleteAppointmentReminder = createAsyncThunk(
  'api/postDeleteAppointmentReminder',
  async (
    postDeleteAppointmentReminderParams: {
      reminder_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DELETE_BRACES_REMINDER + `${postDeleteAppointmentReminderParams.reminder_id}`,
        HttpMethod.POST
      )
      return response.data.appointments
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postDeleteAppointment = createAsyncThunk(
  'api/postDeleteAppointment',
  async (
    postDeleteAppointmentParams: {
      appointment_id: number
      doctor_id: number
      profile_id: number
      organization_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DELETE_BRACES_APPOINTMENT + `${postDeleteAppointmentParams.appointment_id}`,
        HttpMethod.DELETE,
        {
          doctor_id: postDeleteAppointmentParams.doctor_id,
          profile_id: postDeleteAppointmentParams.profile_id,
          organization_id: postDeleteAppointmentParams.organization_id,
        }
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracesTreatmentStageList = createAsyncThunk(
  'api/getBracesTreatmentStageList',
  async (getBracesTreatmentStageListParams: {data: null}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_BRACES_TREATMENT_STAGE_LIST, HttpMethod.GET)
      const list = response.data

      list.sort((a: any, b: any) => a.material_stage_id - b.material_stage_id)

      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.material_stage_id),
          label: getLabelName(element.material_stage_type),
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracesTreatmentMaterialShapeList = createAsyncThunk(
  'api/getBracesTreatmentMaterialShapeList',
  async (
    getBracesTreatmentMaterialShapeListParams: {
      treatmentMaterialStageId: number
      jawType: keyof typeof jawType
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_BRACES_TREATMENT_MATERIAL_SHAPE_LIST +
          getBracesTreatmentMaterialShapeListParams.treatmentMaterialStageId,
        HttpMethod.GET
      )

      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.id),
          label: capitalizeFirstLetter(element.material_shape),
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracesTreatmentMaterialNameList = createAsyncThunk(
  'api/getBracesTreatmentMaterialNameList',
  async (
    getBracesTreatmentMaterialNameListParams: {
      doctor_id: number
      treatmentMaterialShapeId: number
      jawType: keyof typeof jawType
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_BRACES_TREATMENT_MATERIAL_NAME_LIST +
          getBracesTreatmentMaterialNameListParams.doctor_id +
          '/' +
          getBracesTreatmentMaterialNameListParams.treatmentMaterialShapeId,
        HttpMethod.GET
      )
      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.id),
          label: element.name,
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracesTreatmentMaterialSizeList = createAsyncThunk(
  'api/getBracesTreatmentMaterialSizeList',
  async (
    getBracesTreatmentMaterialSizeListParams: {
      doctor_id: number
      treatmentMaterialNameId: number
      jawType: keyof typeof jawType
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_BRACES_TREATMENT_MATERIAL_SIZE_LIST +
          getBracesTreatmentMaterialSizeListParams.doctor_id +
          '/' +
          getBracesTreatmentMaterialSizeListParams.treatmentMaterialNameId,
        HttpMethod.GET
      )
      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: element.id,
          label: element.name,
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getSpaceClosureToolAndAccessoriesList = createAsyncThunk(
  'api/getSpaceClosureToolAndAccessoriesList',
  async (getSpaceClosureToolAndAccessoriesListParams: {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_SPACE_CLOSURE_TOOL_LIST + getSpaceClosureToolAndAccessoriesListParams.doctor_id,
        HttpMethod.GET
      )
      const list = response.data
      const spaceClosureToolList: Array<string> = []
      const accessoriesList: Array<string> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        if (element.material_tool_type === 'SPACE_CLOSURE_TOOL') {
          spaceClosureToolList.push(element.material_tool_name)
        } else if (element.material_tool_type === 'ACCESSORIES') {
          accessoriesList.push(element.material_tool_name)
        }
      }
      return {spaceClosureToolList, accessoriesList}
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postAddMaterialName = createAsyncThunk(
  'api/postAddMaterialName',
  async (
    postAddMaterialNameParams: {
      id: number
      doctor_id: number
      material_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ADD_MATERIAL_NAME,
        HttpMethod.POST,
        postAddMaterialNameParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postAddMaterialSize = createAsyncThunk(
  'api/postAddMaterialSize',
  async (
    postAddMaterialSizeParams: {
      id: number
      doctor_id: number
      material_name: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ADD_MATERIAL_SIZE,
        HttpMethod.POST,
        postAddMaterialSizeParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postAddSpaceAndClosure = createAsyncThunk(
  'api/postAddSpaceAndClosure',
  async (
    postAddSpaceAndClosureParams: {
      doctor_id: number
      material_name: string
      material_tool_type: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ADD_SPACE_AND_CLOSURE,
        HttpMethod.POST,
        postAddSpaceAndClosureParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postAddAccessories = createAsyncThunk(
  'api/postAddAccessories',
  async (
    postAddAccessoriesParams: {
      doctor_id: number
      material_name: string
      material_tool_type: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_ADD_ACCESSORIES,
        HttpMethod.POST,
        postAddAccessoriesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postAttachBracesNotes = createAsyncThunk(
  'api/postAttachBracesNotes',
  async (postAddAppointmentParams: AppointmentPostData, {rejectWithValue}) => {
    try {
      const formData = new FormData()
      postAddAppointmentParams?.files?.forEach((file) => {
        formData.append('files', file)
      })
      delete postAddAppointmentParams.files
      formData.append('details', JSON.stringify(postAddAppointmentParams))
      const response = await apiHelper(`${URL_ADD_APPOINTMENT}`, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postUpdateAttachedBracesNotes = createAsyncThunk(
  'api/postUpdateAttachedBracesNotes',
  async (postUpdateAppointmentParams: AppointmentPostData, {rejectWithValue}) => {
    try {
      delete postUpdateAppointmentParams.files
      const response = await apiHelper(
        `${URL_UPDATE_APPOINTMENT}`,
        HttpMethod.POST,
        postUpdateAppointmentParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const postUpdateFilesAppointment = createAsyncThunk(
  'api/postUpdateFilesAppointment',
  async (
    postUpdateFilesAppointmentParams: {
      appointment_id: number
      doctor_id: number
      files: File[]
    },
    {rejectWithValue}
  ) => {
    try {
      const formData = new FormData()
      postUpdateFilesAppointmentParams?.files?.forEach((file) => {
        formData.append('files', file)
      })
      const response = await apiHelper(
        `${
          URL_ADD_PHOTOS_FOR_APPOINTMENT +
          postUpdateFilesAppointmentParams.appointment_id +
          '?doctor_id=' +
          postUpdateFilesAppointmentParams?.doctor_id
        }`,
        HttpMethod.POST,
        formData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

export const getBracesNotesDetails = createAsyncThunk(
  'api/getBracesNotesDetails',
  async (getAppointmentDetailsParams: {appointment_id: string}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_APPOINTMENT_BY_APPOINTMENT_ID + getAppointmentDetailsParams.appointment_id,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postAddPhotos = createAsyncThunk(
  'api/postAddPhotos',
  async (
    postAddPhotosParams: {
      doctor_id: number
      appointment_id: number
      files: File[]
    },
    {rejectWithValue}
  ) => {
    try {
      const formData = new FormData()
      postAddPhotosParams.files.forEach((file) => {
        formData.append('files', file)
      })
      const response = await apiHelper(
        `${
          URL_ADD_PHOTOS_FOR_APPOINTMENT +
          postAddPhotosParams.appointment_id +
          '?doctor_id=' +
          postAddPhotosParams.doctor_id
        }`,
        HttpMethod.POST,
        formData
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error_code)
    }
  }
)

const BracesNotes = createSlice({
  name: 'bracesNotes',
  initialState: {
    getBracesTreatmentPlanListLoading: false,

    appointmentReminderList: [] as AppointmentReminderListData[],
    getAppointmentReminderListLoading: false,

    bracesNotesList: [] as AppointmentListData[],
    getBracesNotesListLoading: false,

    deleteAppointmentReminderData: null as string | null,
    postDeleteAppointmentReminderLoading: false,

    deleteAppointmentData: null as string | null,
    postDeleteAppointmentLoading: false,

    bracesTreatmentStageList: [] as FilterOption[],
    getBracesTreatmentStageListLoading: false,

    bracesTreatmentMaterialShapeList: {
      lower: [] as FilterOption[],
      upper: [] as FilterOption[],
    },
    getBracesTreatmentMaterialShapeListLoading: false,

    bracesTreatmentMaterialNameList: {
      lower: [] as FilterOption[],
      upper: [] as FilterOption[],
    },
    getBracesTreatmentMaterialNameListLoading: false,

    bracesTreatmentMaterialSizeList: {
      lower: [] as FilterOption[],
      upper: [] as FilterOption[],
    },
    getBracesTreatmentMaterialSizeListLoading: false,

    spaceClosureToolList: [] as Array<string>,
    accessoriesList: [] as Array<string>,
    getSpaceClosureToolAndAccessoriesListLoading: false,

    postAddMaterialNameData: null as string | null,
    postAddMaterialNameLoading: false,

    postAddMaterialSizeData: null as string | null,
    postAddMaterialSizeLoading: false,

    postAddSpaceAndClosureData: null as string | null,
    postAddSpaceAndClosureLoading: false,

    postAddAccessoriesData: null as string | null,
    postAddAccessoriesLoading: false,

    postAddAppointmentData: null as string | null,
    postAddAppointmentLoading: false,

    postUpdateAppointmentData: null as string | null,
    postUpdateAppointmentLoading: false,
    postUpdateFilesAppointmentLoading: false,

    getBracesNotesDetailsLoading: false,

    bracesNotesDetails: {} as AddAppointmentData,
    bracesAppointmentDetails: {} as AddAppointmentData,
    postAddPhotosData: null as string | null,
    postAddPhotosLoading: false,
  },
  reducers: {
    setAppointmentReminderList: (state, action) => {
      state.appointmentReminderList = action.payload
    },
    setAppointmentList: (state, action) => {
      state.bracesNotesList = action.payload
    },
    setBracesTreatmentStageList: (state, action) => {
      state.bracesTreatmentStageList = action.payload
    },

    setSpaceClosureToolListList: (state, action) => {
      state.spaceClosureToolList = action.payload.spaceClosureToolList
    },
    setAccessoriesList: (state, action) => {
      state.accessoriesList = action.payload.accessoriesList
    },
    setAppointmentDetails: (state, action) => {
      state.bracesNotesDetails = action.payload
    },
  },
  extraReducers: (builder) => {
    // Appointment Reminder List
    builder.addCase(getAppointmentReminderList.pending, (state) => {
      state.getAppointmentReminderListLoading = true
    })
    builder.addCase(getAppointmentReminderList.fulfilled, (state, action) => {
      state.getAppointmentReminderListLoading = false
      state.appointmentReminderList = action.payload
    })
    builder.addCase(getAppointmentReminderList.rejected, (state) => {
      state.getAppointmentReminderListLoading = false
    })

    // Appointment List
    builder.addCase(getBracesNotesList.pending, (state) => {
      state.getBracesNotesListLoading = true
    })
    builder.addCase(getBracesNotesList.fulfilled, (state, action) => {
      state.getBracesNotesListLoading = false
      state.bracesNotesList = action.payload
    })
    builder.addCase(getBracesNotesList.rejected, (state) => {
      state.getBracesNotesListLoading = false
    })

    // Delete Appointment Reminder
    builder.addCase(postDeleteAppointmentReminder.pending, (state) => {
      state.postDeleteAppointmentReminderLoading = true
    })
    builder.addCase(postDeleteAppointmentReminder.fulfilled, (state, action) => {
      state.postDeleteAppointmentReminderLoading = false
      state.deleteAppointmentReminderData = action.payload
    })
    builder.addCase(postDeleteAppointmentReminder.rejected, (state) => {
      state.postDeleteAppointmentReminderLoading = false
    })

    // Delete Appointment
    builder.addCase(postDeleteAppointment.pending, (state) => {
      state.postDeleteAppointmentLoading = true
    })
    builder.addCase(postDeleteAppointment.fulfilled, (state, action) => {
      state.postDeleteAppointmentLoading = false
      state.deleteAppointmentReminderData = action.payload
    })
    builder.addCase(postDeleteAppointment.rejected, (state) => {
      state.postDeleteAppointmentLoading = false
    })

    // BracesTreatmentStageList
    builder.addCase(getBracesTreatmentStageList.pending, (state) => {
      state.getBracesTreatmentStageListLoading = true
    })
    builder.addCase(getBracesTreatmentStageList.fulfilled, (state, action) => {
      state.getBracesTreatmentStageListLoading = false
      state.bracesTreatmentStageList = action.payload
    })
    builder.addCase(getBracesTreatmentStageList.rejected, (state) => {
      state.getBracesTreatmentStageListLoading = false
    })

    // BracesTreatmentMaterialShapeList
    builder.addCase(getBracesTreatmentMaterialShapeList.pending, (state) => {
      state.getBracesTreatmentMaterialShapeListLoading = true
    })
    builder.addCase(getBracesTreatmentMaterialShapeList.fulfilled, (state, action) => {
      const selectedJawType = action?.meta?.arg?.jawType
      state.getBracesTreatmentMaterialShapeListLoading = false
      if (selectedJawType === jawType.UPPER || selectedJawType === jawType.BOTH) {
        state.bracesTreatmentMaterialShapeList.upper = action.payload
      } else {
        state.bracesTreatmentMaterialShapeList.lower = action.payload
      }
    })
    builder.addCase(getBracesTreatmentMaterialShapeList.rejected, (state) => {
      state.getBracesTreatmentMaterialShapeListLoading = false
    })

    // BracesTreatmentMaterialNameList
    builder.addCase(getBracesTreatmentMaterialNameList.pending, (state) => {
      state.getBracesTreatmentMaterialNameListLoading = true
    })
    builder.addCase(getBracesTreatmentMaterialNameList.fulfilled, (state, action) => {
      state.getBracesTreatmentMaterialNameListLoading = false

      const selectedJawType = action?.meta?.arg?.jawType
      if (selectedJawType === jawType.UPPER || selectedJawType === jawType.BOTH) {
        state.bracesTreatmentMaterialNameList.upper = action.payload
      } else if (selectedJawType === jawType.LOWER) {
        state.bracesTreatmentMaterialNameList.lower = action.payload
      }
    })
    builder.addCase(getBracesTreatmentMaterialNameList.rejected, (state) => {
      state.getBracesTreatmentMaterialNameListLoading = false
    })

    // BracesTreatmentMaterialSizeList
    builder.addCase(getBracesTreatmentMaterialSizeList.pending, (state) => {
      state.getBracesTreatmentMaterialSizeListLoading = true
    })
    builder.addCase(getBracesTreatmentMaterialSizeList.fulfilled, (state, action) => {
      state.getBracesTreatmentMaterialSizeListLoading = false

      const selectedJawType = action?.meta?.arg?.jawType
      if (selectedJawType === jawType.UPPER || selectedJawType === jawType.BOTH) {
        state.bracesTreatmentMaterialSizeList.upper = action.payload
      } else if (selectedJawType === jawType.LOWER) {
        state.bracesTreatmentMaterialSizeList.lower = action.payload
      }
    })
    builder.addCase(getBracesTreatmentMaterialSizeList.rejected, (state) => {
      state.getBracesTreatmentMaterialSizeListLoading = false
    })

    // Space Closure Tool List & Accessories List
    builder.addCase(getSpaceClosureToolAndAccessoriesList.pending, (state) => {
      state.getSpaceClosureToolAndAccessoriesListLoading = true
    })
    builder.addCase(getSpaceClosureToolAndAccessoriesList.fulfilled, (state, action) => {
      state.getSpaceClosureToolAndAccessoriesListLoading = false
      state.spaceClosureToolList = action.payload.spaceClosureToolList
      state.accessoriesList = action.payload.accessoriesList
    })
    builder.addCase(getSpaceClosureToolAndAccessoriesList.rejected, (state) => {
      state.getSpaceClosureToolAndAccessoriesListLoading = false
    })

    // Add Material
    builder.addCase(postAddMaterialName.pending, (state) => {
      state.postAddMaterialNameLoading = true
    })
    builder.addCase(postAddMaterialName.fulfilled, (state, action) => {
      state.postAddMaterialNameLoading = false
      state.postAddMaterialNameData = action.payload
    })
    builder.addCase(postAddMaterialName.rejected, (state) => {
      state.postAddMaterialNameLoading = false
    })

    // Add Material Size
    builder.addCase(postAddMaterialSize.pending, (state) => {
      state.postAddMaterialSizeLoading = true
    })
    builder.addCase(postAddMaterialSize.fulfilled, (state, action) => {
      state.postAddMaterialSizeLoading = false
      state.postAddMaterialSizeData = action.payload
    })
    builder.addCase(postAddMaterialSize.rejected, (state) => {
      state.postAddMaterialSizeLoading = false
    })

    // Add Space And Closure
    builder.addCase(postAddSpaceAndClosure.pending, (state) => {
      state.postAddSpaceAndClosureLoading = true
    })
    builder.addCase(postAddSpaceAndClosure.fulfilled, (state, action) => {
      state.postAddSpaceAndClosureLoading = false
      state.postAddSpaceAndClosureData = action.payload
    })
    builder.addCase(postAddSpaceAndClosure.rejected, (state) => {
      state.postAddSpaceAndClosureLoading = false
    })

    // Add Accessories
    builder.addCase(postAddAccessories.pending, (state) => {
      state.postAddAccessoriesLoading = true
    })
    builder.addCase(postAddAccessories.fulfilled, (state, action) => {
      state.postAddAccessoriesLoading = false
      state.postAddAccessoriesData = action.payload
    })
    builder.addCase(postAddAccessories.rejected, (state) => {
      state.postAddAccessoriesLoading = false
    })

    // Add Appointment
    builder.addCase(postAttachBracesNotes.pending, (state) => {
      state.postAddAppointmentLoading = true
    })
    builder.addCase(postAttachBracesNotes.fulfilled, (state, action) => {
      state.postAddAppointmentLoading = false
      state.postAddAppointmentData = action.payload
    })
    builder.addCase(postAttachBracesNotes.rejected, (state) => {
      state.postAddAppointmentLoading = false
    })

    // Update Appointment
    builder.addCase(postUpdateAttachedBracesNotes.pending, (state) => {
      state.postUpdateAppointmentLoading = true
    })
    builder.addCase(postUpdateAttachedBracesNotes.fulfilled, (state, action) => {
      state.postUpdateAppointmentLoading = false
      state.postAddAppointmentData = action.payload
    })
    builder.addCase(postUpdateAttachedBracesNotes.rejected, (state) => {
      state.postUpdateAppointmentLoading = false
    })

    // Update Files Appointment
    builder.addCase(postUpdateFilesAppointment.pending, (state) => {
      state.postUpdateFilesAppointmentLoading = true
    })
    builder.addCase(postUpdateFilesAppointment.fulfilled, (state) => {
      state.postUpdateFilesAppointmentLoading = false
    })
    builder.addCase(postUpdateFilesAppointment.rejected, (state) => {
      state.postUpdateFilesAppointmentLoading = false
    })

    // View Appointment
    builder.addCase(getBracesNotesDetails.pending, (state) => {
      state.getBracesNotesDetailsLoading = true
    })
    builder.addCase(getBracesNotesDetails.fulfilled, (state, action) => {
      state.getBracesNotesDetailsLoading = false
      state.bracesAppointmentDetails = action.payload
    })
    builder.addCase(getBracesNotesDetails.rejected, (state) => {
      state.getBracesNotesDetailsLoading = false
    })

    // Add Photos
    builder.addCase(postAddPhotos.pending, (state) => {
      state.postAddPhotosLoading = true
    })
    builder.addCase(postAddPhotos.fulfilled, (state, action) => {
      state.postAddPhotosLoading = false
      state.postAddPhotosData = action.payload
    })
    builder.addCase(postAddPhotos.rejected, (state) => {
      state.postAddPhotosLoading = false
    })
  },
})

export const {
  setAppointmentReminderList,
  setAppointmentList,
  setBracesTreatmentStageList,
  // setBracesTreatmentMaterialShapeList,
  // setBracesTreatmentMaterialNameList,
  // setBracesTreatmentMaterialSizeList,
  setAccessoriesList,
  setAppointmentDetails,
} = BracesNotes.actions
export default BracesNotes.reducer
