package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VspCustomerInvitationEmailRequest {

    @JsonProperty("portal_url")
    @NotBlank
    private String portalUrl;

    @JsonProperty("customer_name")
    @NotBlank
    private String customerName;

    @JsonProperty("email")
    @NotBlank
    private String email;

    @JsonProperty("org_name")
    @NotBlank
    private String orgName;

    @JsonProperty("mobile_no")
    private String mobileNo;

    @JsonProperty("whatsapp_enabled")
    private Boolean whatsappEnabled;

    @JsonProperty("invitation_code")
    private String invitationCode;
}
