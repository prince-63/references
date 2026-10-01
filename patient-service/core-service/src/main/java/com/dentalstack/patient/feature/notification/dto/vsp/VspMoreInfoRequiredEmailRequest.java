package com.dentalstack.patient.feature.notification.dto.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspMoreInfoRequiredEmailRequest {

    @JsonProperty("product")
    @NotBlank
    private String product;

    @JsonProperty("surgery_date")
    private String surgeryDate;

    @JsonProperty("treatment_plan_instructions")
    private String treatmentPlanInstructions;

    @JsonProperty("plan_needed_by")
    private String planNeededBy;

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

    @JsonProperty("days_to_plan")
    private String daysToPlan;

    @JsonProperty("customer_name")
    @NotBlank
    private String customerName;

    @JsonProperty("surgery_type")
    private String surgeryType;

    @JsonProperty("lab_remarks")
    private String labRemarks;

    @JsonProperty("days_to_surgery")
    private String daysToSurgery;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("org_name")
    @NotBlank
    private String orgName;
}
