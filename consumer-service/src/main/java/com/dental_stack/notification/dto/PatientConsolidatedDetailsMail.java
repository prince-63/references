package com.dental_stack.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
}
