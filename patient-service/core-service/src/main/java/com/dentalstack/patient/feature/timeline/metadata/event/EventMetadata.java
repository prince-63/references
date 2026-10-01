package com.dentalstack.patient.feature.timeline.metadata.event;

import com.dentalstack.patient.feature.timeline.metadata.RefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.timeline.metadata.TreatmentPausedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.calendar.CalendarEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.doctorinvitation.DoctorInvitationAcceptedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.doctorinvitation.DoctorInvitationReceivedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.doctorinvitation.DoctorInvitationRejectedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PatientAddedByPracticeEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PatientAssignedToPracticeEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.erp.PracticeConnectedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.laborder.*;
import com.dentalstack.patient.feature.timeline.metadata.event.manufacturing.ManufacturingCompletedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.manufacturing.ManufacturingDeliveredEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.manufacturing.ManufacturingInTransitEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.manufacturing.ManufacturingStartedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.CommentAddedOnOrderEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.NewOrderAddedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.OrderCancelledEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.order.OrderOnHoldEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.planningcustomer.*;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.ReplanTreamentEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.TreatmentPlanFinalisedEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.treatement.TreatmentPlanSentForApprovalByOrgEventMetadata;
import com.dentalstack.patient.feature.timeline.metadata.event.vsp.*;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = AddedPatientEventMetadata.class, name = "PATIENT_ADDED"),
            @JsonSubTypes.Type(value = AddNotesEventMetadata.class, name = "ADD_NOTES"),
            @JsonSubTypes.Type(
                    value = AlignerChangeFeedbackAddedEventMetadata.class,
                    name = "ALIGNER_CHANGE_FEEDBACK_ADDED"),
            @JsonSubTypes.Type(value = AlignerChangeEventEventMetadata.class, name = "ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = AlignerCheckInEventMetadata.class, name = "ALIGNER_CHECK_IN"),
            @JsonSubTypes.Type(value = AlignerEditEventMetadata.class, name = "ALIGNER_EDIT"),
            @JsonSubTypes.Type(value = AlignerIssueEventMetadata.class, name = "ISSUE_REPORTED"),
            @JsonSubTypes.Type(
                    value = AlignerProductionOrderReminderEventMetadata.class,
                    name = "ALIGNER_PRODUCTION_ORDER_REMINDER"),
            @JsonSubTypes.Type(value = AppointmentEventMetadata.class, name = "PATIENT_APPOINTMENT_ADDED"),
            @JsonSubTypes.Type(value = BracesJourneyEventMetadata.class, name = "BRACES_JOURNEY_CREATED"),
            @JsonSubTypes.Type(
                    value = DoctorInvitationAcceptedEventMetadata.class,
                    name = "DOCTOR_INVITATION_ACCEPTED"),
            @JsonSubTypes.Type(
                    value = DoctorInvitationReceivedEventMetadata.class,
                    name = "DOCTOR_INVITATION_RECEIVED"),
            @JsonSubTypes.Type(value = EditWearTimeEventMetadata.class, name = "WEAR_DAY_EDIT"),
            @JsonSubTypes.Type(value = ForceAlignerChangeEventEventMetadata.class, name = "FORCE_ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = MessageSentToDoctorEventMetadata.class, name = "MESSAGE_SENT_TO_DOCTOR"),
            @JsonSubTypes.Type(
                    value = NotWearingForRecommendedHoursEventMetadata.class,
                    name = "NOT_WEARING_FOR_RECOMMENDED_HOURS"),
            @JsonSubTypes.Type(
                    value = PatientInvitationAcceptedEventMetadata.class,
                    name = "PATIENT_CONNECTED_WITH_DOCTOR"),
            @JsonSubTypes.Type(
                    value = PatientInvitationDeclinedEventMetadata.class,
                    name = "PATIENT_INVITATION_DECLINED"),
            @JsonSubTypes.Type(
                    value = PatientInvitationReceivedEventMetadata.class,
                    name = "PATIENT_INVITATION_RECEIVED"),
            @JsonSubTypes.Type(
                    value = MissedAlignerChangeDateEventMetadata.class,
                    name = "MISSED_ALIGNER_CHANGED_DATE"),
            @JsonSubTypes.Type(value = PhotosUploadedEventMetadata.class, name = "PHOTOS_UPLOADED"),
            @JsonSubTypes.Type(value = ProductTypeAddedEventMetaData.class, name = "PRODUCT_TYPE_ADDED"),
            @JsonSubTypes.Type(value = RefinementTreatmentEventMetaData.class, name = "REFINEMENT_TREATMENT"),
            @JsonSubTypes.Type(value = TimelineNoteAddedEventMetaData.class, name = "TIMELINE_NOTE_ADDED"),
            @JsonSubTypes.Type(
                    value = TreatmentCreationCompleteEventMetadata.class,
                    name = "TREATMENT_CREATION_COMPLETE"),
            @JsonSubTypes.Type(value = TreatmentDeactivatedEventMetaData.class, name = "TREATMENT_DEACTIVATED"),
            @JsonSubTypes.Type(value = TreatmentPausedEventMetadata.class, name = "TREATMENT_PAUSED"),
            @JsonSubTypes.Type(value = TreatmentPlanAddedEventMetaData.class, name = "TREATMENT_PLAN_ADDED"),
            @JsonSubTypes.Type(value = TreatmentResumedEventMetadata.class, name = "TREATMENT_RESUMED"),
            @JsonSubTypes.Type(value = TreatmentSetupEventMetadata.class, name = "TREATMENT_SETUP"),
            @JsonSubTypes.Type(value = TreatmentStartingEventMetadata.class, name = "TREATMENT_STARTING"),
            @JsonSubTypes.Type(
                    value = TreatmentStartingTomorrowEventMetadata.class,
                    name = "TREATMENT_STARTING_TOMORROW"),
            @JsonSubTypes.Type(value = ReminderEventMetaData.class, name = "REMINDER"),
            @JsonSubTypes.Type(
                    value = AlignerChangeFeedbackAddedByPatientEventMetadata.class,
                    name = "ALIGNER_CHANGE_FEEDBACK_ADDED_BY_DOCTOR"),
            @JsonSubTypes.Type(value = PhotoAddedEventMetadata.class, name = "PHOTO_ADDED_BY_DOCTOR"),
            @JsonSubTypes.Type(
                    value = AlignerChangeValidatedEventEventMetadata.class,
                    name = "ALIGNER_CHANGE_VALIDATED"),
            @JsonSubTypes.Type(value = WearDaysUpdateEventMetaData.class, name = "WEAR_DAYS_UPDATED"),
            @JsonSubTypes.Type(value = MessageSentToPatientEventMetadata.class, name = "MESSAGE_SENT_TO_PATIENT"),
            @JsonSubTypes.Type(value = UpcomingAlignerChangeEventMetaData.class, name = "UPCOMING_ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = PatientAddedPhotoEventMetadata.class, name = "PHOTO_ADDED_BY_PATIENT"),
            @JsonSubTypes.Type(value = ResumeTreatmentReminderEventMetadata.class, name = "RESUME_TREATMENT_REMINDER"),
            @JsonSubTypes.Type(
                    value = UpgradePatientToMobileAppEventMetadata.class,
                    name = "UPGRADE_PATIENT_TO_MOBILE_APP"),
            @JsonSubTypes.Type(value = AppointmentReminderEventMetadata.class, name = "APPOINTMENT_REMINDER"),
            @JsonSubTypes.Type(value = PaymentReminderEventMetadata.class, name = "PAYMENT_REMINDER"),
            @JsonSubTypes.Type(
                    value = CreateRefinementTreatmentEventMetaData.class,
                    name = "CREATE_REFINEMENT_REMINDER"),
            @JsonSubTypes.Type(value = ManualAlignerChangeEventEventMetadata.class, name = "MANUAL_ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = MissingAlignerDataFillEventMetadata.class, name = "PATIENT_FILLED_MISSING_DATA"),
            @JsonSubTypes.Type(
                    value = AlignerCheckInForDoctorEventMetadata.class,
                    name = "ALIGNER_CHECK_IN_FOR_DOCTOR"),
            @JsonSubTypes.Type(value = CalendarEventMetadata.class, name = "CALENDAR_REMINDER"),
            @JsonSubTypes.Type(
                    value = CustomAppointmentReminderAddedEventMetadata.class,
                    name = "PATIENT_APPOINTMENT_REMINDER_ADDED"),
            @JsonSubTypes.Type(
                    value = CustomAppointmentReminderUpdatedEventMetadata.class,
                    name = "PATIENT_APPOINTMENT_REMINDER_UPDATED"),
            @JsonSubTypes.Type(
                    value = CustomAppointmentReminderDeletedEventMetadata.class,
                    name = "PATIENT_APPOINTMENT_REMINDER_DELETED"),
            @JsonSubTypes.Type(
                    value = TreatmentPlanApprovedEventMetadata.class,
                    name = "TREATMENT_PLAN_APPROVED_BY_PATIENT"),
            @JsonSubTypes.Type(
                    value = TreatmentPlanSentForApprovalEventMetadata.class,
                    name = "TREATMENT_PLAN_SENT_FOR_APPROVAL_TO_PATIENT"),
            @JsonSubTypes.Type(value = PatientAddedByPracticeEventMetadata.class, name = "PATIENT_ADDED_BY_PRACTICE"),
            @JsonSubTypes.Type(
                    value = PatientAssignedToPracticeEventMetadata.class,
                    name = "PATIENT_ASSIGNED_TO_PRACTICE"),
            @JsonSubTypes.Type(value = PracticeConnectedEventMetadata.class, name = "PRACTICE_CONNECTED_ORG"),
            @JsonSubTypes.Type(value = NewOrderAddedEventMetadata.class, name = "NEW_ORDER_ADDED"),
            @JsonSubTypes.Type(
                    value = TreatmentPlanSentForApprovalByOrgEventMetadata.class,
                    name = "ORG_SEND_TREATMENT_PLAN_FOR_APPROVAL"),
            @JsonSubTypes.Type(value = ReplanTreamentEventMetadata.class, name = "RE_PLAN_TREATMENT"),
            @JsonSubTypes.Type(value = TreatmentPlanFinalisedEventMetadata.class, name = "PLAN_FINALIZED_BY_PRACTICE"),
            @JsonSubTypes.Type(value = OrderOnHoldEventMetadata.class, name = "ORDER_ON_HOLD"),
            @JsonSubTypes.Type(value = OrderCancelledEventMetadata.class, name = "ORDER_CANCELLED"),
            @JsonSubTypes.Type(value = LabAdminAssignTheOrderMetadata.class, name = "LAB_ADMIN_ASSIGN_ORDER"),
            @JsonSubTypes.Type(value = LabAdminSendStlFilesMetadata.class, name = "LAB_ADMIN_SEND_STL_FILES"),
            @JsonSubTypes.Type(value = LabAdminSendTreatmentPlanMetadata.class, name = "LAB_ADMIN_SEND_TREATMENT_PLAN"),
            @JsonSubTypes.Type(
                    value = ThirdPartyCustomerApproveTreatmentPlanMetadata.class,
                    name = "THIRD_PARTY_CUSTOMER_APPROVE_TREATMENT_PLAN"),
            @JsonSubTypes.Type(
                    value = ThirdPartyCustomerRequestForReplanMetadata.class,
                    name = "THIRD_PARTY_CUSTOMER_REQUEST_RE_PLAN"),
            @JsonSubTypes.Type(
                    value = ThirdPartyCustomerRequestForStlFilesMetadata.class,
                    name = "THIRD_PARTY_CUSTOMER_REQUEST_STL_FILES"),
            @JsonSubTypes.Type(
                    value = ThirdPartyCustomerSendCaseMetadata.class,
                    name = "THIRD_PARTY_CUSTOMER_SEND_CASE"),
            @JsonSubTypes.Type(
                    value = DoctorInvitationRejectedEventMetadata.class,
                    name = "DOCTOR_INVITATION_REJECTED"),
            @JsonSubTypes.Type(value = StlFileApprovedMetadata.class, name = "STL_FILE_APPROVED"),
            @JsonSubTypes.Type(value = CommentAddedOnOrderEventMetadata.class, name = "COMMENT_ADDED_ON_ORDER"),
            @JsonSubTypes.Type(value = ReminderSentToPatientEventMetadata.class, name = "REMINDER_SENT_TO_PATIENT"),
            @JsonSubTypes.Type(value = ManufacturingStartedEventMetadata.class, name = "MANUFACTURING_STARTED"),
            @JsonSubTypes.Type(value = ManufacturingCompletedEventMetadata.class, name = "MANUFACTURING_COMPLETED"),
            @JsonSubTypes.Type(value = ManufacturingInTransitEventMetadata.class, name = "MANUFACTURING_IN_TRANSIT"),
            @JsonSubTypes.Type(value = ManufacturingDeliveredEventMetadata.class, name = "MANUFACTURING_DELIVERED"),
            @JsonSubTypes.Type(value = OrgRequestedNeedMoreInfoMetadata.class, name = "NEED_MORE_INFO_REQUESTED"),
            @JsonSubTypes.Type(
                    value = UpdatedFromNeedMoreInfoToOrderedMetadata.class,
                    name = "UPDATED_FROM_NEED_MORE_INFO_TO_ORDERED"),
            @JsonSubTypes.Type(value = CaseAssignedToYouEventMetadata.class, name = "CASE_ASSIGNED_TO_YOU"),
            @JsonSubTypes.Type(value = NewCommentAddedEventMetadata.class, name = "NEW_COMMENT_ADDED"),
            @JsonSubTypes.Type(value = TreatmentCompletedEventMetadata.class, name = "TREATMENT_COMPLETED"),
            @JsonSubTypes.Type(value = CaseMovedToPlanningEventMetadata.class, name = "CASE_MOVED_TO_PLANNING"),
            @JsonSubTypes.Type(value = CaseMovedToProductionEventMetadata.class, name = "CASE_MOVED_TO_PRODUCTION"),
            @JsonSubTypes.Type(
                    value = CaseReadyToBeginTreatmentEventMetadata.class,
                    name = "CASE_READY_TO_BEGIN_TREATMENT"),
            @JsonSubTypes.Type(value = StatusUpdatedEventMetadata.class, name = "STATUS_UPDATED"),
            @JsonSubTypes.Type(value = RecordsAddedEventMetadata.class, name = "RECORDS_ADDED"),
            @JsonSubTypes.Type(value = PrescriptionAddedEventMetadata.class, name = "PRESCRIPTION_ADDED"),
            @JsonSubTypes.Type(value = PlanningCaseCompletedEventMetadata.class, name = "PLANNING_CASE_COMPLETED"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerPatientOnboardMetadata.class,
                    name = "PLANNING_CUSTOMER_PATIENT_ONBOARDED"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerLabUploadedStlFilesMetadata.class,
                    name = "PLANNING_CUSTOMER_LAB_UPLOADED_STL_FILES"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerCaseCompletedMetadata.class,
                    name = "PLANNING_CUSTOMER_CASE_COMPLETED"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerTreatmentPlanApprovedMetadata.class,
                    name = "PLANNING_CUSTOMER_TREATMENT_PLAN_APPROVED"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerTreatmentPlanRevisionMetadata.class,
                    name = "PLANNING_CUSTOMER_TREATMENT_PLAN_REVISION"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerTreatmentPlanSendForApprovalMetadata.class,
                    name = "PLANNING_CUSTOMER_TREATMENT_PLAN_SENT_FOR_APPROVAL"),
            @JsonSubTypes.Type(
                    value = PlanningCustomerNeedMoreInfoRequestedMetadata.class,
                    name = "PLANNING_CUSTOMER_NEED_MORE_INFO_REQUESTED"),
            @JsonSubTypes.Type(value = PlanningCustomerNewMessageMetadata.class, name = "NEW_MESSAGE"),
            @JsonSubTypes.Type(value = VspCaseAssignedEventMetadata.class, name = "VSP_CASE_ASSIGNED"),
            @JsonSubTypes.Type(value = VspCaseSubmitEventMetadata.class, name = "VSP_CASE_SUBMITTED"),
            @JsonSubTypes.Type(value = VspFileUploadedEventMetadata.class, name = "VSP_FILES_UPLOADED"),
            @JsonSubTypes.Type(value = VspPlanReadyForReviewEventMetadata.class, name = "VSP_PLAN_READY_FOR_REVIEW"),
            @JsonSubTypes.Type(value = VspPlanApprovedEventMetadata.class, name = "VSP_PLAN_APPROVED"),
            @JsonSubTypes.Type(value = VspRevisionRequestedEventMetadata.class, name = "VSP_REVISION_REQUESTED"),
            @JsonSubTypes.Type(value = VspMoreInfoRequiredEventMetadata.class, name = "VSP_MORE_INFORMATION_REQUIRED"),
            @JsonSubTypes.Type(value = VspPlanningCompletedEventMetadata.class, name = "VSP_PLANNING_COMPLETED"),
            @JsonSubTypes.Type(
                    value = VspProductionOrderCreatedEventMetadata.class,
                    name = "VSP_PRODUCTION_ORDER_CREATED"),
            @JsonSubTypes.Type(value = VspOrderShippedEventMetadata.class, name = "VSP_ORDER_SHIPPED"),
            @JsonSubTypes.Type(value = VspOrderDeliveredEventMetadata.class, name = "VSP_ORDER_DELIVERED"),
            @JsonSubTypes.Type(
                    value = VspNewMessageLabToCustomerEventMetadata.class,
                    name = "VSP_NEW_MESSAGE_LAB_TO_CUSTOMER"),
            @JsonSubTypes.Type(
                    value = VspNewMessageCustomerToLabEventMetadata.class,
                    name = "VSP_NEW_MESSAGE_CUSTOMER_TO_LAB")
        })
@Data
public class EventMetadata {
    private final EventMetadataType type;
}
