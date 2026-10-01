package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VspRevisionRequestedEmailRequest {

    @JsonProperty("product")
    @NotBlank
    private String product;

    @JsonProperty("surgery_date")
    private String surgeryDate;

    @JsonProperty("revision_request_target")
    private String revisionRequestTarget;

    @JsonProperty("plan_name")
    private String planName;

    @JsonProperty("user_email_id")
    private String userEmailId;

    @JsonProperty("orthodontist")
    private String orthodontist;

    @JsonProperty("case_status")
    private String caseStatus;

    @JsonProperty("portal_url")
    @NotBlank
    private String portalUrl;

    @JsonProperty("oral_surgeon")
    private String oralSurgeon;

    @JsonProperty("patient_name")
    @NotBlank
    private String patientName;

    @JsonProperty("customer_remarks")
    private String customerRemarks;

    @JsonProperty("customer_name")
    @NotBlank
    private String customerName;

    @JsonProperty("surgery_type")
    private String surgeryType;

    @JsonProperty("plan_status")
    private String planStatus;

    @JsonProperty("days_to_surgery")
    private String daysToSurgery;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("org_name")
    @NotBlank
    private String orgName;
}
