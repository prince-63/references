import bracesTreatmentPlanStatusConstants from '@constants/bracesTreatmentPlanStatus.constants'
import HttpMethod from '@constants/httpMethods.constants'
import subTreatmentTypeConstants from '@constants/subTreatmentType.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_CREATE_TREATMENT_PLAN,
  URL_DEACTIVATE_TREATMENT_PLAN,
  URL_GET_ALL_TREATMENT_PLAN_LIST,
  URL_GET_ANCHOR_TYPE_LIST,
  URL_GET_BRACES_TREATMENT_PLAN_DETAIL,
  URL_GET_BRACES_TREATMENT_PLAN_LIST,
  URL_GET_BRACKET_COMPANY_LIST,
  URL_GET_BRACKET_SELECT_TYPE_LIST,
  URL_GET_BRACKET_SUB_TYPE_LIST,
  URL_GET_BRACKET_TYPE_LIST,
  URL_GET_TREATMENT_PLAN,
  URL_GET_TREATMENT_PLAN_LIST,
  URL_POST_ANCHOR_TYPE,
  URL_POST_BRACKET_ADD_COMPANY,
  URL_POST_COMPLETE_TREATMENT,
  URL_POST_CREATE_TREATMENT_PLAN_BRACES,
  URL_POST_DELETE_DRAFT,
  URL_POST_UPDATE_TREATMENT_PLAN_BRACES,
} from 'redux/Endpoints/apiEndpoints'
import {capitalizeFirstLetter} from 'screens/Patients/LeadsProfile/main/appointments/utils/DateConversion'
import {
  AllTreatmentPlanListItem,
  IBracesTreatmentPlanDetails,
  ICompleteTreatmentPostData,
  IDeactivateTreatmentPlanPostData,
  ITreatmentPlan,
  ITreatmentPlanBraces,
  ITreatmentPlanBracesUpdate,
  IVideoFile,
  TreatmentPlanList,
  TreatmentPlanPostData,
  VideoPositionKey,
} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'
import {getStorageType} from 'utils/storage'

type FilterOption = {
  value: string
  label: string
}

export type AnchorFilterOption = {
  value: string
  label: string
  jaw_type: string
}

