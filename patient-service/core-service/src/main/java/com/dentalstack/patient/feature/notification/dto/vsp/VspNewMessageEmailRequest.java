package com.dentalstack.patient.feature.notification.dto.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspNewMessageEmailRequest {

    @JsonProperty("message_sender")
    @NotBlank
    private String messageSender;

    @JsonProperty("user_email_id")
    private String userEmailId;

    @JsonProperty("case_status")
    private String caseStatus;

    @JsonProperty("portal_url")
    @NotBlank
    private String portalUrl;

    @JsonProperty("patient_name")
    @NotBlank
    private String patientName;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("org_name")
    @NotBlank
    private String orgName;
}
