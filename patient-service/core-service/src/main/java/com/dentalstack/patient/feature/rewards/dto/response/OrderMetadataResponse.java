package com.dentalstack.patient.feature.rewards.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderMetadataResponse {
    private String shippingAddress;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String phoneNumber;
    private String trackingNumber;
    private String courierService;
}
