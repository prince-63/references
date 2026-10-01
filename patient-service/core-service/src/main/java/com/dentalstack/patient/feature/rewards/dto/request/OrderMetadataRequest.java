package com.dentalstack.patient.feature.rewards.dto.request;

import lombok.Data;

@Data
public class OrderMetadataRequest {
    private String shippingAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
}
