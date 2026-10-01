package com.dentalstack.patient.feature.notification.service;

import com.dentalstack.patient.feature.appointment.entity.AppointmentReminder;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.manufacturing.UnprocessedAlignerData;
import com.dentalstack.patient.feature.notification.dto.SendNotificationRequest;
import com.dentalstack.patient.feature.notification.enums.ComplianceNotificationCycle;
import com.dentalstack.patient.feature.patient.entity.Patient;
import com.dentalstack.patient.feature.reminder.entity.Reminder;
import com.dentalstack.patient.feature.treatment.entity.AlignerJourney;
import com.dentalstack.patient.feature.treatment.enums.Compliance;

public interface NotificationService {

    void notificationForAlignerChangeReminder(AlignerJourney alignerJourney, SendNotificationRequest request);

    void notificationForCompliance(AlignerJourney alignerJourney);

    void notificationForCompliance(
            Patient patient, Compliance compliance, ComplianceNotificationCycle complianceNotificationCycle);

    void notificationForMilestones(AlignerJourney alignerJourney);

    void notificationForTreatmentStartingToday(AlignerJourney alignerJourney);

    void notificationForMissedAlignerChange(AlignerJourney alignerJourney);

    void notificationForUnprocessedAlignerDue(
            Long patientId,
            String email,
            String mobile,
            UnprocessedAlignerData alignerData,
            String patientFirstName,
            String orgName);

    void notificationForPhotosUploadedByPatient(DoctorDetails doctor, Patient patient);

    void notificationForTreatmentStartingTomorrow(AlignerJourney alignerJourney);

    void sendOneDayPriorReminderOfAlignerChange(AlignerJourney alignerJourney);

    void sendOneDayPriorReminderOfAppointment(AppointmentReminder appointment);

    void sendReminderOfAlignerCheckIn(AlignerJourney alignerJourney);

    void sendPushNotification(Reminder reminder);

    void resumeAlignerJourneyNotification(String firstName, Patient patient, boolean resumeAlignerJourneyNotification);

    void notificationForResumePausedTreatment(Patient patient, DoctorDetails doctor, Long alignerJourneyId);

    void notificationForAlignerChangeScheduled(
            Patient patient, DoctorDetails doctorDetails, int srNo, int newAlignerNo, Long alignerJourneyId);

    void notificationForRefinementReminder(Patient patient, DoctorDetails doctor);

    void webNotificationEvent(Reminder reminder);

    String getLocalizedMessages(Patient patient, String key, Object[] args);
}
