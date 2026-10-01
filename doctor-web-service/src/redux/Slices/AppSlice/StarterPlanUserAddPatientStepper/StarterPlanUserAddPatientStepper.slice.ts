import {createSlice} from '@reduxjs/toolkit'

const StarterPlanUserAddPatientStepper = createSlice({
  name: 'Starter Plan add patient',
  initialState: {
    currentStep: 0,
  },
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload
    },
    nextStep: (state) => {
      state.currentStep += 1
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1
      }
    },

    resetStep: (state) => {
      state.currentStep = 0
    },
  },
})

export const {nextStep, prevStep, resetStep, setCurrentStep} =
  StarterPlanUserAddPatientStepper.actions

export default StarterPlanUserAddPatientStepper.reducer
