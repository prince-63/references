package com.dentalstack.patient.feature.events.metadata.event;

import com.dentalstack.patient.feature.events.metadata.RefinementTreatmentEventMetaData;
import com.dentalstack.patient.feature.events.metadata.TreatmentPausedEventMetadata;
import com.dentalstack.patient.feature.events.metadata.calendar.CalendarEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.erp.PatientAddedByPracticeEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.erp.PatientAssignedToPracticeEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.erp.PracticeConnectedEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.order.NewOrderAddedEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.order.OrderCancelledEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.order.OrderOnHoldEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.treatement.ReplanTreamentEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.treatement.TreatmentPlanFinalisedEventMetadata;
import com.dentalstack.patient.feature.events.metadata.event.treatement.TreatmentPlanSentForApprovalByOrgEventMetadata;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = AlignerChangeEventEventMetadata.class, name = "ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = AppointmentEventMetadata.class, name = "PATIENT_APPOINTMENT_ADDED"),
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
            @JsonSubTypes.Type(value = PhotoAddedEventMetadata.class, name = "PHOTO_ADDED_BY_DOCTOR"),
            @JsonSubTypes.Type(
                    value = AlignerChangeValidatedEventEventMetadata.class,
                    name = "ALIGNER_CHANGE_VALIDATED"),
            @JsonSubTypes.Type(value = MessageSentToPatientEventMetadata.class, name = "MESSAGE_SENT_TO_PATIENT"),
            @JsonSubTypes.Type(value = UpcomingAlignerChangeEventMetaData.class, name = "UPCOMING_ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = PatientAddedPhotoEventMetadata.class, name = "PHOTO_ADDED_BY_PATIENT"),
            @JsonSubTypes.Type(value = ResumeTreatmentReminderEventMetadata.class, name = "RESUME_TREATMENT_REMINDER"),
            @JsonSubTypes.Type(value = AppointmentReminderEventMetadata.class, name = "APPOINTMENT_REMINDER"),
            @JsonSubTypes.Type(value = PaymentReminderEventMetadata.class, name = "PAYMENT_REMINDER"),
            @JsonSubTypes.Type(
                    value = CreateRefinementTreatmentEventMetaData.class,
                    name = "CREATE_REFINEMENT_REMINDER"),
            @JsonSubTypes.Type(value = ManualAlignerChangeEventEventMetadata.class, name = "MANUAL_ALIGNER_CHANGE"),
            @JsonSubTypes.Type(value = MissingAlignerDataFillEventMetadata.class, name = "PATIENT_FILLED_MISSING_DATA"),
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
            @JsonSubTypes.Type(
                    value = AlignerProductionOrderReminderEventMetadata.class,
                    name = "ALIGNER_PRODUCTION_ORDER_REMINDER"),
        })
@Data
public class EventMetadata {
    private final EventMetadataType type;
}
