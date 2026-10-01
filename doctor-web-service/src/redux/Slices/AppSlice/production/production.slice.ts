import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import {URL_GET_PRODUCTION_ORDERS} from '../../../Endpoints/apiEndpoints'
import apiHelper from '../../../../@utils/apiHelper'
import HttpMethod from '../../../../@constants/httpMethods.constants'
import {IApiResponse, IProductionOrder} from 'screens/Production/types/productionOrders.interface'
import moment from 'moment'
import sortOrderConstants from '@constants/sortOrder.constants'
import {getCurrentAligner} from 'utils/getCurrentAligner'
import hasValue from 'utils/hasValue'
import {productionStatusKeys} from 'screens/Production/types/productionModule.types'
import filterReminderConstants from '@constants/filterReminder.constants'
interface payload {
  status: string
  doctorId: number
}

export const postApiDataProductionSlice = createAsyncThunk(
  'api/postApiDataProduction',
  async (payload: payload, {rejectWithValue}) => {
    try {
      const destructuredPayload = {
        doctor_id: payload.doctorId,
        statuses: payload.status === '' ? [] : [payload.status],
      }
      const response = await apiHelper(
        URL_GET_PRODUCTION_ORDERS,
        HttpMethod.POST,
        destructuredPayload
      )
      //Sort and return

      if (!hasValue(payload.status)) {
        const orders = response.data.orders
        const ordersWithReminder = orders.filter((order: IProductionOrder) =>
          hasValue(order.reminders)
        )
        const ordersWithoutReminder = orders.filter(
          (order: IProductionOrder) => !hasValue(order.reminders)
        )

        ordersWithReminder.sort((a: IProductionOrder, b: IProductionOrder) => {
          const reminderA =
            a.reminders && a.reminders?.length > 0
              ? a.reminders[a.reminders.length - 1].remind_at
              : ''
          const reminderB =
            b.reminders && b.reminders?.length > 0
              ? b.reminders[b.reminders.length - 1].remind_at
              : ''
          return moment(reminderA, 'YYYY-MM-DD').diff(moment(reminderB, 'YYYY-MM-DD'))
        })

        ordersWithoutReminder.sort((a: IProductionOrder, b: IProductionOrder) => {
          // Extract patient names from orders
          const nameA = `${a.patient.first_name} ${a.patient.last_name}`.toLowerCase()
          const nameB = `${b.patient.first_name} ${b.patient.last_name}`.toLowerCase()
          // Compare patient names alphabetically
          if (nameA < nameB) {
            return -1
          }
          if (nameA > nameB) {
            return 1
          }
          return 0
        })

        response.data.orders = ordersWithReminder.concat(ordersWithoutReminder)
      } else {
        const status = payload.status as productionStatusKeys
        response.data.orders.sort((a: IProductionOrder, b: IProductionOrder) => {
          const alignerB = b.aligners_with_status
            ? (b.aligners_with_status[status]?.start_date ?? '')
            : ''

          const alignerA = a.aligners_with_status
            ? (a.aligners_with_status[status]?.start_date ?? '')
            : ''

          return moment(alignerA, 'YYYY-MM-DD').diff(moment(alignerB, 'YYYY-MM-DD'))
        })
      }
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data)
    }
  }
)

