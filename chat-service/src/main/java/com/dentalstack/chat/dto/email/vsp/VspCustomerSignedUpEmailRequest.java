package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
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
