package com.dentalstack.patient.feature.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ShippingDetailsRequest {
    private String addressedTo;
    private String name;
    private String addressLine;
    private String city;
    private String state;
    private String country;
    private String pincode;
    private String mobileNumber;
    private Long shippingId;
    private boolean isDefault;
    private Long profileId;
    private Long customerProfileId;

    public static ShippingDetailsRequest from(ShippingDetails shippingDetails) {
        return ShippingDetailsRequest.builder()
                .addressedTo(shippingDetails.getAddressedTo())
                .name(shippingDetails.getName())
                .addressLine(shippingDetails.getAddressLine())
                .city(shippingDetails.getCity())
                .state(shippingDetails.getState())
                .country(shippingDetails.getCountry())
                .pincode(shippingDetails.getPincode())
                .mobileNumber(shippingDetails.getMobileNumber())
                .isDefault(shippingDetails.isDefault())
                .profileId(shippingDetails.getProfileId())
                .build();
    }
}
