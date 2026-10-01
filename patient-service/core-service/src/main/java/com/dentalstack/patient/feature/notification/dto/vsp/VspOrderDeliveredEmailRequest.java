package com.dentalstack.patient.feature.notification.dto.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VspOrderDeliveredEmailRequest {

    @JsonProperty("product")
    @NotBlank
    private String product;

    @JsonProperty("delivered_on")
    private String deliveredOn;

    @JsonProperty("surgery_date")
    private String surgeryDate;

    @JsonProperty("products_and_quantity")
    private String productsAndQuantity;

    @JsonProperty("user_email_id")
    private String userEmailId;

    @JsonProperty("orthodontist")
    private String orthodontist;

    @JsonProperty("portal_url")
    @NotBlank
    private String portalUrl;

    @JsonProperty("oral_surgeon")
    private String oralSurgeon;

    @JsonProperty("patient_name")
    @NotBlank
    private String patientName;

    @JsonProperty("tracking_number")
    private String trackingNumber;

    @JsonProperty("customer_name")
    @NotBlank
    private String customerName;

    @JsonProperty("shipping_address")
    private String shippingAddress;

    @JsonProperty("shipping_name")
    private String shippingName;

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
