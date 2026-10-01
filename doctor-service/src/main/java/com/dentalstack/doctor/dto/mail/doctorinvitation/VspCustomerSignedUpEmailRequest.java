package com.dentalstack.doctor.dto.mail.doctorinvitation;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspCustomerSignedUpEmailRequest {

    @JsonProperty("signup_date")
    private String signupDate;

    @JsonProperty("customer_email")
    @NotBlank
    private String customerEmail;

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
