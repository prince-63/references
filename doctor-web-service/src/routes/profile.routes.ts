import generateRoutePaths from '@utils/generateRoutePaths'
import profileRouteConstants from '@constants/profile.routeConstants'
import MyTasks from 'screens/PatientDetailsOverview.tsx/tabs/MyTasks'
import {PatientDetails} from 'screens/PatientDetailsOverview.tsx/tabs/PatientDetails'
import {CaseFiles} from 'screens/PatientDetailsOverview.tsx/tabs/CaseFiles'
import {Prescriptions} from 'screens/PatientDetailsOverview.tsx/tabs/Prescriptions'
import patientProfilePaths from '@staticData/patientProfile.paths'
import Details from 'screens/PatientDetailsOverview.tsx/tabs/Details'
import ActivityLog from 'screens/PatientDetailsOverview.tsx/tabs/ActivityLog'
import Comments from 'screens/PatientDetailsOverview.tsx/tabs/Comments'
import AuditLogs from 'screens/PatientDetailsOverview.tsx/tabs/AuditLogs'
import {Notes} from 'screens/PatientDetailsOverview.tsx/tabs/Notes'
import {Chat} from 'screens/PatientDetailsOverview.tsx/tabs/Chat'
import PlansList from 'screens/PatientDetailsOverview.tsx/tabs/PlansList'
import Production from 'screens/PatientDetailsOverview.tsx/tabs/Production'
import Tracking from 'screens/PatientDetailsOverview.tsx/tabs/Tracking'
import ViewTreatmentPlan from 'screens/PatientDetailsOverview.tsx/components/ViewTreatmentPlan'
import TreatmentStartedIntro from 'screens/Patients/LeadsProfile/main/overview/components/TreatmentStartedIntro'
import WearStats from 'screens/Patients/PatientProfile/Tabs/WearStats'
import Files from 'screens/Patients/LeadsProfile/main/files/Files'
import TableContainerForFiles from 'screens/Patients/LeadsProfile/main/files/components/TableContainerForFiles'
import ProductionBatchDetails from 'screens/PatientDetailsOverview.tsx/pages/ProductionBatchDetails'
import PrescriptionEditorPage from 'screens/PatientDetailsOverview.tsx/pages/PrescriptionEditorPage'
import {Orders} from 'screens/PatientDetailsOverview.tsx/tabs/Orders'
import StarterPlanOverview from 'screens/PatientDetailsOverview.tsx/tabs/StarterPlanOverview'

import BracesNotesPage from 'screens/Patients/LeadsProfile/main/bracesNotes/BracesNotesPage'

import AddAppointment from 'screens/Patients/LeadsProfile/main/appointments/AddAppointment'
import ViewAppointment from 'screens/Patients/LeadsProfile/main/appointments/ViewAppointment'
import Payments from 'screens/Patients/LeadsProfile/main/payments/Payments'
import PaymentReminders from 'screens/Patients/LeadsProfile/main/payments/PaymentReminders'

const componentLookUp = {
  [profileRouteConstants.TASK]: MyTasks,
  [profileRouteConstants.OVERVIEW]: StarterPlanOverview,
  [profileRouteConstants.DETAILS]: Details,
  [profileRouteConstants.ORDERS]: Orders,
  [profileRouteConstants.APPOINTMENTS]: BracesNotesPage,
  [profileRouteConstants.ADD_APPOINTMENT]: AddAppointment,
  [profileRouteConstants.VIEW_APPOINTMENT]: ViewAppointment,
  [profileRouteConstants.ACTIVITY_LOGS]: ActivityLog,
  [profileRouteConstants.PLANS]: PlansList,
  [profileRouteConstants.PRODUCTION]: Production,
  [profileRouteConstants.PRODUCTION_BATCH_DETAILS]: ProductionBatchDetails,
  [profileRouteConstants.TRACKING]: Tracking,
  [profileRouteConstants.VIEW_TREATMENT_PLAN]: ViewTreatmentPlan,
  [profileRouteConstants.CASE_FILES]: CaseFiles,
  [profileRouteConstants.PRESCRIPTIONS]: Prescriptions,
  [profileRouteConstants.PRESCRIPTION_NEW]: PrescriptionEditorPage,
  [profileRouteConstants.PRESCRIPTION_EDIT]: PrescriptionEditorPage,
  [profileRouteConstants.PATIENT_DETAILS]: PatientDetails,
  [profileRouteConstants.NOTES]: Notes,
  [profileRouteConstants.COMMENTS]: Comments,
  [profileRouteConstants.AUDIT_LOGS]: AuditLogs,
  [profileRouteConstants.CHAT]: Chat,
  [profileRouteConstants.TREATMENT_STARTED_INTRO]: TreatmentStartedIntro,
  [profileRouteConstants.WEAR_STATS]: WearStats,
  [profileRouteConstants.FILES]: Files,
  [profileRouteConstants.PAYMENT]: Payments,
  [profileRouteConstants.PAYMENT_REMINDERS]: PaymentReminders,
  [profileRouteConstants.FILES_SUMMARY]: TableContainerForFiles,
}

export default generateRoutePaths(patientProfilePaths, componentLookUp)