const productionSlice = createSlice({
  name: 'productionSlice',
  initialState: {
    productionOrders: null as IApiResponse | null,
    filteredOrders: null as IProductionOrder[] | null,
    filterCount: 0,
    error: null as string | null,
    loading: false,
  },
  reducers: {
    applyFilterSort(state, action: any) {
      const {
        alignerBrands,
        reminderSet,
        reminderSort,
        startDateSort,
        dueDateSort,
        status,
      }: {
        alignerBrands: any
        reminderSet: any
        reminderSort: any
        startDateSort: any
        dueDateSort: any
        status: productionStatusKeys
      } = action.payload
      state.filterCount = 0

      // Apply filter based on aligner brands
      let filteredOrders = state.productionOrders?.orders
      if (filteredOrders && alignerBrands && alignerBrands.length > 0) {
        filteredOrders = filteredOrders.filter((order) =>
          alignerBrands.includes(order.aligner_journey.brand)
        )
        state.filterCount = alignerBrands.length
      }
      //Reminder set - not set
      if (filteredOrders && reminderSet != '') {
        filteredOrders = filteredOrders.filter((order) => {
          //Use constants here
          if (reminderSet == filterReminderConstants.REMINDER_SET) {
            return hasValue(order.reminders)
          } else {
            return !hasValue(order.reminders)
          }
        })
        state.filterCount += 1
      }

      // Apply sorting based on reminder date
      if (filteredOrders) {
        const ordersWithReminder = filteredOrders.filter((order) => hasValue(order.reminders))
        const ordersWithoutReminder = filteredOrders.filter((order) => !hasValue(order.reminders))

        // Sort orders with reminders

        if (reminderSort === sortOrderConstants.NEWEST_TO_OLDEST) {
          ordersWithReminder.sort((a, b) => {
            const reminderA =
              a.reminders && a.reminders?.length > 0
                ? a.reminders[a.reminders.length - 1].remind_at
                : ''

            const reminderB =
              b.reminders && b.reminders?.length > 0
                ? b.reminders[b.reminders.length - 1].remind_at
                : ''
            return moment(reminderB, '').diff(moment(reminderA, 'YYYY-MM-DD'))
          })
        } else if (reminderSort === sortOrderConstants.OLDEST_TO_NEWEST) {
          ordersWithReminder.sort((a, b) => {
            const reminderA =
              a.reminders && a.reminders?.length > 0
                ? a.reminders[a.reminders.length - 1].remind_at
                : ''

            const reminderB =
              b.reminders && b.reminders?.length > 0
                ? b.reminders[b.reminders.length - 1].remind_at
                : ''
            return moment(reminderA, 'YYYY-MM-DD').diff(moment(reminderB, 'YYYY-MM-DD'))
          })
        }

        ordersWithoutReminder.sort((a: IProductionOrder, b: IProductionOrder) => {
          // Extract patient names from orders
          const nameA = `${a.patient.first_name} ${a.patient.last_name}`.toLowerCase()
          const nameB = `${b.patient.first_name} ${b.patient.last_name}`.toLowerCase()
          // Compare patient names alphabetically
          if (nameA < nameB) {
            return -1
          }
          if (nameA > nameB) {
            return 1
          }
          return 0
        })

        // Concatenate sorted orders with reminders and orders without reminders
        filteredOrders = ordersWithoutReminder.concat(ordersWithReminder)
      }

      //Start date :
      if (filteredOrders && startDateSort === sortOrderConstants.NEWEST_TO_OLDEST) {
        filteredOrders.sort((a, b) => {
          const alignerB = b.aligners_with_status
            ? (b.aligners_with_status[status]?.start_date ?? '')
            : ''

          const alignerA = a.aligners_with_status
            ? (a.aligners_with_status[status]?.start_date ?? '')
            : ''

          return moment(alignerB, 'YYYY-MM-DD').diff(moment(alignerA, 'YYYY-MM-DD'))
        })
      } else if (filteredOrders && startDateSort === sortOrderConstants.OLDEST_TO_NEWEST) {
        filteredOrders.sort((a, b) => {
          const alignerB = b.aligners_with_status
            ? (b.aligners_with_status[status]?.start_date ?? '')
            : ''

          const alignerA = a.aligners_with_status
            ? (a.aligners_with_status[status]?.start_date ?? '')
            : ''

          return moment(alignerA, 'YYYY-MM-DD').diff(moment(alignerB, 'YYYY-MM-DD'))
        })
      }
      //Current aligner due date :

      if (filteredOrders && dueDateSort === sortOrderConstants.NEWEST_TO_OLDEST) {
        filteredOrders.sort((a, b) =>
          moment(getCurrentAligner(b.aligner_journey)?.end_date, 'YYYY-MM-DD').diff(
            moment(getCurrentAligner(a.aligner_journey)?.end_date, 'YYYY-MM-DD')
          )
        )
      } else if (filteredOrders && dueDateSort === sortOrderConstants.OLDEST_TO_NEWEST) {
        filteredOrders.sort((a, b) =>
          moment(getCurrentAligner(a.aligner_journey)?.end_date, 'YYYY-MM-DD').diff(
            moment(getCurrentAligner(b.aligner_journey)?.end_date, 'YYYY-MM-DD')
          )
        )
      }

      state.filteredOrders = filteredOrders || null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(postApiDataProductionSlice.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(postApiDataProductionSlice.fulfilled, (state, action) => {
        state.loading = false
        state.productionOrders = action.payload
        state.filteredOrders = action.payload.orders
      })
      .addCase(postApiDataProductionSlice.rejected, (state, action) => {
        state.loading = false
        state.error = typeof action.payload === 'string' ? action.payload : 'An error occurred'
      })
  },
})

export const {applyFilterSort} = productionSlice.actions
export default productionSlice.reducer
