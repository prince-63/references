package com.dentalstack.patient.feature.notification.dto.planningcustomer;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CaseCompletedEmailRequest {

    @JsonProperty("practice_location")
    private String practiceLocation;

    @JsonProperty("patient_id")
    private String patientId;

    @JsonProperty("portal_url")
    private String portalUrl;

    @JsonProperty("patient_first_name")
    @JsonAlias({"Patient_first_Name"})
    private String patientFirstName;

    @JsonProperty("patient_last_name")
    @JsonAlias({"Patient_last_Name"})
    private String patientLastName;

    @JsonProperty("email")
    private String email;

    @JsonProperty("org_name")
    private String orgName;
}
