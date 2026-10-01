import {createSlice} from '@reduxjs/toolkit'

const initialState = {
  isDCINumAndDCNameSkip: false,
  isClinicDetailsSkip: false,
  isAddPatientsSkip: false,
  dciRegisterNumber: '',
  dentalCouncilNumber: '',
  isSocialLoggedInLoader: false,
}

export const appStackStateSlice = createSlice({
  name: 'appStackState',
  initialState,
  reducers: {
    setIsDCINumAndDCNameSkip: (state, action) => {
      state.isDCINumAndDCNameSkip = action.payload.isDCINumAndDCNameSkip
    },
    setIsClinicDetailsSkip: (state, action) => {
      state.isClinicDetailsSkip = action.payload.isClinicDetailsSkip
    },
    setIsAddPatientsSkip: (state, action) => {
      state.isAddPatientsSkip = action.payload.isAddPatientsSkip
    },

    setDCIRegisterNumber: (state, action) => {
      state.dciRegisterNumber = action.payload.dciRegisterNumber
    },
    setDentalCouncilNumber: (state, action) => {
      state.dentalCouncilNumber = action.payload.dentalCouncilNumber
    },
    setIsSocialLoggedInLoader: (state, action) => {
      state.isSocialLoggedInLoader = action.payload.isSocialLoggedInLoader
    },
  },
})

export const {
  setIsDCINumAndDCNameSkip,
  setIsClinicDetailsSkip,
  setIsAddPatientsSkip,
  setDCIRegisterNumber,
  setDentalCouncilNumber,
  setIsSocialLoggedInLoader,
} = appStackStateSlice.actions

export const selectIsDCINumAndDCNameSkip = (state: any) =>
  state.appStackState?.isDCINumAndDCNameSkip
export const selectIsClinicDetailsSkip = (state: any) => state.appStackState?.isClinicDetailsSkip
export const selectIsAddPatientsSkip = (state: any) => state.appStackState?.isAddPatientsSkip
export const selectIsSocialLoggedInLoader = (state: any) =>
  state.appStackState?.isSocialLoggedInLoader

export default appStackStateSlice.reducer
