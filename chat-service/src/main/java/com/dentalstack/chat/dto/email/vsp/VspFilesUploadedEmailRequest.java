package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VspFilesUploadedEmailRequest {

    @JsonProperty("portal_url")
    @NotBlank
    private String portalUrl;

    @JsonProperty("patient_name")
    @NotBlank
    private String patientName;

    @JsonProperty("customer_name")
    @NotBlank
    private String customerName;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("org_name")
    @NotBlank
    private String orgName;
}
