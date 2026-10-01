import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'
import {Product} from 'screens/Kanban/screens/ProductionSetup/SelectTaskManufacturingType'
import {ITreatmentPlan} from 'screens/Patients/LeadsProfile/main/treatment/types/treatmentPlan.types'

export interface OrderPayload {
  order_details: {
    lab_id: number
    lab_organization_id: number
    lab_doctor_id: number
    order_type: 'ALIGNER_ORDER'
    due_by: null
    delivery_preference: 'IN_BATCHES'
    target_user_details: {
      profile_id: number | null
      organization_id: number | null
      doctor_id: number | null
    }
  }
  status: 'ORDERED'
  doctor_id: string | number
  current_step: number
  organization_id: string | number
  profile_id: string | number
  service_products: Product
  case_type: 'OUTSOURCED_PLANNING_ORDER'
  practice_doctor_id?: number | null
  practice_profile_id?: number | null
  practice_organization_id?: number | null
  prescription_details: null
  shipping_details: null
}

const existingCaseSlice = createSlice({
  name: 'Existing Case',
  initialState: {
    currentStep: 0,
    patientId: undefined as number | undefined,
    openAssignPracticeModal: false,
    openStartTreatmentPlanModal: false,
    savePatientData: {} as any,
    saveOrderData: {} as OrderPayload,
    saveTreatmentData: {} as ITreatmentPlan,
    saveManufacturingData: {} as any,
    saveTrackingData: {} as any,

    manufacturingToStage: null as number | null,
    manufacturingFromStage: null as number | null,
    productSelected: null as Product | null,
  },
  reducers: {
    nextStep: (state) => {
      state.currentStep += 1
    },
    prevStep: (state) => {
      if (state.currentStep > 0) {
        state.currentStep -= 1
      }
    },
    setExistingCasePatientId: (state, action: PayloadAction<{patient_id: number}>) => {
      state.patientId = action.payload.patient_id
    },
    setOpenAssignPracticeModal: (state, action: PayloadAction<boolean>) => {
      state.openAssignPracticeModal = action.payload
    },
    setOpenStartTreatmentPlanModal: (state, action: PayloadAction<boolean>) => {
      state.openStartTreatmentPlanModal = action.payload
    },

    resetStep: (state) => {
      state.currentStep = 0
      state.savePatientData = {} as any
      state.saveOrderData = {} as OrderPayload
      state.saveTreatmentData = {} as ITreatmentPlan
      state.saveManufacturingData = {} as any
      state.saveTrackingData = {} as any
      state.manufacturingFromStage = null
      state.manufacturingToStage = null
      state.productSelected = null
    },
    setSavePatientData: (state, action: PayloadAction<any>) => {
      state.savePatientData = action.payload
    },
    setSaveOrderData: (state, action: PayloadAction<OrderPayload>) => {
      state.saveOrderData = action.payload
    },
    setSaveManufacturingData: (state, action: PayloadAction<any>) => {
      state.saveManufacturingData = action.payload
    },
    setSaveTreatmentData: (state, action) => {
      state.saveTreatmentData = action.payload
    },
    setSaveTrackingData: (state, action: PayloadAction<any>) => {
      state.saveTrackingData = action.payload
    },
    setManufacturingToStage: (state, action: PayloadAction<number | null>) => {
      state.manufacturingToStage = action.payload
    },
    setManufacturingFromStage: (state, action: PayloadAction<number | null>) => {
      state.manufacturingFromStage = action.payload
    },
    setProductSelected: (state, action: PayloadAction<Product | null>) => {
      state.productSelected = action.payload
    },
  },
})

export const {
  nextStep,
  prevStep,
  setExistingCasePatientId,
  setOpenAssignPracticeModal,
  setOpenStartTreatmentPlanModal,
  resetStep,
  setSavePatientData,
  setSaveOrderData,
  setSaveTreatmentData,
  setSaveManufacturingData,
  setSaveTrackingData,
  setManufacturingToStage,
  setManufacturingFromStage,
  setProductSelected,
} = existingCaseSlice.actions

export default existingCaseSlice.reducer
