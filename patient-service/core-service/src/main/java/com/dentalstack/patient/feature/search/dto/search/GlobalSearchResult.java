package com.dentalstack.patient.feature.search.dto.search;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.AllArgsConstructor;
import lombok.Data;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes(
        value = {
            @JsonSubTypes.Type(value = PatientDetailsSearchResult.class, name = "PATIENT_DETAILS"),
            @JsonSubTypes.Type(value = PatientLeadDetailsSearchResult.class, name = "PATIENT_LEAD_DETAILS"),
            @JsonSubTypes.Type(value = PracticeLocationSearchResult.class, name = "DOCTOR_PRACTICE_LOCATION"),
            @JsonSubTypes.Type(value = DoctorInvitationSearchResult.class, name = "DOCTOR_INVITATION")
        })
@Data
@AllArgsConstructor
public class GlobalSearchResult {
    private final ResultType type;

    public enum ResultType {
        PATIENT_DETAILS,
        PATIENT_LEAD_DETAILS,
        DOCTOR_PRACTICE_LOCATION,
        DOCTOR_INVITATION
    }
}
