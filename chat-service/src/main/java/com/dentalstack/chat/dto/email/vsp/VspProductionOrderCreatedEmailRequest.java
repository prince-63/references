package com.dentalstack.chat.dto.email.vsp;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VspProductionOrderCreatedEmailRequest {

    @JsonProperty("product")
    @NotBlank
    private String product;

    @JsonProperty("surgery_date")
    private String surgeryDate;

    @JsonProperty("products_and_quantity")
    private String productsAndQuantity;

    @JsonProperty("order_status")
    private String orderStatus;

    @JsonProperty("production_remarks")
    private String productionRemarks;

    @JsonProperty("orthodontist")
    private String orthodontist;

    @JsonProperty("created_on")
    private String createdOn;

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
