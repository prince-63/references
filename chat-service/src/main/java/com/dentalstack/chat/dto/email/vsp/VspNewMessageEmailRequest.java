package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
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