export const getTreatmentPlan = createAsyncThunk(
  'api/getTreatmentPlan',
  async (
    getTreatmentPlanParams: {
      aligner_treatment_id: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_TREATMENT_PLAN}${getTreatmentPlanParams.aligner_treatment_id}`,
        HttpMethod.GET
      )
      const getProperKey = (key: string) => {
        switch (key) {
          case 'FRONT_VIDEO':
            return 'FRONT'
          case 'TOP_VIDEO':
            return 'TOP'
          case 'BOTTOM_VIDEO':
            return 'BOTTOM'
          case 'LEFT_VIDEO':
            return 'LEFT'
          case 'RIGHT_VIDEO':
            return 'RIGHT'
          default:
            return 'SINGLE_VIDEO'
        }
      }
      const convertVideoTagsToState = (
        videoData: Array<{
          treatment_plan_video_tags: VideoPositionKey | null
          video_url: string
          is_gdrive_platform?: boolean
        }>
      ) => {
        const videoFileUrls: Record<VideoPositionKey, IVideoFile | null> = {
          SINGLE_VIDEO: null,
          TOP: null,
          BOTTOM: null,
          FRONT: null,
          LEFT: null,
          RIGHT: null,
        }

        videoData?.forEach((video) => {
          const key = getProperKey(video.treatment_plan_video_tags ?? '') as VideoPositionKey
          if (videoFileUrls.hasOwnProperty(key)) {
            const fileExtension = video.video_url.split('.').pop()?.toLowerCase() || ''
            const videoType = `video/${fileExtension}`
            videoFileUrls[key] = {
              url: video.video_url,
              type: videoType,
              name: video.video_url.split('/').pop() || 'Unknown',
              extension: fileExtension.toUpperCase(),
              is_gdrive_platform: video.is_gdrive_platform ?? false,
            }
          }
        })

        return videoFileUrls
      }

      const updatedVideoFileUrls = convertVideoTagsToState(response.data?.treatment_plan_videos)
      return {...response.data, video_files: updatedVideoFileUrls}
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const getSentToPracticeTreatmentPlan = createAsyncThunk(
  'api/getSentToPracticeTreatmentPlan',
  async (
    getTreatmentPlanParams: {
      aligner_treatment_id: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_TREATMENT_PLAN}${getTreatmentPlanParams.aligner_treatment_id}`,
        HttpMethod.GET
      )
      const getProperKey = (key: string) => {
        switch (key) {
          case 'FRONT_VIDEO':
            return 'FRONT'
          case 'TOP_VIDEO':
            return 'TOP'
          case 'BOTTOM_VIDEO':
            return 'BOTTOM'
          case 'LEFT_VIDEO':
            return 'LEFT'
          case 'RIGHT_VIDEO':
            return 'RIGHT'
          default:
            return 'SINGLE_VIDEO'
        }
      }
      const convertVideoTagsToState = (
        videoData: Array<{
          treatment_plan_video_tags: VideoPositionKey | null
          video_url: string
          is_gdrive_platform?: boolean
        }>
      ) => {
        const videoFileUrls: Record<VideoPositionKey, IVideoFile | null> = {
          SINGLE_VIDEO: null,
          TOP: null,
          BOTTOM: null,
          FRONT: null,
          LEFT: null,
          RIGHT: null,
        }

        videoData?.forEach((video) => {
          const key = getProperKey(video.treatment_plan_video_tags ?? '') as VideoPositionKey
          if (videoFileUrls.hasOwnProperty(key)) {
            const fileExtension = video.video_url.split('.').pop()?.toLowerCase() || ''
            const videoType = `video/${fileExtension}`
            videoFileUrls[key] = {
              url: video.video_url,
              type: videoType,
              name: video.video_url.split('/').pop() || 'Unknown',
              extension: fileExtension.toUpperCase(),
              is_gdrive_platform: video.is_gdrive_platform ? true : false,
            }
          }
        })

        return videoFileUrls
      }

      const updatedVideoFileUrls = convertVideoTagsToState(response.data?.treatment_plan_videos)
      return {...response.data, video_files: updatedVideoFileUrls}
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getTreatmentPlanList = createAsyncThunk(
  'api/getTreatmentPlanList',
  async (
    getTreatmentPlanListParams: {
      doctor_id: string
      patient_id: string
      treatment_subtype: keyof typeof subTreatmentTypeConstants
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_TREATMENT_PLAN_LIST}?patient_id=${getTreatmentPlanListParams.patient_id}&doctor_id=${getTreatmentPlanListParams.doctor_id}&treatment_subtype=${getTreatmentPlanListParams.treatment_subtype}`,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getAllTreatmentPlanList = createAsyncThunk(
  'api/getAllTreatmentPlanList',
  async (
    getAllTreatmentPlanListParams: {
      doctor_id: string
      patient_id: string | number
      organization_id: string | number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_ALL_TREATMENT_PLAN_LIST}?patient_id=${getAllTreatmentPlanListParams.patient_id}&doctor_id=${getAllTreatmentPlanListParams.doctor_id}&organization_id=${getAllTreatmentPlanListParams.organization_id}`,
        HttpMethod.GET
      )
      const treatmentPlanList = response.data
      const activeIndex = treatmentPlanList.findIndex(
        (treatmentPlan: AllTreatmentPlanListItem) => treatmentPlan.treatment_status === 'ACTIVE'
      )
      if (activeIndex > -1) {
        const [activeObject] = treatmentPlanList.splice(activeIndex, 1)
        treatmentPlanList.unshift(activeObject)
      }
      return treatmentPlanList
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracesTreatmentPlan = createAsyncThunk(
  'api/getBracesTreatmentPlan',
  async (
    getBracesTreatmentPlanParams: {
      doctorId: number
      bracesJourneyId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_BRACES_TREATMENT_PLAN_DETAIL}?doctorId=${getBracesTreatmentPlanParams.doctorId}&bracesJourneyId=${getBracesTreatmentPlanParams.bracesJourneyId}`,
        HttpMethod.GET
      )
      return response.data[0]
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracesTreatmentPlanList = createAsyncThunk(
  'api/getBracesTreatmentPlanList',
  async (
    getBracesTreatmentPlanListParams: {
      doctor_id: string
      patient_id: string
      braces_treatment_stage: keyof typeof bracesTreatmentPlanStatusConstants
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_GET_BRACES_TREATMENT_PLAN_LIST}`,
        HttpMethod.POST,
        getBracesTreatmentPlanListParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const createTreatmentPlan = createAsyncThunk(
  'api/createTreatmentPlan',
  async (createTreatmentPlanPayload: TreatmentPlanPostData, {rejectWithValue}) => {
    try {
      const profileId = getStorageType().getItem('profileId')
        ? Number(getStorageType().getItem('profileId'))
        : null
      const formData = new FormData()
      if (createTreatmentPlanPayload?.files) {
        createTreatmentPlanPayload?.files?.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            formData.append('file', file)
          }
        })
      }
      if (createTreatmentPlanPayload?.other_files) {
        createTreatmentPlanPayload?.other_files?.forEach((file) => {
          if (file instanceof File && file.size > 0) {
            formData.append('otherFile', file)
          }
        })
      }
      if (createTreatmentPlanPayload?.video_files) {
        Object.entries(createTreatmentPlanPayload.video_files).forEach(
          (item: [string, File | unknown]) => {
            if (item[1] instanceof File) {
              formData.append(item[0], item[1])
            } else {
              formData.append(item[0], 'null')
            }
          }
        )
      }
      if (createTreatmentPlanPayload?.pdf_file) {
        if (
          createTreatmentPlanPayload.pdf_file instanceof File &&
          createTreatmentPlanPayload.pdf_file.size > 0
        ) {
          formData.append('pdfFile', createTreatmentPlanPayload.pdf_file)
        } else {
          formData.append('pdfFile', 'null')
        }
      }
      const details = {
        ...createTreatmentPlanPayload.details,
        profile_id: profileId,
      }
      formData.append('details', JSON.stringify(details))

      const response = await apiHelper(`${URL_CREATE_TREATMENT_PLAN}`, HttpMethod.POST, formData)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postDeleteDraft = createAsyncThunk(
  'api/postDeleteDraft',
  async (
    postDeleteDraftParams: {
      profileId: number
      treatmentPlanId: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        `${URL_POST_DELETE_DRAFT}${postDeleteDraftParams.profileId}&treatmentPlanId=${postDeleteDraftParams.treatmentPlanId}`,
        HttpMethod.DELETE,
        postDeleteDraftParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const deactivateTreatmentPlan = createAsyncThunk(
  'api/deactivateTreatmentPlan',
  async (deactivateTreatmentPlan: IDeactivateTreatmentPlanPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        `${URL_DEACTIVATE_TREATMENT_PLAN}`,
        HttpMethod.POST,
        deactivateTreatmentPlan
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracketTypeList = createAsyncThunk(
  'api/getBracketTypeList',
  async (getBracketTypeListParams: {data: null}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_GET_BRACKET_TYPE_LIST, HttpMethod.GET)
      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.id),
          label: capitalizeFirstLetter(element.material_stage_type),
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracketSelectTypeList = createAsyncThunk(
  'api/getBracketSelectTypeList',
  async (getBracketSelectTypeListParams: {bracket_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_BRACKET_SELECT_TYPE_LIST + getBracketSelectTypeListParams.bracket_id,
        HttpMethod.GET
      )
      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.id),
          label: capitalizeFirstLetter(element.bracket_type_enum),
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracketSubTypeList = createAsyncThunk(
  'api/getBracketSubTypeList',
  async (
    getBracketSubTypeListParams: {doctor_id: number; bracket_id: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_GET_BRACKET_SUB_TYPE_LIST +
          getBracketSubTypeListParams.doctor_id +
          '/' +
          getBracketSubTypeListParams.bracket_id,
        HttpMethod.GET
      )
      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        // if (element.bracket_sub_type_name != 'No sub-type') {
        tempArray.push({
          value: String(element.id),
          label: capitalizeFirstLetter(element.bracket_sub_type_name),
        })
        // }
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getBracketCompanyList = createAsyncThunk(
  'api/getBracketCompanyList',
  async (
    getBracketCompanyListParams: {doctor_id: number; bracket_sub_type_id: number},
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_GET_BRACKET_COMPANY_LIST +
          getBracketCompanyListParams.doctor_id +
          '/' +
          getBracketCompanyListParams.bracket_sub_type_id,
        HttpMethod.GET
      )
      const list = response.data
      const tempArray: Array<FilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.id),
          label: capitalizeFirstLetter(element.bracket_company_name),
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getAnchorageTypeList = createAsyncThunk(
  'api/getAnchorageTypeList',
  async (getAnchorageTypeListParam: {doctor_id: number}, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_GET_ANCHOR_TYPE_LIST + getAnchorageTypeListParam.doctor_id,
        HttpMethod.GET
      )
      const list = response.data
      const tempArray: Array<AnchorFilterOption> = []
      for (let index = 0; index < list.length; index++) {
        const element = list[index]
        tempArray.push({
          value: String(element.id),
          label: element.value,
          jaw_type: element.jaw_type,
        })
      }
      return tempArray
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)
export const postBracketAddCompany = createAsyncThunk(
  'api/postBracketAddCompany',
  async (
    postBracketAddCompanyParams: {
      doctor_id: number
      bracket_sub_type_id: number
      bracket_company_name: string
    },
    {}
  ) => {
    try {
      const response = await apiHelper(
        URL_POST_BRACKET_ADD_COMPANY,
        HttpMethod.POST,
        postBracketAddCompanyParams
      )
      return response.data
    } catch (error: any) {
      return error.response.data
    }
  }
)

export const postAnchorType = createAsyncThunk(
  'api/postAnchorType',
  async (
    postAnchorTypeParams: {
      doctor_id: number
      jaw_type: string
      value: string
    },
    {}
  ) => {
    try {
      const response = await apiHelper(URL_POST_ANCHOR_TYPE, HttpMethod.POST, postAnchorTypeParams)
      return response.data
    } catch (error: any) {
      return error.response.data
    }
  }
)

export const postCreateTreatmentPlanBraces = createAsyncThunk(
  'api/postCreateTreatmentPlanBraces',
  async (postCreateTreatmentPlanBracesParams: ITreatmentPlanBraces, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_POST_CREATE_TREATMENT_PLAN_BRACES,
        HttpMethod.POST,
        postCreateTreatmentPlanBracesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postUpdateTreatmentPlanBraces = createAsyncThunk(
  'api/postUpdateTreatmentPlanBraces',
  async (postUpdateTreatmentPlanBracesParams: ITreatmentPlanBracesUpdate, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_POST_UPDATE_TREATMENT_PLAN_BRACES,
        HttpMethod.POST,
        postUpdateTreatmentPlanBracesParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postCompleteTreatment = createAsyncThunk(
  'api/postCompleteTreatment',
  async (postCompleteTreatmentParams: ICompleteTreatmentPostData, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_POST_COMPLETE_TREATMENT,
        HttpMethod.POST,
        postCompleteTreatmentParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const LeadsProfileTreatmentPlan = createSlice({
  name: 'leadsProfileTreatmentPlan',
  initialState: {
    treatmentPlanningSoftwareList: [
      {label: 'test software', value: 'test software'},
      {
        label: 'Clear Aligners',
        value: 'ALIGNERS',
      },
    ],
    treatmentPlan: {} as ITreatmentPlan,
    getTreatmentPlanLoading: false,
    activeTreatmentPlanRequestId: null as string | null,
    getSentToPracticeTreatmentPlanLoading: false,
    sentToPracticeTreatmentPlan: {} as ITreatmentPlan,
    getTreatmentPlanError: null as string | null,
    getTreatmentPlanListLoading: false,
    getTreatmentPlanListError: null as string | null,
    treatmentPlanList: [] as TreatmentPlanList[],

    getAllTreatmentPlanListLoading: false,
    getAllTreatmentPlanListError: null as string | null,
    allTreatmentPlanList: [] as AllTreatmentPlanListItem[],
    openDraftModal: false,
    openConfirmFinalizeModal: false,
    openDeleteDraftPlanModal: false,
    openExistingActiveTreatmentPlanModal: false,
    openDeactivateTreatmentPlanModal: false,
    openConfirmDeactivateTreatmentPlanModal: false,
    openTreatmentStartingModal: false,
    openApprovePendingActionModal: false,
    createTreatmentPlanLoading: false,
    createTreatmentPlanError: null as string | null,
    deactivatingTreatmentPlan: false,
    treatmentPlanBraces: {} as ITreatmentPlanBraces,
    getTreatmentPlanBracesLoading: false,
    bracketTypeList: [] as FilterOption[],
    getBracketTypeListLoading: false,
    bracketSelectTypeList: [] as FilterOption[],
    getBracketSelectTypeListLoading: false,
    bracketSubTypeList: [] as FilterOption[],
    getBracketSubTypeListLoading: false,
    bracketCompanyList: [] as FilterOption[],
    getBracketCompanyListLoading: false,
    postBracketAddCompanyData: null as string | null,
    postBracketAddCompanyLoading: false,
    selectedTreatmentPlanId: null as number | null,
    showSendToPatientModal: false,

    postCreateTreatmentPlanBracesData: null as string | null,
    postCreateTreatmentPlanBracesLoading: false,

    postUpdateTreatmentPlanBracesData: null as string | null,
    postUpdateTreatmentPlanBracesLoading: false,

    bracesTreatmentPlanList: [] as IBracesTreatmentPlanDetails[],
    getBracesTreatmentPlanListLoading: false,

    anchorageTypeList: [] as AnchorFilterOption[],
    anchorageTypeListLoading: false,

    anchorageTypeAddLoading: false,
    anchorageTypeAdd: [],

    CompleteTreatment: false,
    postCompleteTreatmentLoading: false,
    treatmentId: null,
  },
  reducers: {
    setTreatmentPlan: (state, action) => {
      state.treatmentPlan = action.payload
    },
    setTreatmentId: (state, action) => {
      state.treatmentId = action.payload
    },
    resetTreatmentPlan: (state) => {
      state.treatmentPlan = {} as ITreatmentPlan
      state.treatmentPlanBraces = {} as ITreatmentPlanBraces
      state.allTreatmentPlanList = []
      state.activeTreatmentPlanRequestId = null
    },
    setSentToPracticeTreatmentPlan: (state, action) => {
      state.sentToPracticeTreatmentPlan = action.payload
    },
    setOpenDraftModal: (state, action) => {
      state.openDraftModal = action.payload
    },

    setOpenDeleteDraftPlanModal: (state, action) => {
      state.openDeleteDraftPlanModal = action.payload
    },
    setTreatmentPlanBraces: (state, action) => {
      state.treatmentPlanBraces = action.payload
    },
    setBracketSelectTypeList: (state, action) => {
      state.bracketSelectTypeList = action.payload
    },
    setBracketSubTypeList: (state, action) => {
      state.bracketSubTypeList = action.payload
    },
    setBracketCompanyList: (state, action) => {
      state.bracketCompanyList = action.payload
    },
    setOpenConfirmFinalizeModal: (state, action) => {
      state.openConfirmFinalizeModal = action.payload
    },
    setOpenExistingActiveTreatmentPlanModal: (state, action) => {
      state.openExistingActiveTreatmentPlanModal = action.payload
    },
    setOpenDeactivateTreatmentPlanModal: (state, action) => {
      state.openDeactivateTreatmentPlanModal = action.payload
    },
    setOpenConfirmDeactivateTreatmentPlanModal: (state, action) => {
      state.openConfirmDeactivateTreatmentPlanModal = action.payload
    },
    setSelectedTreatmentPlanId: (state, action) => {
      state.selectedTreatmentPlanId = action.payload
    },
    setOpenTreatmentStartingModal: (state, action) => {
      state.openTreatmentStartingModal = action.payload
    },
    setOpenApprovePendingActionModal: (state, action) => {
      state.openApprovePendingActionModal = action.payload
    },
    setShowSendToPatientModal: (state, action) => {
      state.showSendToPatientModal = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getTreatmentPlan.pending, (state, action) => {
      state.getTreatmentPlanLoading = true
      state.getTreatmentPlanError = null
      state.activeTreatmentPlanRequestId = action.meta.arg.aligner_treatment_id
    })
    builder.addCase(getTreatmentPlan.fulfilled, (state, action) => {
      if (state.activeTreatmentPlanRequestId !== action.meta.arg.aligner_treatment_id) return
      state.getTreatmentPlanLoading = false
      state.treatmentPlan = action.payload
      state.activeTreatmentPlanRequestId = null
    })
    builder.addCase(getTreatmentPlan.rejected, (state, action) => {
      if (state.activeTreatmentPlanRequestId !== action.meta.arg.aligner_treatment_id) return
      state.getTreatmentPlanLoading = false
      state.getTreatmentPlanError = action.payload as string
      state.activeTreatmentPlanRequestId = null
    })
    builder.addCase(getSentToPracticeTreatmentPlan.pending, (state) => {
      state.getSentToPracticeTreatmentPlanLoading = true
      state.getTreatmentPlanError = null
    })
    builder.addCase(getSentToPracticeTreatmentPlan.fulfilled, (state, action) => {
      state.getSentToPracticeTreatmentPlanLoading = false
      state.sentToPracticeTreatmentPlan = action.payload
    })
    builder.addCase(getSentToPracticeTreatmentPlan.rejected, (state) => {
      state.getSentToPracticeTreatmentPlanLoading = false
    })
    builder.addCase(createTreatmentPlan.pending, (state) => {
      state.createTreatmentPlanLoading = true
      state.createTreatmentPlanError = null
    })
    builder.addCase(createTreatmentPlan.fulfilled, (state, action) => {
      state.createTreatmentPlanLoading = false
      state.treatmentPlan = action.payload
    })
    builder.addCase(createTreatmentPlan.rejected, (state, action) => {
      state.createTreatmentPlanLoading = false
      state.createTreatmentPlanError = action.payload as string
    })
    builder.addCase(getTreatmentPlanList.pending, (state) => {
      state.getTreatmentPlanListLoading = true
      state.getTreatmentPlanListError = null
    })

    builder.addCase(getTreatmentPlanList.fulfilled, (state, action) => {
      state.getTreatmentPlanListLoading = false
      state.treatmentPlanList = action.payload
    })
    builder.addCase(getTreatmentPlanList.rejected, (state, action) => {
      state.getTreatmentPlanListLoading = false
      state.getTreatmentPlanListError = action.payload as string
    })
    builder.addCase(getAllTreatmentPlanList.pending, (state) => {
      state.getAllTreatmentPlanListLoading = true
      state.getAllTreatmentPlanListError = null
    })
    builder.addCase(getAllTreatmentPlanList.fulfilled, (state, action) => {
      state.getAllTreatmentPlanListLoading = false
      state.allTreatmentPlanList = action.payload
    })
    builder.addCase(getAllTreatmentPlanList.rejected, (state, action) => {
      state.getAllTreatmentPlanListLoading = false
      state.getAllTreatmentPlanListError = action.payload as string
    })

    builder.addCase(deactivateTreatmentPlan.pending, (state) => {
      state.deactivatingTreatmentPlan = true
    })
    builder.addCase(deactivateTreatmentPlan.fulfilled, (state) => {
      state.deactivatingTreatmentPlan = false
    })
    builder.addCase(deactivateTreatmentPlan.rejected, (state) => {
      state.deactivatingTreatmentPlan = false
    })

    // Bracket Type List
    builder.addCase(getBracketTypeList.pending, (state) => {
      state.getBracketTypeListLoading = true
    })
    builder.addCase(getBracketTypeList.fulfilled, (state, action) => {
      state.getBracketTypeListLoading = false
      state.bracketTypeList = action.payload
    })
    builder.addCase(getBracketTypeList.rejected, (state) => {
      state.getBracketTypeListLoading = false
    })

    // Bracket Type Select List
    builder.addCase(getBracketSelectTypeList.pending, (state) => {
      state.getBracketSelectTypeListLoading = true
    })
    builder.addCase(getBracketSelectTypeList.fulfilled, (state, action) => {
      state.getBracketSelectTypeListLoading = false
      state.bracketSelectTypeList = action.payload
    })
    builder.addCase(getBracketSelectTypeList.rejected, (state) => {
      state.getBracketSelectTypeListLoading = false
    })

    // Bracket Sub Type List
    builder.addCase(getBracketSubTypeList.pending, (state) => {
      state.getBracketSubTypeListLoading = true
    })
    builder.addCase(getBracketSubTypeList.fulfilled, (state, action) => {
      state.getBracketSubTypeListLoading = false
      state.bracketSubTypeList = action.payload
    })
    builder.addCase(getBracketSubTypeList.rejected, (state) => {
      state.getBracketSubTypeListLoading = false
    })

    // Bracket Company List
    builder.addCase(getBracketCompanyList.pending, (state) => {
      state.getBracketCompanyListLoading = true
    })
    builder.addCase(getBracketCompanyList.fulfilled, (state, action) => {
      state.getBracketCompanyListLoading = false
      state.bracketCompanyList = action.payload
    })
    builder.addCase(getBracketCompanyList.rejected, (state) => {
      state.getBracketCompanyListLoading = false
    })

    // Anchorage type list
    builder.addCase(getAnchorageTypeList.pending, (state) => {
      state.anchorageTypeListLoading = true
    })
    builder.addCase(getAnchorageTypeList.fulfilled, (state, action) => {
      state.anchorageTypeListLoading = false
      state.anchorageTypeList = action.payload
    })
    builder.addCase(getAnchorageTypeList.rejected, (state) => {
      state.anchorageTypeListLoading = false
    })

    //Add Anchorage type
    builder.addCase(postAnchorType.pending, (state) => {
      state.anchorageTypeAddLoading = true
    })
    builder.addCase(postAnchorType.fulfilled, (state, action) => {
      state.anchorageTypeAddLoading = false
      state.anchorageTypeAdd = action.payload
    })
    builder.addCase(postAnchorType.rejected, (state) => {
      state.anchorageTypeAddLoading = false
    })

    // Bracket Add Company Name
    builder.addCase(postBracketAddCompany.pending, (state) => {
      state.postBracketAddCompanyLoading = true
    })
    builder.addCase(postBracketAddCompany.fulfilled, (state, action) => {
      state.postBracketAddCompanyLoading = false
      state.postBracketAddCompanyData = action.payload
    })
    builder.addCase(postBracketAddCompany.rejected, (state) => {
      state.postBracketAddCompanyLoading = false
    })

    // Create Treatment Plan Braces
    builder.addCase(postCreateTreatmentPlanBraces.pending, (state) => {
      state.postCreateTreatmentPlanBracesLoading = true
    })
    builder.addCase(postCreateTreatmentPlanBraces.fulfilled, (state, action) => {
      state.postCreateTreatmentPlanBracesLoading = false
      state.postCreateTreatmentPlanBracesData = action.payload
    })
    builder.addCase(postCreateTreatmentPlanBraces.rejected, (state) => {
      state.postCreateTreatmentPlanBracesLoading = false
    })

    // Update Treatment Plan Braces
    builder.addCase(postUpdateTreatmentPlanBraces.pending, (state) => {
      state.postUpdateTreatmentPlanBracesLoading = true
    })
    builder.addCase(postUpdateTreatmentPlanBraces.fulfilled, (state, action) => {
      state.postUpdateTreatmentPlanBracesLoading = false
      state.postUpdateTreatmentPlanBracesData = action.payload
    })
    builder.addCase(postUpdateTreatmentPlanBraces.rejected, (state) => {
      state.postUpdateTreatmentPlanBracesLoading = false
    })

    // Braces Treatment Plan List
    builder.addCase(getBracesTreatmentPlanList.pending, (state) => {
      state.getBracesTreatmentPlanListLoading = true
    })
    builder.addCase(getBracesTreatmentPlanList.fulfilled, (state, action) => {
      state.getBracesTreatmentPlanListLoading = false
      state.bracesTreatmentPlanList = action.payload
    })
    builder.addCase(getBracesTreatmentPlanList.rejected, (state) => {
      state.getBracesTreatmentPlanListLoading = false
    })

    // Braces Treatment Plan Details
    builder.addCase(getBracesTreatmentPlan.pending, (state) => {
      state.getTreatmentPlanBracesLoading = true
    })
    builder.addCase(getBracesTreatmentPlan.fulfilled, (state, action) => {
      state.getTreatmentPlanBracesLoading = false
      state.treatmentPlanBraces = action.payload
    })
    builder.addCase(getBracesTreatmentPlan.rejected, (state) => {
      state.getTreatmentPlanBracesLoading = false
    })

    builder.addCase(postCompleteTreatment.pending, (state) => {
      state.postCompleteTreatmentLoading = true
    })
    builder.addCase(postCompleteTreatment.fulfilled, (state) => {
      state.postCompleteTreatmentLoading = false
      state.CompleteTreatment = true
    })

    builder.addCase(postCompleteTreatment.rejected, (state) => {
      state.postCompleteTreatmentLoading = true
    })
  },
})
export const {
  setTreatmentPlan,
  setTreatmentId,
  setOpenDraftModal,
  setOpenConfirmFinalizeModal,
  setTreatmentPlanBraces,
  setSentToPracticeTreatmentPlan,
  setBracketSelectTypeList,
  setBracketSubTypeList,
  setBracketCompanyList,
  setOpenExistingActiveTreatmentPlanModal,
  setOpenDeactivateTreatmentPlanModal,
  setOpenConfirmDeactivateTreatmentPlanModal,
  setSelectedTreatmentPlanId,
  setOpenTreatmentStartingModal,
  resetTreatmentPlan,
  setOpenApprovePendingActionModal,
  setShowSendToPatientModal,
  setOpenDeleteDraftPlanModal,
} = LeadsProfileTreatmentPlan.actions
export default LeadsProfileTreatmentPlan.reducer
