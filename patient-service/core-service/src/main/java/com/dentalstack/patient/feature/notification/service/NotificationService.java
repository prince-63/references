package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.aligner.dto.aligner.UpdateAlignerJourneyRequest;
import com.dentalstack.patient.feature.aligner.entity.AlignerJourney;
import com.dentalstack.patient.feature.aligner.entity.action.AlignerActionType;
import com.dentalstack.patient.feature.aligner.enums.aligner.Compliance;
import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.notification.dto.OrgWhatsAppDetails;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.enums.ComplianceNotificationCycle;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.user.entity.UserProfile;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public interface NotificationService {

    void askPatientToFillMissingAlignerDetailsNotification(String doctorName, Patient patient, boolean isDrToDisplay);

    void sendNotificationOfInvite(String doctorName, Patient patient, boolean isDrToDisplay);

    void notificationForCancelledInvite(
            String doctorName,
            String mobileNo,
            String email,
            boolean isDrToDisplay,
            String xOrgName,
            Long organizationId);

    void notificationForAcceptedInvite(
            String doctorName, String mobileNumber, String email, Long patientId, Long profileId);

    void treatmentPlanApproved(Patient patient, String doctorEmail, String mobile);

    void notificationForAlignerChangeReminder(AlignerJourney alignerJourney, SendNotificationRequest request);

    void notificationForCompliance(AlignerJourney alignerJourney);

    void notificationForCompliance(
            Patient patient, Compliance compliance, ComplianceNotificationCycle complianceNotificationCycle);

    void notificationForAlignerJourneyUpdates(
            String doctorName,
            UpdateAlignerJourneyRequest.UpdateDetails updateDetails,
            Patient patient,
            boolean isDrToDisplay);

    void currentWearDaysUpdateNotification(
            String doctorName, Patient patient, AlignerJourney alignerJourney, int indexNo, boolean isDrToDisplay);

    void wearDaysUpdateNotification(
            String doctorName,
            Patient patient,
            Boolean isCurrentAligner,
            AlignerJourney alignerJourney,
            int indexNo,
            boolean isDrToDisplay);

    void wearDaysUpdateNotificationFromTracking(
            String doctorName, Boolean isCurrentAligner, AlignerJourney alignerJourney, boolean isDrToDisplay);

    void notificationForMilestones(AlignerJourney alignerJourney);

    void notificationForDailyGoalComplete(Patient patient);

    void notificationForAlignerFeedbackAddedByDoctor(
            Patient patient, AlignerJourney alignerJourney, boolean isDrToDisplay, String displayName);

    void alignerJourneyPaused(String firstName, AlignerJourney alignerJourney, Patient patient, boolean isDrToDisplay);

    void notificationForAlignerAckByDoctor(
            Patient patient, AlignerJourney alignerJourney, boolean isDrToDisplay, String displayName);

    void notificationForMissedAlignerChange(AlignerJourney alignerJourney);

    void notificationForTreatmentStartingToday(AlignerJourney alignerJourney);

    void notificationForFillAlignerMissingDetails(Patient patient, DoctorDetails doctor);

    void commentAddedOnOrderTreatment(
            String orgName, Patient patient, String orderId, String email, String mobile, Long profileId);

    void notificationForNormalCheckIn(
            DoctorDetails doctor,
            Patient patient,
            Long alignerJourneyId,
            Long alignerActionId,
            Long profileId,
            String mobile,
            Long doctorId);

    void notificationForPhotosUploadedByPatient(DoctorDetails doctor, Patient patient);

    void notificationForTreatmentStartingTomorrow(AlignerJourney alignerJourney);

    void sendOneDayPriorReminderOfAlignerChange(AlignerJourney alignerJourney);

    void sendOneDayPriorReminderOfAppointment(AppointmentReminder appointment);

    void sendReminderOfAlignerCheckIn(AlignerJourney alignerJourney);

    void sendPushNotification(Reminder reminder);

    void forceAlignerChangeNotification(Integer previousAlignerNo, int newAlignerNo, Patient patient);

    void pauseAlignerJourneyNotification(String firstName, Patient patient, boolean isDrToDisplay);

    void deactivatedAlignerJourneyNotification(String firstName, Patient patient);

    void resumeAlignerJourneyNotification(String firstName, Patient patient, boolean resumeAlignerJourneyNotification);

    void notifyMoveToPreviousAligner(Patient patient, DoctorDetails doctor, String displayName);

    void notifyAlignerActionValidated(
            Patient patient, DoctorDetails doctor, @NotNull AlignerActionType type, boolean isDrToDisplay);

    void notificationForAlignerFeedbackAddedByPatient(
            DoctorDetails doctor, Patient patient, Long alignerJourneyId, Long alignerActionId);

    void notificationForResumePausedTreatment(
            Patient patient, DoctorDetails doctor, Long alignerJourneyId, OrgWhatsAppDetails orgWhatsAppDetails);

    void notificationForAlignerChangeScheduled(
            Patient patient, DoctorDetails doctorDetails, int srNo, int newAlignerNo, Long alignerJourneyId);

    void notificationForRefinementReminder(Patient patient, DoctorDetails doctor);

    void notificationForAlignerChange(
            UserProfile userProfile,
            Patient patient,
            DoctorDetails doctorDetails,
            int srNo,
            int newAlignerNo,
            Long alignerJourneyId,
            Long alignerActionId,
            Long delayInDays);

    void notificationForIssueReported(
            DoctorDetails doctor,
            Patient patient,
            Long alignerJourneyId,
            Long alignerActionId,
            UserProfile userProfile);

    void notificationForCriticalCheckIn(
            DoctorDetails doctor,
            Patient patient,
            Long alignerJourneyId,
            Long alignerActionId,
            Long profileId,
            Long doctorId);

    void webNotificationEvent(Reminder reminder);

    void sendPatientAppointmentReminder(
            String mobileNo,
            String message,
            String title,
            int notificationIndex,
            Patient patient,
            Long reminderId,
            LocalDate startDate,
            String startTime);

    String getLocalizedMessages(Patient patient, String key, Object[] args);
}
