import HttpMethod from '@constants/httpMethods.constants'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit'
import apiHelper from '@utils/apiHelper'
import {
  URL_ADD_PAYMENT_REMINDER,
  URL_DELETE_PAYMENT_REMINDER,
  URL_GET_PAYMENT_DETAIL,
  URL_POST_ADD_PAYMENT,
  URL_POST_DELETE_PAYMENT,
  URL_POST_TREATMENT_COST,
  URL_POST_UPDATE_PAYMENT,
  URL_UPDATE_PAYMENT_REMINDER,
} from 'redux/Endpoints/apiEndpoints'
import {
  PaymentsData,
  PostPaymentDetail,
  PostPaymentReminderDetail,
} from 'screens/Patients/LeadsProfile/main/payments/types/payments.types'

export const getPaymentDetail = createAsyncThunk(
  'api/getPaymentsDetail',
  async (
    getPaymentDetailParams: {
      doctor_id: number
      patient_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_GET_PAYMENT_DETAIL +
          getPaymentDetailParams.patient_id +
          '/to/' +
          getPaymentDetailParams.doctor_id,
        HttpMethod.GET
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postTreatmentCost = createAsyncThunk(
  'api/postTreatmentCost',
  async (
    postTreatmentCostParams: {
      doctor_id: number
      patient_id: number
      cost: string
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_POST_TREATMENT_COST,
        HttpMethod.POST,
        postTreatmentCostParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postAddPayment = createAsyncThunk(
  'api/postAddPayment',
  async (postAddPaymentParams: PostPaymentDetail, {rejectWithValue}) => {
    try {
      const response = await apiHelper(URL_POST_ADD_PAYMENT, HttpMethod.POST, postAddPaymentParams)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postUpdatePayment = createAsyncThunk(
  'api/postUpdatePayment',
  async (postUpdatePaymentParams: PostPaymentDetail, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_POST_UPDATE_PAYMENT,
        HttpMethod.POST,
        postUpdatePaymentParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postDeletePayment = createAsyncThunk(
  'api/postDeletePayment',
  async (
    postDeletePaymentParams: {
      payment_id: number
      patient_id: number
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_POST_DELETE_PAYMENT,
        HttpMethod.POST,
        postDeletePaymentParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postAddPaymentReminder = createAsyncThunk(
  'api/postAddPaymentReminder',
  async (postAddPaymentReminderParams: PostPaymentReminderDetail, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_ADD_PAYMENT_REMINDER,
        HttpMethod.POST,
        postAddPaymentReminderParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postUpdatePaymentReminder = createAsyncThunk(
  'api/postUpdatePaymentReminder',
  async (postUpdatePaymentReminderParams: PostPaymentReminderDetail, {rejectWithValue}) => {
    try {
      const response = await apiHelper(
        URL_UPDATE_PAYMENT_REMINDER,
        HttpMethod.POST,
        postUpdatePaymentReminderParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const postDeletePaymentReminder = createAsyncThunk(
  'api/postDeletePaymentReminder',
  async (
    postDeletePaymentReminderParams: {
      reminder_id: number
      patient_id: number
      doctor_id: number
    },
    {rejectWithValue}
  ) => {
    try {
      const response = await apiHelper(
        URL_DELETE_PAYMENT_REMINDER,
        HttpMethod.POST,
        postDeletePaymentReminderParams
      )
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response.data)
    }
  }
)

const Payments = createSlice({
  name: 'payments',
  initialState: {
    paymentDetail: {} as PaymentsData,
    getPaymentDetailLoading: false,

    isTreatmentCostModalVisible: false,
    postTreatmentCostLoading: false,

    isPaymentModalVisible: false,
    postAddPaymentLoading: false,
    selectedPaymentId: 0,
    postUpdatePaymentLoading: false,
    isDeletePaymentModalVisible: false,
    postDeletePaymentLoading: false,

    isDeletePaymentReminderModalVisible: false,
    selectedPaymentReminderId: 0,
    postAddPaymentReminderLoading: false,
    postUpdatePaymentReminderLoading: false,
    postDeletePaymentReminderLoading: false,
  },
  reducers: {
    setPaymentDetails: (state, action) => {
      state.paymentDetail = action.payload
    },
    setIsTreatmentCostModalVisible: (state, action) => {
      state.isTreatmentCostModalVisible = action.payload
    },
    setIsPaymentModalVisible: (state, action) => {
      state.isPaymentModalVisible = action.payload
    },
    setSelectedPaymentId: (state, action) => {
      state.selectedPaymentId = action.payload
    },
    setIsDeletePaymentModalVisible: (state, action) => {
      state.isDeletePaymentModalVisible = action.payload
    },

    setSelectedPaymentReminderId: (state, action) => {
      state.selectedPaymentReminderId = action.payload
    },
    setIsDeletePaymentReminderModalVisible: (state, action) => {
      state.isDeletePaymentReminderModalVisible = action.payload
    },
  },
  extraReducers: (builder) => {
    // Payments Details
    builder.addCase(getPaymentDetail.pending, (state) => {
      state.getPaymentDetailLoading = true
    })
    builder.addCase(getPaymentDetail.fulfilled, (state, action) => {
      state.getPaymentDetailLoading = false
      state.paymentDetail = action.payload
    })
    builder.addCase(getPaymentDetail.rejected, (state) => {
      state.getPaymentDetailLoading = false
    })

    // Treatment Cost
    builder.addCase(postTreatmentCost.pending, (state) => {
      state.postTreatmentCostLoading = true
    })
    builder.addCase(postTreatmentCost.fulfilled, (state) => {
      state.postTreatmentCostLoading = false
    })
    builder.addCase(postTreatmentCost.rejected, (state) => {
      state.postTreatmentCostLoading = false
    })

    // Add Payment
    builder.addCase(postAddPayment.pending, (state) => {
      state.postAddPaymentLoading = true
    })
    builder.addCase(postAddPayment.fulfilled, (state) => {
      state.postAddPaymentLoading = false
    })
    builder.addCase(postAddPayment.rejected, (state) => {
      state.postAddPaymentLoading = false
    })

    // Update Payment
    builder.addCase(postUpdatePayment.pending, (state) => {
      state.postUpdatePaymentLoading = true
    })
    builder.addCase(postUpdatePayment.fulfilled, (state) => {
      state.postUpdatePaymentLoading = false
    })
    builder.addCase(postUpdatePayment.rejected, (state) => {
      state.postUpdatePaymentLoading = false
    })

    // Delete Payment
    builder.addCase(postDeletePayment.pending, (state) => {
      state.postDeletePaymentLoading = true
    })
    builder.addCase(postDeletePayment.fulfilled, (state) => {
      state.postDeletePaymentLoading = false
    })
    builder.addCase(postDeletePayment.rejected, (state) => {
      state.postDeletePaymentLoading = false
    })

    // Add Payment Reminder
    builder.addCase(postAddPaymentReminder.pending, (state) => {
      state.postAddPaymentReminderLoading = true
    })
    builder.addCase(postAddPaymentReminder.fulfilled, (state) => {
      state.postAddPaymentReminderLoading = false
    })
    builder.addCase(postAddPaymentReminder.rejected, (state) => {
      state.postAddPaymentReminderLoading = false
    })

    // Update Payment Reminder
    builder.addCase(postUpdatePaymentReminder.pending, (state) => {
      state.postUpdatePaymentReminderLoading = true
    })
    builder.addCase(postUpdatePaymentReminder.fulfilled, (state) => {
      state.postUpdatePaymentReminderLoading = false
    })
    builder.addCase(postUpdatePaymentReminder.rejected, (state) => {
      state.postUpdatePaymentReminderLoading = false
    })

    // Delete Payment Reminder
    builder.addCase(postDeletePaymentReminder.pending, (state) => {
      state.postDeletePaymentReminderLoading = true
    })
    builder.addCase(postDeletePaymentReminder.fulfilled, (state) => {
      state.postDeletePaymentReminderLoading = false
    })
    builder.addCase(postDeletePaymentReminder.rejected, (state) => {
      state.postDeletePaymentReminderLoading = false
    })
  },
})

export const {
  setPaymentDetails,
  setIsTreatmentCostModalVisible,
  setIsPaymentModalVisible,
  setSelectedPaymentId,
  setIsDeletePaymentModalVisible,
  setSelectedPaymentReminderId,
  setIsDeletePaymentReminderModalVisible,
} = Payments.actions
export default Payments.reducer
