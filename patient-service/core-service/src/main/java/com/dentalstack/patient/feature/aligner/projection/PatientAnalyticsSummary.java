package com.dentalstack.patient.feature.aligner.projection;

import com.dentalstack.patient.feature.doctorinvitation.enums.InvitationStatus;
import com.dentalstack.patient.feature.patient.enums.AppInviteStatus;
import java.time.ZonedDateTime;

public interface PatientAnalyticsSummary {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getEmail();

    String getMobile();

    String getCountryCode();

    String getProfilePictureUrl();

    Long getProfilePictureId();

    String getCustomPatientId();

    String getPracticeLocationName();

    Long getPracticeLocationId();

    Long getAlignerJourneyId();

    String getTreatmentType();

    ZonedDateTime getAlignerEndDate();

    String getCurrentAlignerJawType();

    Integer getCurrentAlignerNumber();

    Integer getTotalAligners();

    String getComplianceStatus();

    Integer getTotalPatients();

    Boolean getIsYourPatient();

    Integer getUnvalidatedCheckins();

    Integer getUnvalidatedAlignerChanges();

    Integer getUnvalidatedIssueReports();

    Integer getTotalUnvalidatedActions();

    String getAssignedUserSalutation();

    String getAssignedUserFirstName();

    String getAssignedUserLastName();

    Short getInvitationStatus();

    Boolean getIsInvitationSent();

    String getAppInviteStatus();

    boolean getHasPerformedActions();

    default InvitationStatus getMappedInvitationStatus() {
        Short statusIndex = getInvitationStatus();
        if (statusIndex == null || statusIndex < 0 || statusIndex >= InvitationStatus.values().length) {
            return null;
        }
        return InvitationStatus.values()[statusIndex];
    }

    default AppInviteStatus getMappedAppInviteStatus() {
        return AppInviteStatus.valueOf(getAppInviteStatus());
    }
}
