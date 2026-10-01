package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateShippingDetailsRequest {

    private Long shippingId;
    private String addressedTo;

    private String name;

    private String addressLine;

    private String city;

    private String state;

    private String country;

    private String pincode;
    private String mobileNumber;
    private Long profileId;
}
