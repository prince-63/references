package com.dentalstack.patient.feature.notification.dto;

import com.dentalstack.patient.feature.appointment.projection.AppointmentCounts;
import com.dentalstack.patient.feature.doctor.dto.DoctorDetails;
import com.dentalstack.patient.feature.patient.enums.PendingActionEnum;
import com.dentalstack.patient.feature.treatment.projections.AlignerActionCounts;
import com.dentalstack.patient.feature.treatment.projections.AlignerJourneyCounts;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PatientConsolidatedDetailsMail {
    private int todayAppointments;

    private int tomorrowAppointments;

    private int dayAfterTomorrowAppointments;

    private int treatmentsStartingToday;

    private int treatmentsStartingTomorrow;

    private int missedAlignerChanges;

    private int alignerChangesCompleted;

    private int alignerCheckInMade;

    private int reportedIssues;

    private int pendingTreatmentSelection;

    private int pendingTreatmentPlanFinalization;

    private int pendingTrackingMethodSetup;

    private int pendingPatientConnection;

    private String firstName;

    private String email;

    public static PatientConsolidatedDetailsMail from(
            AppointmentCounts appointmentCounts,
            AlignerJourneyCounts alignerJourneyCounts,
            Map<PendingActionEnum, Integer> pendingActionCounts,
            AlignerActionCounts alignerActionCounts,
            DoctorDetails doctor) {
        return PatientConsolidatedDetailsMail.builder()
                .todayAppointments(
                        appointmentCounts.getTodayAppointments() != null ? appointmentCounts.getTodayAppointments() : 0)
                .tomorrowAppointments(
                        appointmentCounts.getTomorrowAppointments() != null
                                ? appointmentCounts.getTomorrowAppointments()
                                : 0)
                .dayAfterTomorrowAppointments(
                        appointmentCounts.getDayAfterTomorrowAppointments() != null
                                ? appointmentCounts.getDayAfterTomorrowAppointments()
                                : 0)
                .treatmentsStartingToday(
                        alignerJourneyCounts.getTreatmentStartingToday() != null
                                ? alignerJourneyCounts.getTreatmentStartingToday()
                                : 0)
                .treatmentsStartingTomorrow(
                        alignerJourneyCounts.getTreatmentStartingTomorrow() != null
                                ? alignerJourneyCounts.getTreatmentStartingTomorrow()
                                : 0)
                .missedAlignerChanges(
                        alignerJourneyCounts.getMissedAlignerChanges() != null
                                ? alignerJourneyCounts.getMissedAlignerChanges()
                                : 0)
                .pendingTreatmentSelection(pendingActionCounts.getOrDefault(PendingActionEnum.ADD_TREATMENT, 0))
                .pendingTreatmentPlanFinalization(
                        pendingActionCounts.getOrDefault(PendingActionEnum.SET_UP_TREATMENT_PLAN, 0))
                .pendingTrackingMethodSetup(pendingActionCounts.getOrDefault(PendingActionEnum.ADD_TRACKING, 0))
                .pendingPatientConnection(pendingActionCounts.getOrDefault(PendingActionEnum.CONNECT_WITH_PATIENT, 0))
                .alignerChangesCompleted(alignerActionCounts.getAlignerChangesCompleted())
                .alignerCheckInMade(alignerActionCounts.getAlignerCheckInMade())
                .reportedIssues(alignerActionCounts.getReportedIssues())
                .firstName(doctor.getFirstName())
                .email(doctor.getEmail())
                .build();
    }
}
