import {Action, combineReducers, configureStore} from '@reduxjs/toolkit'
import {persistReducer, persistStore} from 'redux-persist'
import thunk, {ThunkAction} from 'redux-thunk'
import safePersistStorage from './safePersistStorage'

import appStackStateReducer from './Slices/AppSlices/appStackStateSlice'
import apiReducer from './Slices/apiSlice'
import apiLoginReducer from './Slices/AuthSlice/loginSlice'
import apiRegistrationStepOneSlice from './Slices/AuthSlice/registrationStepOneSlice'
import apiGoogleStepTwoSlice from './Slices/AuthSlice/googleStepTwoSlice'
import apiLoginGoogleReducer from './Slices/AuthSlice/loginGoogleSlice'
import apiGoogleStepOneReducer from './Slices/AuthSlice/googleStepOneSlice'
import inviteDetailsSlice from './Slices/AuthSlice/getInvitedDetails.slice'
import emailOtpSentSlice from './Slices/AuthSlice/emailOtpSentSlice'

import apiAppleStepTwoSlice from './Slices/AuthSlice/appleStepTwoSlice'
import apiLoginAppleReducer from './Slices/AuthSlice/loginAppleSlice'
import apiAppleStepOneReducer from './Slices/AuthSlice/appleStepOneSlice'

