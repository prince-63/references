package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VspPlanningCompletedEmailRequest {

    @JsonProperty("product")
    @NotBlank
    private String product;

    @JsonProperty("orthodontist")
    private String orthodontist;

    @JsonProperty("case_status")
    private String caseStatus;

    @JsonProperty("oral_surgeon")
    private String oralSurgeon;

    @JsonProperty("portal_url")
    @NotBlank
    private String portalUrl;

    @JsonProperty("patient_name")
    @NotBlank
    private String patientName;

    @JsonProperty("surgery_date")
    private String surgeryDate;

    @JsonProperty("customer_name")
    @NotBlank
    private String customerName;

    @JsonProperty("surgery_type")
    private String surgeryType;

    @JsonProperty("days_to_surgery")
    private String daysToSurgery;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("org_name")
    @NotBlank
    private String orgName;
}
