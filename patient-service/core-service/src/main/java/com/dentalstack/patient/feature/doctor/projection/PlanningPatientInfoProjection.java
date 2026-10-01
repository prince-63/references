package com.dentalstack.patient.feature.doctor.projection;

public interface PlanningPatientInfoProjection {
    Long getPatientId();

    String getFirstName();

    String getLastName();

    String getProfilePictureUrl();

    Long getProfileImageId();

    String getLabFirstName();

    String getLabLastName();

    String getLabSalutation();
}