import apiForgetPasswordOtpSentSlice from './Slices/AuthSlice/forgetPasswordOtpSentSlice'
import apiForgetPasswordOtpVerifySlice from './Slices/AuthSlice/forgetPasswordOtpVerifySlice'
import apiForgetPasswordResetSlice from './Slices/AuthSlice/forgetPasswordResetSlice'
import apiSignupLoginReducer from './Slices/AuthSlice/signupLoginSlice'
import apiCountrySliceReducer from './Slices/AppSlice/Location/CountrySlice'
import apiStateSliceReducer from './Slices/AppSlice/Location/StateSlice'
import apiCitySliceReducer from './Slices/AppSlice/Location/CitySlice'
import apiCountryCodesReducer from './Slices/AuthSlice/countryCodesSlice'
import apiListPracticeLocationReducer from './Slices/AppSlice/PracticeLocation/listPracticeLocationSlice'
import apiListActivePracticeLocationReducer from './Slices/AppSlice/PracticeLocation/listActivePracticeLocationSlice'
import apiMainEditPracticeLocationReducer from './Slices/AppSlice/PracticeLocation/editPracticeLocationSlice'
import apiMainAddPracticeLocationReducer from './Slices/AppSlice//PracticeLocation/addPracticeLocationSlice'
import apiChangePracticeLocationStatusReducer from './Slices/AppSlice//PracticeLocation/changePracticeLocationStatusSlice'
import apiNewTreatmentReducer from './Slices/AppSlice/SetupTreatment/newTreatmentSlice'
import apiProductionListReducer from './Slices/AppSlice/SetupTreatment/productionListSlice'
import apiChangeDashboardCountsReducer from './Slices/AppSlice/Dashboard/DashboardCountsSlice'
import apiTimelineDeactivateReducer from './Slices/AppSlice/Dashboard/TimelineDeactivateSlice'
import apiTimelineDeactivateEventsListReducer from './Slices/AppSlice/Dashboard/TimelineDeactivateEventsListSlice'
import apiPatientNudgeSliceReducer from './Slices/AppSlice/Dashboard/PatientNudgeSlice'
import apiPatientProfileSlice from './Slices/AppSlice/PatientProfile/ProfileView/patientProfileSlice'
import apiAddPatientSlice from './Slices/AppSlice/InvitePatient/AddPatient'
import apiAddAndSendInviteSlice from './Slices/AppSlice/InvitePatient/AddAndSendInvite'
import apiDoctorAllBrandListSlice from './Slices/AppSlice/DoctorProfile/DoctorAllBrandList'
import apiDoctorProfileGetSlice from './Slices/AppSlice/DoctorProfile/DoctorProfileGetSlice'
import apiTreatmentPlanSlice from './Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlan'
import TreatmentListAll from './Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentListAll'
import TreatmentDeactivateSlice from './Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentDeactivateSlice'
import apiProductionLogSlice from './Slices/AppSlice/PatientProfile/TreatmentPlan/ProductionLogSlice'
import apiNewChatAddSlice from './Slices/AppSlice/Chat/NewChatAddSlice'
import apiChatListSlice from './Slices/AppSlice/Chat/ChatListSlice'
import apiChatSendSlice from './Slices/AppSlice/Chat/ChatSendSlice'
import apiChatSeenSlice from './Slices/AppSlice/Chat/ChatSeenSlice'
import apiMessageListSlice from './Slices/AppSlice/Chat/MessageListSlice'
import apiChatEventSlice from './Slices/AppSlice/Chat/ChatEventSlice'
import labChatSlice from './Slices/AppSlice/LabChat/LabChat.slice'
import apiTreatmentPlanEditAlignersDetailsReducer from './Slices/AppSlice/PatientProfile/TreatmentPlan/TreatmentPlanEditAlignersDetailsSlice'
import apiEditSingleAlignerDetailReducer from './Slices/AppSlice/PatientProfile/TreatmentPlan/EditSingleAlignerDetailsSlice'
import AlignerWiseWearStatsSlice from './Slices/AppSlice/PatientProfile/WearStats/AlignerWiseWearStatsSlice'
import AllAlignerWearStatsSlice from './Slices/AppSlice/PatientProfile/WearStats/AllAlignerWearStatsSlice'
import AllTimelineSlice from './Slices/AppSlice/PatientProfile/Timeline/AllTimelineSlice'
import DashboardUpdatesSlice from './Slices/AppSlice/Dashboard/DashboardUpdatesSlice'
import AddCustomBrandNameReducer from './Slices/AppSlice/PatientsList/AddCustomBrandNameSlice'
import StatusProductionLabUpdateSlice from './Slices/AppSlice/PatientProfile/TreatmentPlan/StatusProductionLabUpdateSlice'
import productionSlice from './Slices/AppSlice/production/production.slice'
import activityCommentLogsReducer from './Slices/AppSlice/ActivityCommentLogs/ActivityCommentLogs.slice'
import apiAddReminderReducer from './Slices/AppSlice/production/reminder/AddReminder.slice'
import apiUpdateReminderReducer from './Slices/AppSlice/production/reminder/UpdateReminder.slice'
import apiDeleteReminderReducer from './Slices/AppSlice/production/reminder/DeleteReminder.slice'
import noteAddSliceReducer from './Slices/AppSlice/production/notes/CreateNote.slice'
import noteUpdateSliceReducer from './Slices/AppSlice/production/notes/UpdateNote.slice'
import noteDeleteSliceReducer from './Slices/AppSlice/production/notes/DeleteNote.slice'
import filterAndSortReducer from './Slices/AppSlice/production/filterAndSort.slice'
import LeadsProfileSlice from './Slices/AppSlice/LeadsProfile/LeadsProfile.slice'
import LeadsProfileDetails from './Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import LeadsProfileFilesSlice from './Slices/AppSlice/LeadsProfile/LeadsProfileFiles.slice'
import LeadsProfileTreatmentPlan from './Slices/AppSlice/LeadsProfile/LeadsProfileTreatmentPlan.slice'
import leadsListFilterOptionReducer from './Slices/AppSlice/LeadsProfile/LeadsListFilterOption'
import leadAddTreatmentListReducer from './Slices/AppSlice/LeadsProfile/LeadAddTreatment'
import leadAddTreatmentListReducers from './Slices/AppSlice/LeadsProfile/LeadAddTreatment'
import leadsOverviewSliceReducer from './Slices/AppSlice/LeadsProfile/Overview/Overview.slice'
import leadsProfileDetailsSliceReducer from './Slices/AppSlice/LeadsProfile/LeadsProfileDetails.slice'
import leadsProfileDetailsUpdateSlice from './Slices/AppSlice/LeadsProfile/LeadsProfileUpdateDetails.slice'
import trackingSlice from './Slices/AppSlice/LeadsProfile/Tracking.slice'
import mobileSidebarReducer from './Slices/AppSlice/Dashboard/MobileSidebarSlice'
import AlignerTrackingSlice from './Slices/AppSlice/LeadsProfile/AlignerTracking.slice'
import GlobalSearchSlice from './Slices/AppSlice/Sidebar/GlobalSearch.slice'
import DoctorDashboardSlice from './Slices/AppSlice/DoctorDashboard/DoctorDashboardSlice'
import BracesNotesSlice from './Slices/AppSlice/BracesNotes/BracesNotes.slice'
import subscriptionSlice from './Slices/AppSlice/subscription/subscription.slice'
import PaymentsSlice from './Slices/AppSlice/Payments/Payments.slice'
import calendarSlice from './Slices/AppSlice/Calendar/calendar.slice'
import SummarySlice from './Slices/AppSlice/Summary/summary'
import AppointmentsSlice from './Slices/AppSlice/Appointment/Appointments.slice'
import billingsAndPaymentsSlice from './Slices/AppSlice/billingsAndPayments/billingsAndPayments.slice'
import settingsSlice from './Slices/AppSlice/settings/settings.slice'
import serviceConfigurationReducer from './Slices/AppSlice/ServiceConfiguration/ServiceConfiguration.slice'
import practicesSlice from './Slices/AppSlice/Practices/practices.slice'
import labsSlice from './Slices/AppSlice/Labs/labs.slice'
import customersSlice from './Slices/AppSlice/Customers/customers.slice'
import OrdersSlice from './Slices/AppSlice/orders/orders.slice'
import patientsList from './Slices/AppSlice/PatientsList/patientsList.slice'
import UserSlice from './Slices/AppSlice/users/users.slice'
import rewardsSlice from './Slices/AppSlice/rewards/rewards.slice'
import AlignerPatientAnalyticsSlice from './Slices/AppSlice/AlignerPatientAnalytics/AlignerPatientAnalytics.slice'
import LeadFilesSlice from './Slices/AppSlice/LeadsProfile/LeadsFiles.Slice'
import GettingStartedOverviewSlice from './Slices/AppSlice/LeadsProfile/GettingStartedOverview/GettingStartedOverview.slice'
import CaseRecordSlice from './Slices/AppSlice/CaseRecords/CaseRecords.slice'
import caseTeamSlice from './Slices/AppSlice/CaseTeam/caseTeam.slice'
import existingCaseSlice from './Slices/AppSlice/ExistingCase/ExistingCase.slice'
import AccessControlsSlice from './Slices/AppSlice/accessControl/AccessControl.slice'
import uiServicesReducer from './Slices/UISlices/services.slice'
import workflowSlice from './Slices/AppSlice/workflow/workflow.slice'
import kanbanSlice from './Slices/AppSlice/Kanban/Kanban.slice'
import profileSlice from './Slices/AppSlice/Profile/Profile.slice'
import prescriptionSlice from './Slices/AppSlice/Prescription/Prescription.slice'
import ProductionSlice from './Slices/AppSlice/ProductionSetup/Production.slice'
import AlignerProductionSlice from './Slices/AppSlice/AlignerProduction/AlignerProduction.slice'
import StarterPlanUserAddPatientStepper from './Slices/AppSlice/StarterPlanUserAddPatientStepper/StarterPlanUserAddPatientStepper.slice'
import CustomerPatientProfileSlice from './Slices/AppSlice/CustomerPatientProfile/CustomerPatientProfile.slice'
import vspOrdersReducer from './Slices/AppSlice/VSP/orders.slice'
import vspCaseRecordReducer from './Slices/AppSlice/VSP/caserecord.slice'
import vspPrescriptionReducer from './Slices/AppSlice/VSP/prescriptions.slice'

