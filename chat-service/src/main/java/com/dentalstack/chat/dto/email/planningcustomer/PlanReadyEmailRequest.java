package com.dentalstack.chat.dto.email.planningcustomer;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PlanReadyEmailRequest {

    @JsonProperty("practice_location")
    private String practiceLocation;

    @JsonProperty("wear_days")
    private String wearDays;

    @JsonProperty("patient_id")
    private String patientId;

    @JsonProperty("series")
    private String series;

    @JsonProperty("portal_url")
    private String portalUrl;

    @JsonProperty("stages")
    private String stages;

    @JsonProperty("patient_first_name")
    @JsonAlias({"Patient_first_Name"})
    private String patientFirstName;

    @JsonProperty("patient_last_name")
    @JsonAlias({"Patient_last_Name"})
    private String patientLastName;

    @JsonProperty("plan_name")
    private String planName;

    @JsonProperty("remarks")
    private String remarks;

    @JsonProperty("email")
    private String email;

    @JsonProperty("org_name")
    private String orgName;
}
