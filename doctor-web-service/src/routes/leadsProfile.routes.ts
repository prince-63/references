import generateRoutePaths from '@utils/generateRoutePaths'
import leadsProfileRoutesPaths from '../@staticData/leadsProfile.paths'
import routeConstants from '@constants/leadsProfile.routeConstants'
import Files from 'screens/Patients/LeadsProfile/main/files/Files'
import AddCaseInformation from 'screens/Patients/LeadsProfile/main/caseInformation/AddCaseInformation'
import ViewCaseInformation from 'screens/Patients/LeadsProfile/main/caseInformation/ViewCaseInformation'
import TableContainerForFiles from 'screens/Patients/LeadsProfile/main/files/components/TableContainerForFiles'
import AddingTracking from 'screens/Patients/LeadsProfile/main/treatment/Tracking/AddingTracking'
import ReviewTrackingDetails from 'screens/Patients/LeadsProfile/main/treatment/Tracking/ReviewTrackingDetails'
import ViewTracking from 'screens/Patients/LeadsProfile/main/treatment/Tracking/ViewTracking'
import SetupTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/setUpTreatmentPlan/SetupTreatmentPlan'
import ViewTreatmentPlan from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlan/ViewTreatmentPlan'
import AlignersTracking from 'screens/Patients/LeadsProfile/main/alignersTracking/AlignersTracking'
import LeadsOrPatientOverview from 'screens/Patients/LeadsProfile/main/overview/LeadsOrPatientOverview'
import ViewAlignerChanges from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/ViewAlignerChanges'
import WearStats from 'screens/Patients/PatientProfile/Tabs/WearStats'
import Appointments from 'screens/Patients/LeadsProfile/main/appointments/Appointments'
import AddAppointment from 'screens/Patients/LeadsProfile/main/appointments/AddAppointment'
import ViewAppointment from 'screens/Patients/LeadsProfile/main/appointments/ViewAppointment'
import SetupTreatmentPlanBraces from 'screens/Patients/LeadsProfile/main/treatment/setupTreatmentPlanBraces/SetupTreatmentPlanBraces'
import ViewTreatmentPlanBraces from 'screens/Patients/LeadsProfile/main/treatment/viewTreatmentPlanBraces/ViewTreatmentPlanBraces'
import Timeline from 'screens/Patients/LeadsProfile/main/Timeline/Timeline'
import AlignerChangeDetails from 'screens/Patients/LeadsProfile/main/viewAlignerChanges/AlignerChangeDetails'
import Payments from 'screens/Patients/LeadsProfile/main/payments/Payments'
import PaymentReminders from 'screens/Patients/LeadsProfile/main/payments/PaymentReminders'
import patientAppointmentFilterRouteConstants from '@constants/patient.appointmentFilter.route.constants'
import AllAppointments from 'screens/Patients/LeadsProfile/main/appointments/AllAppointments'
import PastAppointments from 'screens/Patients/LeadsProfile/main/appointments/PastAppointments'
import UpcomingAppointments from 'screens/Patients/LeadsProfile/main/appointments/UpcomingAppointments'
import BracesNotesPage from 'screens/Patients/LeadsProfile/main/bracesNotes/BracesNotesPage'
import TreatmentPlansList from 'screens/Patients/LeadsProfile/main/treatment/clearAligners/TreatmentPlansList'
import OrdersPatientPage from 'screens/Patients/LeadsProfile/main/orders/OrdersPatientPage'
import TreatmentStartedIntro from 'screens/Patients/LeadsProfile/main/overview/components/TreatmentStartedIntro'
import ProductionBatchDetails from 'screens/PatientDetailsOverview.tsx/pages/ProductionBatchDetails'

const componentLookUp = {
  [routeConstants.OVERVIEW]: LeadsOrPatientOverview,
  [routeConstants.ORDERS]: OrdersPatientPage,
  [routeConstants.APPOINTMENTS]: Appointments,
  [patientAppointmentFilterRouteConstants.ALL]: AllAppointments,
  [patientAppointmentFilterRouteConstants.UPCOMING]: UpcomingAppointments,
  [patientAppointmentFilterRouteConstants.PAST]: PastAppointments,
  [routeConstants.ADD_APPOINTMENT]: AddAppointment,
  [routeConstants.BRACES_NOTES]: BracesNotesPage,
  [routeConstants.VIEW_APPOINTMENT]: ViewAppointment,
  [routeConstants.FILES]: Files,
  [routeConstants.SETUP_TREATMENT_PLAN]: SetupTreatmentPlan,
  [routeConstants.VIEW_TREATMENT_PLAN]: ViewTreatmentPlan,
  [routeConstants.VIEW_CASE_INFORMATION]: ViewCaseInformation,
  [routeConstants.ADD_CASE_INFORMATION]: AddCaseInformation,
  [routeConstants.FILES_SUMMARY]: TableContainerForFiles,
  [routeConstants.ADD_TRACKING]: AddingTracking,
  [routeConstants.VIEW_TRACKING]: ViewTracking,
  [routeConstants.REVIEW_TRACKING_DETAILS]: ReviewTrackingDetails,
  [routeConstants.CLEAR_ALIGNERS]: TreatmentPlansList,
  [routeConstants.ALIGNERS_TRACKING]: AlignersTracking,
  [routeConstants.VIEW_ALIGNER_CHANGES]: ViewAlignerChanges,
  [routeConstants.ALIGNER_CHANGE_DETAILS]: AlignerChangeDetails,
  [routeConstants.WEAR_STATS]: WearStats,
  [routeConstants.SETUP_TREATMENT_PLAN_BRACES]: SetupTreatmentPlanBraces,
  [routeConstants.VIEW_TREATMENT_PLAN_BRACES]: ViewTreatmentPlanBraces,
  [routeConstants.TIMELINE]: Timeline,
  [routeConstants.PAYMENTS]: Payments,
  [routeConstants.PAYMENT_REMINDERS]: PaymentReminders,
  [routeConstants.TREATMENT_STARTED_INTRO]: TreatmentStartedIntro,
  [routeConstants.PRODUCTION_BATCH_DETAILS]: ProductionBatchDetails,
}

export default generateRoutePaths(leadsProfileRoutesPaths, componentLookUp)