const rootReducer = combineReducers({
  appStackState: appStackStateReducer,
  api: apiReducer,
  apiRegistrationStepOne: apiRegistrationStepOneSlice,

  apiGoogleStepTwo: apiGoogleStepTwoSlice,
  apiGoogleLogin: apiLoginGoogleReducer,
  apiGoogleStepOne: apiGoogleStepOneReducer,

  apiAppleStepTwo: apiAppleStepTwoSlice,
  apiAppleLogin: apiLoginAppleReducer,
  apiAppleStepOneReducer: apiAppleStepOneReducer,
  apiPrescription: prescriptionSlice,

  apiLogin: apiLoginReducer,
  apiForgetPasswordOtpSent: apiForgetPasswordOtpSentSlice,
  apiForgetPasswordOtpVerify: apiForgetPasswordOtpVerifySlice,
  apiForgetPasswordReset: apiForgetPasswordResetSlice,
  apiSignupLogin: apiSignupLoginReducer,
  apiCountry: apiCountrySliceReducer,
  apiState: apiStateSliceReducer,
  apiCity: apiCitySliceReducer,
  apiCountryCodes: apiCountryCodesReducer,
  apiListPracticeLocation: apiListPracticeLocationReducer,
  apiMainAddPracticeLocation: apiMainAddPracticeLocationReducer,
  apiMainEditPracticeLocation: apiMainEditPracticeLocationReducer,
  apiListActivePracticeLocation: apiListActivePracticeLocationReducer,
  apiChangePracticeLocationStatus: apiChangePracticeLocationStatusReducer,
  apiNewTreatment: apiNewTreatmentReducer,
  apiProductionList: apiProductionListReducer,
  apiDashboardCounts: apiChangeDashboardCountsReducer,
  apiPatientNudgeSlice: apiPatientNudgeSliceReducer,
  PoorCompilancePatients: apiPatientNudgeSliceReducer,
  apiPatientProfile: apiPatientProfileSlice,
  apiAddPatient: apiAddPatientSlice,
  apiAddAndSendInvite: apiAddAndSendInviteSlice,
  apiDoctorAllBrandList: apiDoctorAllBrandListSlice,
  apiDoctorProfileGet: apiDoctorProfileGetSlice,
  apiTreatmentPlan: apiTreatmentPlanSlice,
  apiTreatmentListAll: TreatmentListAll,
  apiTreatmentDeactivate: TreatmentDeactivateSlice,
  apiNewChatAdd: apiNewChatAddSlice,
  apiChatList: apiChatListSlice,
  apiChatSend: apiChatSendSlice,
  apiChatSeen: apiChatSeenSlice,
  apiChatEvent: apiChatEventSlice,
  apiMessageList: apiMessageListSlice,
  labChat: labChatSlice,
  apiTreatmentPlanEditAlignersDetails: apiTreatmentPlanEditAlignersDetailsReducer,
  apiAlignerWiseWearStats: AlignerWiseWearStatsSlice,
  apiAllAlignerWearStats: AllAlignerWearStatsSlice,
  apiAllTimeline: AllTimelineSlice,
  apiDashboardUpdates: DashboardUpdatesSlice,
  apiAddCustomBrandName: AddCustomBrandNameReducer,
  apiTimelineDeactivate: apiTimelineDeactivateReducer,
  apiTimelineDeactivateEventsList: apiTimelineDeactivateEventsListReducer,
  apiProductionLog: apiProductionLogSlice,
  apiEditSingleAlignerDetail: apiEditSingleAlignerDetailReducer,
  apiStatusProductionLabUpdate: StatusProductionLabUpdateSlice,
  production: productionSlice,
  apiReminderAdd: apiAddReminderReducer,
  apiReminderUpdate: apiUpdateReminderReducer,
  apiReminderDelete: apiDeleteReminderReducer,
  apiNoteAdd: noteAddSliceReducer,
  apiNoteUpdate: noteUpdateSliceReducer,
  apiNoteDelete: noteDeleteSliceReducer,
  productionFilterAndSort: filterAndSortReducer,
  leadsProfile: LeadsProfileSlice,
  leadsProfileDetails: LeadsProfileDetails,
  leadsProfileFiles: LeadsProfileFilesSlice,
  leadFiles: LeadFilesSlice,

  mobileSidebar: mobileSidebarReducer,
  leadsProfileTreatmentPlanReducer: LeadsProfileTreatmentPlan,
  leadsListFilterOption: leadsListFilterOptionReducer,
  LeadAddTreatment: leadAddTreatmentListReducer,
  apiGetLeadsOverview: leadsOverviewSliceReducer,
  apiGetLeadsProfileDetails: leadsProfileDetailsSliceReducer,
  apiUpdateLeadsProfileDetails: leadsProfileDetailsUpdateSlice,
  alignerTracking: AlignerTrackingSlice,
  tracking: trackingSlice,
  globalSearch: GlobalSearchSlice,
  DoctorDashboard: DoctorDashboardSlice,
  bracesNotes: BracesNotesSlice,
  subscription: subscriptionSlice,
  payments: PaymentsSlice,
  calendar: calendarSlice,
  Summary: SummarySlice,
  appointments: AppointmentsSlice,
  leadsTreatmentList: leadAddTreatmentListReducers,
  billingsAndPayments: billingsAndPaymentsSlice,
  inviteDetails: inviteDetailsSlice,
  settings: settingsSlice,
  serviceConfiguration: serviceConfigurationReducer,
  practices: practicesSlice,
  orders: OrdersSlice,
  customers: customersSlice,
  patientsList: patientsList,
  Users: UserSlice,
  labs: labsSlice,
  AlignerPatientAnalytics: AlignerPatientAnalyticsSlice,
  vspOrders: vspOrdersReducer,
  vspCaseRecord: vspCaseRecordReducer,
  vspPrescription: vspPrescriptionReducer,
  emailOtpSent: emailOtpSentSlice,
  GettingStartedOverview: GettingStartedOverviewSlice,
  caseRecord: CaseRecordSlice,
  caseTeam: caseTeamSlice,
  existingCase: existingCaseSlice,
  accessControl: AccessControlsSlice.reducer,
  uiServices: uiServicesReducer,
  workFlow: workflowSlice,
  kanban: kanbanSlice,
  profile: profileSlice,
  productionSetup: ProductionSlice,
  alignerProduction: AlignerProductionSlice,
  activityCommentLogs: activityCommentLogsReducer,
  starterPlanPatientAddStepper: StarterPlanUserAddPatientStepper,
  rewards: rewardsSlice,
  customerPatientProfile: CustomerPatientProfileSlice,
})

const persistConfig = {
  key: 'root',
  storage: safePersistStorage,
  whitelist: ['appStackState'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: [thunk],
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof rootReducer>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
